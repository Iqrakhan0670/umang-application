// api/razorpay-webhook.js
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import getRawBody from "raw-body";

export const config = {
  api: { bodyParser: false },
};

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const rawBody = await getRawBody(req);
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