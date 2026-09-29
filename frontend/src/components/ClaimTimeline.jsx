import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const STATUS_LABELS = {
  submitted: "Submitted",
  under_review: "Under Review",
  documents_pending: "Documents Required",
  filed_with_authority: "Filed with Authority",
  recovered: "Money Recovered",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

// Combines claim_status_history + claim_documents into one chronological feed.
// Used on both the user's ClaimStatusDetail page and the admin claim expand panel.
export default function ClaimTimeline({ claimId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();

    const channel = supabase
      .channel(`claim-timeline-${claimId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "claim_status_history", filter: `claim_id=eq.${claimId}` },
        () => loadEvents()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "claim_documents", filter: `claim_id=eq.${claimId}` },
        () => loadEvents()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [claimId]);

  async function loadEvents() {
    setLoading(true);

    const { data: history } = await supabase
      .from("claim_status_history")
      .select("*")
      .eq("claim_id", claimId)
      .order("changed_at", { ascending: true });

    const { data: docs } = await supabase
      .from("claim_documents")
      .select("*")
      .eq("claim_id", claimId)
      .order("uploaded_at", { ascending: true });

    const statusEvents = (history || []).map((h) => ({
      type: "status",
      at: h.changed_at,
      title: h.old_status
        ? `Status changed: ${STATUS_LABELS[h.old_status] || h.old_status} → ${STATUS_LABELS[h.new_status] || h.new_status}`
        : `Claim submitted`,
      note: h.note,
    }));

    const docEvents = [];
    (docs || []).forEach((d) => {
      docEvents.push({
        type: "doc_uploaded",
        at: d.uploaded_at,
        title: `Document uploaded: ${d.doc_type}`,
        note: d.file_name,
      });
      if (d.verified === true && d.verified_at) {
        docEvents.push({
          type: "doc_approved",
          at: d.verified_at,
          title: `Document approved: ${d.doc_type}`,
          note: null,
        });
      } else if (d.verified === false && d.rejection_reason && d.verified_at) {
        docEvents.push({
          type: "doc_rejected",
          at: d.verified_at,
          title: `Document rejected: ${d.doc_type}`,
          note: d.rejection_reason,
        });
      }
    });

    const combined = [...statusEvents, ...docEvents]
      .filter((e) => e.at)
      .sort((a, b) => new Date(a.at) - new Date(b.at));

    setEvents(combined);
    setLoading(false);
  }

  if (loading) {
    return <p className="text-xs text-gray-400">Loading timeline…</p>;
  }

  if (events.length === 0) {
    return <p className="text-xs text-gray-400">No activity recorded yet.</p>;
  }

  const dotStyle = {
    status: "bg-emerald-600",
    doc_uploaded: "bg-sky-500",
    doc_approved: "bg-emerald-600",
    doc_rejected: "bg-rose-500",
  };

  return (
    <div className="relative pl-5">
      <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gray-200" />
      <ul className="space-y-5">
        {events.map((e, i) => (
          <li key={i} className="relative">
            <span
              className={`absolute -left-5 top-1 w-3 h-3 rounded-full ring-4 ring-white ${
                dotStyle[e.type] || "bg-gray-400"
              }`}
            />
            <p className="text-sm text-gray-900 font-medium">{e.title}</p>
            {e.note && <p className="text-xs text-gray-500 mt-0.5">{e.note}</p>}
            <p className="text-[11px] text-gray-400 mt-0.5">
              {new Date(e.at).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}