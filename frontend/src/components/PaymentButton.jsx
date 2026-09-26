import React, { useState } from "react";
import { startRazorpayPayment } from "../lib/mockPayment";

export default function PaymentButton({ claimId, paymentType, amount, user, onPaid }) {
  const [status, setStatus] = useState("idle"); // idle | processing | failed | paid
  const [error, setError] = useState(null);

  const label =
    paymentType === "assistance_fee"
      ? `Pay ₹${amount} Claim Assistance Fee`
      : `Pay ₹${amount} Success Fee`;

  const handlePay = () => {
    setStatus("processing");
    setError(null);

    startRazorpayPayment({
      claimId,
      paymentType,
      amount,
      user,
      onSuccess: async ({ paymentId }) => {
        setStatus("paid");
        onPaid?.(paymentId);
      },
      onFailure: (err) => {
        setStatus("failed");
        setError(err.message || "Payment did not go through");
      },
    });
  };

  if (status === "paid") {
    return <div className="text-sm text-pine">✓ Payment received</div>;
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={status === "processing"}
        className="bg-pine text-parchment px-4 py-2.5 text-sm font-medium hover:bg-pine-light transition disabled:opacity-50"
      >
        {status === "processing" ? "Opening payment…" : status === "failed" ? "Retry payment" : label}
      </button>
      {status === "failed" && (
        <p className="text-xs text-clay mt-2" role="alert">
          {error}. You can retry — you won't be charged twice.
        </p>
      )}
    </div>
  );
}