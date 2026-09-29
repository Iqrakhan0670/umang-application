import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { notifyUser } from "../../lib/notify";

// Admin-side panel to review documents uploaded for a single claim.
// Drop this inside the claims "expand" row in Admin.jsx, alongside SettlementPanel:
//   <AdminDocumentReview claimId={c.id} />

export default function AdminDocumentReview({ claimId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [claimId]);

  async function fetchDocuments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("claim_documents")
      .select("*")
      .eq("claim_id", claimId)
      .order("uploaded_at", { ascending: false });

    if (!error) setDocuments(data || []);
    setLoading(false);
  }

  async function getSignedUrl(filePath) {
    const { data, error } = await supabase.storage
      .from("claim-documents")
      .createSignedUrl(filePath, 60 * 5); // 5-minute link
    if (error) {
      alert("Could not open file: " + error.message);
      return null;
    }
    return data.signedUrl;
  }

  async function handleView(doc) {
    const url = await getSignedUrl(doc.file_path);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleApprove(doc) {
    setBusyId(doc.id);
    const { error } = await supabase
      .from("claim_documents")
      .update({
        verified: true,
        rejection_reason: null,
        verified_at: new Date().toISOString(),
      })
      .eq("id", doc.id);

    setBusyId(null);
    if (error) {
      alert("Approve failed: " + error.message);
      return;
    }
    notifyUser(doc.user_id, "document_approved", { docType: doc.doc_type });
    fetchDocuments();
  }

  function startReject(doc) {
    setRejectingId(doc.id);
    setRejectReason("");
  }

  async function confirmReject(doc) {
    if (!rejectReason.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }
    setBusyId(doc.id);
    const { error } = await supabase
      .from("claim_documents")
      .update({
        verified: false,
        rejection_reason: rejectReason.trim(),
        verified_at: new Date().toISOString(),
      })
      .eq("id", doc.id);

    setBusyId(null);
    if (error) {
      alert("Reject failed: " + error.message);
      return;
    }
    notifyUser(doc.user_id, "document_rejected", {
      docType: doc.doc_type,
      reason: rejectReason.trim(),
    });
    setRejectingId(null);
    setRejectReason("");
    fetchDocuments();
  }

  if (loading) {
    return <p className="text-xs text-gray-400">Loading documents…</p>;
  }

  if (documents.length === 0) {
    return <p className="text-xs text-gray-400">No documents uploaded for this claim yet.</p>;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
        Uploaded Documents
      </h4>
      <div className="space-y-2">
        {documents.map((doc) => {
          const statusLabel = doc.verified
            ? "Approved"
            : doc.rejection_reason
            ? "Rejected"
            : "Pending review";
          const statusColor = doc.verified
            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
            : doc.rejection_reason
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : "bg-amber-50 text-amber-700 border-amber-200";

          return (
            <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.doc_type}</p>
                  <p className="text-xs text-gray-500 truncate">{doc.file_name}</p>
                </div>
                <span
                  className={`shrink-0 text-[11px] font-medium px-2 py-1 rounded-full border ${statusColor}`}
                >
                  {statusLabel}
                </span>
              </div>

              {doc.rejection_reason && (
                <p className="text-xs text-rose-600 mt-2">Reason: {doc.rejection_reason}</p>
              )}

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleView(doc)}
                  className="text-xs border border-gray-200 px-3 py-1.5 rounded-md hover:border-emerald-500 transition"
                >
                  View file
                </button>

                {!doc.verified && (
                  <button
                    onClick={() => handleApprove(doc)}
                    disabled={busyId === doc.id}
                    className="text-xs bg-emerald-950 text-white px-3 py-1.5 rounded-md hover:bg-emerald-900 transition disabled:opacity-50"
                  >
                    {busyId === doc.id ? "Approving…" : "Approve"}
                  </button>
                )}

                {rejectingId !== doc.id ? (
                  <button
                    onClick={() => startReject(doc)}
                    disabled={busyId === doc.id}
                    className="text-xs border border-rose-200 text-rose-700 px-3 py-1.5 rounded-md hover:bg-rose-50 transition disabled:opacity-50"
                  >
                    Reject
                  </button>
                ) : null}
              </div>

              {rejectingId === doc.id && (
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (shown to the user)…"
                    className="flex-1 border border-gray-200 px-3 py-1.5 text-xs rounded-md focus:outline-none focus:border-rose-400"
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => confirmReject(doc)}
                      disabled={busyId === doc.id}
                      className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded-md hover:bg-rose-700 transition disabled:opacity-50"
                    >
                      {busyId === doc.id ? "Rejecting…" : "Confirm reject"}
                    </button>
                    <button
                      onClick={() => setRejectingId(null)}
                      className="text-xs border border-gray-200 px-3 py-1.5 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}