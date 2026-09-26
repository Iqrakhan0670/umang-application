import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import Razorpay from "razorpay";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());

// ---- Clients ----
// Razorpay is optional for now (real keys not set up yet).
// Server will still run and /api/chat will still work even without them.
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn("Razorpay keys not set — payment routes will return an error until keys are added.");
}

const supabaseAdmin =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

if (!supabaseAdmin) {
  console.warn("Supabase keys not set — payment/claim routes needing DB will return an error.");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// =====================================================
// 1. CHAT (Groq AI) — /api/chat
// =====================================================
app.post("/api/chat", express.json(), async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: "Please type a question." });
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            "You are UMANG Help Assistant. UMANG helps users find and claim unclaimed money from banks, mutual funds, and insurance policies. There is a one-time ₹299 Claim Assistance Fee charged when a claim is started, and a 10% success fee that applies only if the money is actually recovered. Searching is always free. Claim status can be checked from Home → Your claims → View details. If unsure, tell the user to request a call from the Results page. Keep answers short and friendly.",
        },
        { role: "user", content: message },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content || "Sorry, I don't have an answer for that.";
    res.json({ reply });
  } catch (err) {
    console.error("Groq API error:", err);
    res.status(500).json({ reply: "Sorry, something went wrong. Please try again." });
  }
});

// =====================================================
// 2. CREATE RAZORPAY ORDER — /api/create-razorpay-order
// =====================================================
app.post("/api/create-razorpay-order", express.json(), async (req, res) => {
  if (!razorpay || !supabaseAdmin) {
    return res.status(503).json({ error: "Payment system is not configured yet." });
  }
  try {
    const { claimId, paymentType, amount } = req.body;

    if (!claimId || !paymentType || !amount) {
      return res
        .status(400)
        .json({ error: "claimId, paymentType and amount are required" });
    }
    if (!["assistance_fee", "success_fee"].includes(paymentType)) {
      return res.status(400).json({ error: "Invalid paymentType" });
    }

    const { data: claim, error: claimErr } = await supabaseAdmin
      .from("claim_requests")
      .select("id, user_id")
      .eq("id", claimId)
      .single();

    if (claimErr || !claim) {
      return res.status(404).json({ error: "Claim not found" });
    }

    const amountPaise = Math.round(Number(amount) * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `${paymentType}_${claimId}`.slice(0, 40),
      notes: { claimId, paymentType },
    });

    const { data: txn, error: txnErr } = await supabaseAdmin
      .from("payment_transactions")
      .insert({
        claim_id: claimId,
        user_id: claim.user_id,
        payment_type: paymentType,
        amount: amount,
        gateway: "razorpay",
        gateway_order_id: order.id,
        status: "created",
      })
      .select()
      .single();

    if (txnErr) {
      console.error("Failed to record payment_transactions row", txnErr);
      return res.status(500).json({ error: "Could not record transaction" });
    }

    return res.status(200).json({
      orderId: order.id,
      amountPaise,
      keyId: process.env.RAZORPAY_KEY_ID,
      transactionId: txn.id,
    });
  } catch (err) {
    console.error("create-razorpay-order error", err);
    return res.status(500).json({ error: "Could not create order" });
  }
});

// =====================================================
// 3. VERIFY RAZORPAY PAYMENT — /api/verify-razorpay-payment
// =====================================================
app.post("/api/verify-razorpay-payment", express.json(), async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: "Database is not configured yet." });
  }
  try {
    const { transactionId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (
      !transactionId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const verified = expectedSignature === razorpay_signature;

    if (verified) {
      await supabaseAdmin
        .from("payment_transactions")
        .update({
          status: "paid",
          gateway_payment_id: razorpay_payment_id,
          gateway_signature: razorpay_signature,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId);
    } else {
      await supabaseAdmin
        .from("payment_transactions")
        .update({
          status: "failed",
          failure_reason: "Signature verification failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId);
    }

    return res.status(200).json({ verified });
  } catch (err) {
    console.error("verify-razorpay-payment error", err);
    return res.status(500).json({ error: "Verification failed" });
  }
});

// =====================================================
// 4. RAZORPAY WEBHOOK — /api/razorpay-webhook
//    NOTE: needs RAW body (not JSON-parsed) for signature check
// =====================================================
app.post(
  "/api/razorpay-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: "Database is not configured yet." });
    }
    const rawBody = req.body; // Buffer, thanks to express.raw
    const signature = req.headers["x-razorpay-signature"];

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expected !== signature) {
      console.warn("Razorpay webhook: signature mismatch — rejecting");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(rawBody.toString());

    try {
      if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;
        await supabaseAdmin
          .from("payment_transactions")
          .update({
            status: "paid",
            gateway_payment_id: payment.id,
            updated_at: new Date().toISOString(),
          })
          .eq("gateway_order_id", payment.order_id);
      } else if (event.event === "payment.failed") {
        const payment = event.payload.payment.entity;
        const { data: existing } = await supabaseAdmin
          .from("payment_transactions")
          .select("id, attempt_count")
          .eq("gateway_order_id", payment.order_id)
          .single();

        await supabaseAdmin
          .from("payment_transactions")
          .update({
            status: "failed",
            failure_reason: payment.error_description || "Payment failed at gateway",
            attempt_count: (existing?.attempt_count || 1) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("gateway_order_id", payment.order_id);
      }

      return res.status(200).json({ received: true });
    } catch (err) {
      console.error("razorpay-webhook processing error", err);
      return res.status(200).json({ received: true, warning: "processing error logged" });
    }
  }
);

// =====================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));