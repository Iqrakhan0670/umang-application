import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// Per-claim settlement panel: set the 10% success fee amount and mark it paid
// once collected. Shown when the admin clicks "Settle" on a recovered claim.

export default function SettlementPanel({ claim, onUpdated }) {
  const [successFeeAmount, setSuccessFeeAmount] = useState(claim.success_fee_amount || "");
  const [saving, setSaving] = useState(false);

  const recoveredAmount = Number(claim.recovered_amount || 0);
  const suggestedFee = recoveredAmount > 0 ? Math.round(recoveredAmount * 0.1) : 0;

  async function handleSaveFee() {
    setSaving(true);
    const { error } = await supabase
      .from("claim_requests")
      .update({ success_fee_amount: successFeeAmount === "" ? null : Number(successFeeAmount) })
      .eq("id", claim.id);
    setSaving(false);
    if (error) {
      alert("Failed to save success fee: " + error.message);
      return;
    }
    onUpdated && onUpdated();
  }

  async function toggleFeePaid() {
    setSaving(true);
    const { error } = await supabase
      .from("claim_requests")
      .update({ success_fee_paid: !claim.success_fee_paid })
      .eq("id", claim.id);
    setSaving(false);
    if (error) {
      alert("Failed to update payment status: " + error.message);
      return;
    }
    onUpdated && onUpdated();
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
        Settlement
      </h4>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1.5">
            Recovered amount
          </label>
          <p className="text-sm font-semibold text-gray-900">
            ₹{recoveredAmount.toLocaleString("en-IN")}
          </p>
          {recoveredAmount === 0 && (
            <p className="text-[11px] text-gray-400 mt-1">
              Set the recovered amount in the claims table first.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1.5">
            Success fee (10% suggested: ₹{suggestedFee.toLocaleString("en-IN")})
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={successFeeAmount}
              onChange={(e) => setSuccessFeeAmount(e.target.value)}
              placeholder={suggestedFee > 0 ? String(suggestedFee) : "—"}
              className="flex-1 border border-gray-200 bg-white px-2 py-1.5 text-sm rounded-md"
            />
            <button
              onClick={handleSaveFee}
              disabled={saving}
              className="text-xs bg-emerald-950 text-white px-3 py-1.5 rounded-md hover:bg-emerald-900 transition disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div>
          <p className="text-xs text-gray-500">
            Agreement:{" "}
            <span className={claim.agreement_accepted ? "text-emerald-600" : "text-gray-500"}>
              {claim.agreement_accepted ? "Accepted" : "Pending"}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Success fee status:{" "}
            <span className={claim.success_fee_paid ? "text-emerald-600" : "text-amber-600"}>
              {claim.success_fee_paid ? "Paid" : "Pending"}
            </span>
          </p>
        </div>
        <button
          onClick={toggleFeePaid}
          disabled={saving}
          className={`text-xs px-3 py-1.5 rounded-md border transition disabled:opacity-50 ${
            claim.success_fee_paid
              ? "border-amber-200 text-amber-700 hover:bg-amber-50"
              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          {claim.success_fee_paid ? "Mark as unpaid" : "Mark fee as paid"}
        </button>
      </div>
    </div>
  );
}