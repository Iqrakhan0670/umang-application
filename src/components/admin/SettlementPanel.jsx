import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

const SUCCESS_FEE_RATE = 0.10;

export default function SettlementPanel({ claim, onUpdated }) {
  const [recoveredAmount, setRecoveredAmount] = useState(claim.recovered_amount || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const computedFee = recoveredAmount ? (Number(recoveredAmount) * SUCCESS_FEE_RATE).toFixed(2) : "0.00";

  useEffect(() => {
    supabase
      .from("payment_transactions")
      .select("*")
      .eq("claim_id", claim.id)
      .eq("payment_type", "success_fee")
      .order("created_at", { ascending: false })
      .then(({ data }) => setTransactions(data || []));
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

  return (
    <div style={{ marginTop: "1rem", borderTop: "1px solid #ddd", paddingTop: "1rem" }}>
      <h4>Settlement</h4>

      {claim.status !== "recovered" && !claim.recovered_amount ? (
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Recovered amount (₹)
            <input
              type="number"
              min="0"
              step="0.01"
              value={recoveredAmount}
              onChange={(e) => setRecoveredAmount(e.target.value)}
              style={{ display: "block", marginTop: "0.25rem" }}
            />
          </label>
          <p>10% success fee: ₹{computedFee}</p>
          <button onClick={handleMarkRecovered} disabled={saving}>
            {saving ? "Saving…" : "Mark as Recovered & Set Fee"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      ) : (
        <div>
          <p>Recovered: ₹{claim.recovered_amount}</p>
          <p>Success fee due: ₹{claim.success_fee_amount}</p>
          <p>Success fee status: {claim.success_fee_paid ? "✓ Paid" : "Pending payment from user"}</p>
        </div>
      )}

      {transactions.length > 0 && (
        <table style={{ marginTop: "1rem", width: "100%", fontSize: "0.85rem" }}>
          <thead>
            <tr><th>Date</th><th>Amount</th><th>Gateway</th><th>Status</th><th>Payment ID</th></tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.created_at).toLocaleString("en-IN")}</td>
                <td>₹{t.amount}</td>
                <td>{t.gateway}</td>
                <td>{t.status}</td>
                <td>{t.gateway_payment_id || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}