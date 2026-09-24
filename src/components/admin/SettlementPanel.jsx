import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { CheckCircle2, Clock, AlertTriangle, Receipt } from "lucide-react";

const SUCCESS_FEE_RATE = 0.1;

const TXN_STATUS_COLORS = {
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed: "bg-white text-gray-600 border-gray-300",
};

function TxnBadge({ status }) {
  const cls = TXN_STATUS_COLORS[status?.toLowerCase()] || "bg-emerald-50 text-gray-500 border-gray-200";
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      {status}
    </span>
  );
}

export default function SettlementPanel({ claim, onUpdated }) {
  const [recoveredAmount, setRecoveredAmount] = useState(claim.recovered_amount || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(true);

  const computedFee = recoveredAmount ? (Number(recoveredAmount) * SUCCESS_FEE_RATE).toFixed(2) : "0.00";

  useEffect(() => {
    setLoadingTxns(true);
    supabase
      .from("payment_transactions")
      .select("*")
      .eq("claim_id", claim.id)
      .eq("payment_type", "success_fee")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTransactions(data || []);
        setLoadingTxns(false);
      });
  }, [claim.id]);

  async function handleMarkRecovered() {
    setError(null);
    if (!recoveredAmount || Number(recoveredAmount) <= 0) {
      setError("Enter a valid recovered amount");
      return;
    }

    setSaving(true);
    try {
      const { error: updateErr } = await supabase
        .from("claim_requests")
        .update({
          status: "recovered",
          recovered_amount: Number(recoveredAmount),
          recovered_at: new Date().toISOString(),
          success_fee_amount: Number(computedFee),
          status_note: `Recovered ₹${recoveredAmount}. Success fee of ₹${computedFee} (10%) now due.`,
        })
        .eq("id", claim.id);

      if (updateErr) throw updateErr;
      onUpdated?.();
    } catch (err) {
      setError(err.message || "Could not save settlement");
    } finally {
      setSaving(false);
    }
  }

  const alreadyRecovered = claim.status === "recovered" || claim.recovered_amount;

  return (
    <div className="border-t border-gray-200 pt-4 mt-2">
      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Receipt size={14} className="text-gray-500" />
        Settlement
      </h4>

      {!alreadyRecovered ? (
        <div className="max-w-sm">
          <label className="block text-sm text-gray-500 mb-1">Recovered amount (₹)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={recoveredAmount}
            onChange={(e) => setRecoveredAmount(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-200 bg-white px-3 py-2 text-sm rounded-md mb-2"
          />
          <p className="text-sm text-gray-500 mb-3">
            10% success fee: <span className="font-medium text-gray-900">₹{computedFee}</span>
          </p>
          <button
            onClick={handleMarkRecovered}
            disabled={saving}
            className="bg-emerald-600 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-emerald-500 transition disabled:opacity-50"
          >
            {saving ? "Saving…" : "Mark as Recovered & Set Fee"}
          </button>
          {error && (
            <div className="flex items-center gap-2 text-emerald-700 text-sm mt-3">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-3 max-w-lg">
          <div className="border border-gray-200 rounded-md p-3">
            <p className="text-xs text-gray-500 mb-1">Recovered</p>
            <p className="text-sm font-medium text-gray-900">₹{claim.recovered_amount}</p>
          </div>
          <div className="border border-gray-200 rounded-md p-3">
            <p className="text-xs text-gray-500 mb-1">Success fee due</p>
            <p className="text-sm font-medium text-gray-900">₹{claim.success_fee_amount}</p>
          </div>
          <div className="border border-gray-200 rounded-md p-3 flex flex-col justify-between">
            <p className="text-xs text-gray-500 mb-1">Fee status</p>
            {claim.success_fee_paid ? (
              <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                <CheckCircle2 size={14} /> Paid
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-emerald-700 font-medium">
                <Clock size={14} /> Pending from user
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-5">
        <p className="text-xs font-medium text-gray-500 mb-2">Payment transactions</p>
        {loadingTxns ? (
          <div className="h-8 bg-emerald-50 animate-pulse rounded-md max-w-md" />
        ) : transactions.length === 0 ? (
          <p className="text-xs text-gray-400">No success-fee transactions yet.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="w-full text-xs min-w-[480px]">
              <thead>
                <tr className="bg-emerald-50 text-left">
                  <th className="p-2 font-medium">Date</th>
                  <th className="p-2 font-medium">Amount</th>
                  <th className="p-2 font-medium">Gateway</th>
                  <th className="p-2 font-medium">Status</th>
                  <th className="p-2 font-medium">Payment ID</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-t border-gray-100">
                    <td className="p-2 text-gray-500">{new Date(t.created_at).toLocaleString("en-IN")}</td>
                    <td className="p-2 text-gray-900">₹{t.amount}</td>
                    <td className="p-2 text-gray-500">{t.gateway}</td>
                    <td className="p-2">
                      <TxnBadge status={t.status} />
                    </td>
                    <td className="p-2 text-gray-500">{t.gateway_payment_id || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}