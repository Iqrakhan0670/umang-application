import { supabase } from "./supabaseClient";
 
function fakeQrSvg() {
  // Deterministic-looking random grid so it reads as a QR code at a glance.
  let cells = "";
  const size = 21;
  const cell = 8;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const isFinder =
        (x < 7 && y < 7) || (x > size - 8 && y < 7) || (x < 7 && y > size - 8);
      const on = isFinder
        ? (x % 6 === 0 || y % 6 === 0 || (x > 1 && x < 5 && y > 1 && y < 5))
        : Math.random() > 0.55;
      if (on) {
        cells += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="#1b4332"/>`;
      }
    }
  }
  const px = size * cell;
  return `<svg width="180" height="180" viewBox="0 0 ${px} ${px}" xmlns="http://www.w3.org/2000/svg" style="background:#fff">${cells}</svg>`;
}
 
function buildModal({ amount, paymentType }) {
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:9999;font-family:inherit;padding:16px;";
 
  const card = document.createElement("div");
  card.style.cssText =
    "background:#fdfcf7;border-radius:14px;max-width:340px;width:100%;padding:28px 24px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);";
 
  const label = paymentType === "assistance_fee" ? "Claim Assistance Fee" : "Success Fee";
 
  card.innerHTML = `
    <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#8a8578;margin-bottom:4px;">
      TEST MODE — no real payment
    </div>
    <div style="font-weight:700;font-size:18px;color:#1b4332;margin-bottom:2px;">Scan to Pay</div>
    <div style="font-size:13px;color:#6b6a63;margin-bottom:16px;">${label} · ₹${amount}</div>
    <div style="display:flex;justify-content:center;margin-bottom:14px;">
      <div id="mock-qr" style="border:6px solid #1b4332;border-radius:10px;overflow:hidden;line-height:0;">
        ${fakeQrSvg()}
      </div>
    </div>
    <div id="mock-status" style="font-size:13px;color:#6b6a63;margin-bottom:18px;">
      Waiting for payment confirmation…
    </div>
    <div style="display:flex;gap:10px;">
      <button id="mock-fail" style="flex:1;padding:9px 0;border-radius:999px;border:1px solid #c8552d;color:#c8552d;background:transparent;font-size:12px;cursor:pointer;">
        Simulate failure
      </button>
      <button id="mock-success" style="flex:1;padding:9px 0;border-radius:999px;border:none;background:#1b4332;color:#fdfcf7;font-size:12px;cursor:pointer;">
        Simulate success
      </button>
    </div>
  `;
 
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  return overlay;
}
 
export async function startRazorpayPayment({ claimId, paymentType, amount, user, onSuccess, onFailure }) {
  if (!["assistance_fee", "success_fee"].includes(paymentType)) {
    onFailure?.(new Error("Invalid payment type"));
    return;
  }
 
  const overlay = buildModal({ amount, paymentType });
  const statusEl = overlay.querySelector("#mock-status");
  const successBtn = overlay.querySelector("#mock-success");
  const failBtn = overlay.querySelector("#mock-fail");
 
  let settled = false;
  let autoTimer = null;
 
  const cleanup = () => {
    clearTimeout(autoTimer);
    overlay.remove();
  };
 
  const finishSuccess = async () => {
    if (settled) return;
    settled = true;
    statusEl.textContent = "Confirming…";
    successBtn.disabled = true;
    failBtn.disabled = true;
 
    const fakePaymentId = `mock_pay_${Date.now()}`;
    const fakeOrderId = `mock_order_${Date.now()}`;
 
    try {
      const updatePatch =
        paymentType === "assistance_fee"
          ? { assistance_fee_paid: true }
          : { success_fee_paid: true };
 
      const { error: claimErr } = await supabase
        .from("claim_requests")
        .update(updatePatch)
        .eq("id", claimId);
      if (claimErr) throw claimErr;
 
      // Best-effort transaction log — table may not exist in every environment yet.
      await supabase.from("payment_transactions").insert({
        claim_id: claimId,
        user_id: user?.id || null,
        payment_type: paymentType,
        amount,
        gateway: "mock",
        gateway_order_id: fakeOrderId,
        gateway_payment_id: fakePaymentId,
        status: "paid",
      }).then(({ error }) => {
        if (error) console.warn("mock payment: could not log payment_transactions row", error.message);
      });
 
      cleanup();
      onSuccess?.({ paymentId: fakePaymentId, orderId: fakeOrderId });
    } catch (err) {
      cleanup();
      onFailure?.(err);
    }
  };
 
  const finishFailure = () => {
    if (settled) return;
    settled = true;
    cleanup();
    onFailure?.(new Error("Payment failed (simulated)"));
  };
 
  successBtn.addEventListener("click", finishSuccess);
  failBtn.addEventListener("click", finishFailure);
 
  // Auto-succeed after a few seconds so the flow can also be tested hands-off.
  autoTimer = setTimeout(finishSuccess, 4000);
}
 