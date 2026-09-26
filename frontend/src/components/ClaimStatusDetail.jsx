import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import DocumentUpload from "./DocumentUpload";
import PaymentButton from "./PaymentButton";

const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under Review",
  documents_pending: "Documents Required",
  filed_with_authority: "Filed with Authority",
  recovered: "Money Recovered",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const STATUS_ORDER = ["submitted", "under_review", "documents_pending", "filed_with_authority", "recovered"];

export default function ClaimStatusDetail({ claimId, user }) {
  const [claim, setClaim] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClaim();

    const channel = supabase
      .channel(`claim-${claimId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "claim_requests", filter: `id=eq.${claimId}` },
        () => loadClaim()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [claimId]);

  async function loadClaim() {
    setLoading(true);
    const { data: claimData } = await supabase
      .from("claim_requests")
      .select("*")
      .eq("id", claimId)
      .single();

    const { data: historyData } = await supabase
      .from("claim_status_history")
      .select("*")
      .eq("claim_id", claimId)
      .order("changed_at", { ascending: true });

    setClaim(claimData);
    setHistory(historyData || []);
    setLoading(false);
  }

  if (loading) return <p className="text-stone text-sm">Loading claim status…</p>;
  if (!claim) return <p className="text-stone text-sm">Claim not found.</p>;

  const currentIndex = STATUS_ORDER.indexOf(claim.status);
  const isTerminalBad = claim.status === "rejected" || claim.status === "cancelled";

  return (
    <div>
      <h2 className="font-serif text-2xl text-ink mb-4">Claim Status</h2>

      {!isTerminalBad ? (
        <ol className="space-y-1 text-sm mb-4">
          {STATUS_ORDER.map((s, i) => (
            <li
              key={s}
              className={i <= currentIndex ? "text-pine font-medium" : "text-stone"}
            >
              {i <= currentIndex ? "✓ " : "○ "}{STATUS_LABELS[s]}
            </li>
          ))}
        </ol>
      ) : (
        <div className="text-sm text-clay mb-4">
          Status: <strong>{STATUS_LABELS[claim.status]}</strong>
          {claim.status_note && <p className="mt-1">{claim.status_note}</p>}
        </div>
      )}

      {claim.documents_required?.length > 0 && (
        <div className="text-sm bg-brass/10 text-brass px-3 py-2 mb-4">
          <strong>Documents needed:</strong> {claim.documents_required.join(", ")}
        </div>
      )}

      <DocumentUpload claimId={claimId} userId={user.id} />

      {claim.status === "recovered" && claim.success_fee_amount && !claim.success_fee_paid && (
        <div className="mt-6 border-t border-ink/10 pt-5">
          <p className="text-sm text-stone mb-3">
            ₹{claim.recovered_amount} has been recovered. Your 10% success fee
            (₹{claim.success_fee_amount}) is now due as agreed.
          </p>
          <PaymentButton
            claimId={claimId}
            paymentType="success_fee"
            amount={claim.success_fee_amount}
            user={user}
            onPaid={loadClaim}
          />
        </div>
      )}

      {claim.success_fee_paid && (
        <div className="mt-6 text-sm text-pine border-t border-ink/10 pt-5">
          ✓ Success fee settled. This claim is complete.
        </div>
      )}

      {history.length > 0 && (
        <details className="mt-6 text-sm">
          <summary className="cursor-pointer text-stone">Full history</summary>
          <ul className="mt-2 space-y-1 text-stone">
            {history.map((h) => (
              <li key={h.id}>
                {new Date(h.changed_at).toLocaleString("en-IN")}: {STATUS_LABELS[h.old_status] || "Created"} →{" "}
                {STATUS_LABELS[h.new_status]}
                {h.note && ` — ${h.note}`}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}