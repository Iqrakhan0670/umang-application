import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { PhoneCall, Clock, CheckCircle2, FileDown, FileText as FileIcon } from "lucide-react";
import { createClaimSafe } from "../lib/duplicateCheck";
import { startRazorpayPayment } from "../lib/mockPayment";
import ClaimStatusDetail from "../components/ClaimStatusDetail";
import { generateClaimReportPdf } from "../lib/generateClaimReport";

const CALL_STATUS = {
  requested: { label: "Call requested", icon: Clock, className: "text-stone" },
  called: { label: "Call completed", icon: CheckCircle2, className: "text-pine" },
  no_answer: { label: "Could not reach you", icon: PhoneCall, className: "text-clay" },
  closed: { label: "Closed", icon: CheckCircle2, className: "text-stone" },
};

export default function Dashboard({ setView }) {
  const [claims, setClaims] = useState([]);
  const [callRequests, setCallRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeCall, setFeeCall] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState(null);
  const [agreementClaim, setAgreementClaim] = useState(null);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [acceptingAgreement, setAcceptingAgreement] = useState(false);
  const [detailClaim, setDetailClaim] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Report-ready banner state
  const [reportReadyClaimId, setReportReadyClaimId] = useState(null);
  const [reportGenerating, setReportGenerating] = useState(null); // claim id currently generating

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }
    setCurrentUser(user);

    const { data: claimData } = await supabase
      .from("claim_requests")
      .select("*, unclaimed_records(institution_name,asset_type,amount,folio_number,created_at)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setClaims(claimData || []);

    const { data: callData } = await supabase
      .from("call_requests")
      .select("*, unclaimed_records(institution_name,asset_type,amount)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setCallRequests(callData || []);

    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const alreadyClaimed = (recordId) => claims.some((c) => c.record_id === recordId);

  const buildAndOpenReport = async (claim, { download = false, transactionId } = {}) => {
    setReportGenerating(claim.id);
    try {
      const doc = generateClaimReportPdf({
        claim,
        record: claim.unclaimed_records,
        user: {
          name: currentUser?.user_metadata?.full_name || "",
          email: currentUser?.email,
        },
        transactionId,
      });
      const filename = `UMANG-Claim-Report-${claim.id.slice(0, 8)}.pdf`;
      if (download) {
        doc.save(filename);
      } else {
        const blobUrl = doc.output("bloburl");
        window.open(blobUrl, "_blank");
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Could not generate your report right now. Please try again.");
    } finally {
      setReportGenerating(null);
    }
  };

  const confirmClaim = async () => {
    if (!feeCall) return;
    setPayError(null);
    setSubmitting(true);
    try {
      const { claim, error } = await createClaimSafe(feeCall.record_id);
      if (error) { setPayError(error); setSubmitting(false); return; }

      startRazorpayPayment({
        claimId: claim.id,
        paymentType: "assistance_fee",
        amount: 299,
        user: {
          id: currentUser?.id,
          email: currentUser?.email,
          name: currentUser?.user_metadata?.full_name || "",
          phone: "",
        },
        onSuccess: async (paymentResult) => {
          setFeeCall(null);
          setSubmitting(false);
          await load();
          // Generate the report right after a successful payment
          setReportReadyClaimId(claim.id);
          buildAndOpenReport(
            { ...claim, unclaimed_records: feeCall.unclaimed_records, assistance_fee_paid: true, assistance_fee_amount: 299 },
            { transactionId: paymentResult?.paymentId }
          );
        },
        onFailure: (err) => {
          setPayError(err.message || "Payment did not go through. Please try again.");
          setSubmitting(false);
        },
      });
    } catch (err) {
      console.error(err);
      setPayError("Could not start claim assistance. Please try again.");
      setSubmitting(false);
    }
  };

  const acceptAgreement = async () => {
    if (!agreementClaim || !agreeChecked) return;
    setAcceptingAgreement(true);
    try {
      const { error } = await supabase
        .from("claim_requests")
        .update({ agreement_accepted: true, agreement_accepted_at: new Date().toISOString() })
        .eq("id", agreementClaim.id);
      if (error) throw error;
      setAgreementClaim(null);
      setAgreeChecked(false);
      load();
    } catch (err) {
      console.error(err);
      alert("Could not save your agreement. Please try again.");
    } finally {
      setAcceptingAgreement(false);
    }
  };

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-20 text-slate-500">Loading…</div>;
  }

  if (!currentUser) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500 mb-4">Please sign in to view your dashboard.</p>
        <button
          onClick={() => setView("search")}
          className="bg-umang-dark text-white rounded-full px-6 py-3 text-sm font-semibold hover:opacity-90 transition"
        >
          Search unclaimed money
        </button>
      </div>
    );
  }

  return (
    <div className="font-heading">
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-4">
        <h1 className="font-extrabold text-3xl text-umang-dark">Your Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Track your call requests and claims here.</p>
      </div>

      {/* REPORT READY BANNER */}
      {reportReadyClaimId && (
        <section className="max-w-5xl mx-auto px-6">
          <div className="border border-emerald-200 bg-emerald-50 rounded-xl px-5 py-4 flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <FileIcon size={16} className="text-emerald-700" />
              </span>
              <div>
                <p className="text-sm font-semibold text-umang-dark">Your Claim Assistance Report is Ready</p>
                <p className="text-xs text-slate-500">View or download your personalized asset report below.</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  const c = claims.find((cl) => cl.id === reportReadyClaimId);
                  if (c) buildAndOpenReport(c);
                }}
                className="text-xs border border-emerald-300 text-emerald-700 rounded-full px-3 py-2 hover:bg-white transition"
              >
                View PDF
              </button>
              <button
                onClick={() => {
                  const c = claims.find((cl) => cl.id === reportReadyClaimId);
                  if (c) buildAndOpenReport(c, { download: true });
                }}
                className="text-xs bg-umang-dark text-white rounded-full px-3 py-2 hover:opacity-90 transition"
              >
                Download PDF
              </button>
            </div>
          </div>
        </section>
      )}

      {/* YOUR CALL REQUESTS */}
      {callRequests.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pt-8">
          <div className="border-t border-ink/10 pt-8">
            <h2 className="font-extrabold text-2xl text-umang-dark mb-1">Your call requests</h2>
            <p className="text-slate-500 text-sm mb-6">
              Once our team has called and explained the details, you can proceed here.
            </p>
            <div className="space-y-3">
              {callRequests.map((cr) => {
                const info = CALL_STATUS[cr.status] || CALL_STATUS.requested;
                const Icon = info.icon;
                const claimed = alreadyClaimed(cr.record_id);
                return (
                  <div key={cr.id} className="border border-umang-dark/10 rounded-lg px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-umang-dark">
                        {cr.unclaimed_records?.institution_name || "—"} ·{" "}
                        {cr.unclaimed_records?.asset_type || "Unclaimed Asset"}
                      </p>
                      <p className={`text-sm flex items-center gap-1.5 mt-1 ${info.className}`}>
                        <Icon size={14} /> {info.label}
                      </p>
                    </div>
                    {cr.status === "called" && !claimed && (
                      <button
                        onClick={() => setFeeCall(cr)}
                        className="text-sm bg-umang-dark text-white rounded-full px-4 py-2 hover:opacity-90 transition shrink-0"
                      >
                        Proceed — ₹299
                      </button>
                    )}
                    {claimed && <span className="text-xs text-slate-400 shrink-0">Assistance started</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {callRequests.length === 0 && claims.length === 0 && (
        <section className="max-w-5xl mx-auto px-6 pt-8 pb-16">
          <div className="border border-umang-dark/10 rounded-lg px-6 py-10 text-center text-slate-500 text-sm">
            No activity yet. Search your name and request a call to get started.
          </div>
        </section>
      )}

      {/* YOUR CLAIMS */}
      {claims.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-24 pt-16">
          <div className="border-t border-ink/10 pt-8">
            <h2 className="font-extrabold text-2xl text-umang-dark mb-1">Your claims</h2>
            <p className="text-slate-500 text-sm mb-6">Every claim you've filed, tracked here.</p>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-umang-dark/15 text-left text-slate-500">
                  <th className="py-2 font-medium">Institution</th>
                  <th className="py-2 font-medium">Asset</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Amount</th>
                  <th className="py-2 font-medium text-right">Success fee</th>
                  <th className="py-2 font-medium text-right">Report</th>
                  <th className="py-2 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id} className="border-b border-umang-dark/5">
                    <td className="py-3">{c.unclaimed_records?.institution_name || "—"}</td>
                    <td className="py-3">{c.unclaimed_records?.asset_type || "—"}</td>
                    <td className="py-3 capitalize">{c.status.replace("_", " ")}</td>
                    <td className="py-3 text-right font-medium">
                      ₹{(c.recovered_amount || c.unclaimed_records?.amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 text-right">
                      {c.agreement_accepted ? (
                        <span className="text-xs text-umang-dark">Accepted</span>
                      ) : (
                        <button
                          onClick={() => setAgreementClaim(c)}
                          className="text-xs border border-umang-dark text-umang-dark rounded-full px-3 py-1.5 hover:bg-umang-dark hover:text-white transition"
                        >
                          Review & accept
                        </button>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {c.assistance_fee_paid ? (
                        <button
                          onClick={() => buildAndOpenReport(c)}
                          disabled={reportGenerating === c.id}
                          className="inline-flex items-center gap-1 text-xs border border-umang-dark/20 rounded-full px-3 py-1.5 hover:border-umang-dark/40 transition disabled:opacity-50"
                        >
                          <FileDown size={12} />
                          {reportGenerating === c.id ? "Preparing…" : "View PDF"}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setDetailClaim(c)}
                        className="text-xs border border-umang-dark/20 rounded-full px-3 py-1.5 hover:border-umang-dark/40 transition"
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* FEE MODAL */}
      {feeCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full rounded-xl border border-umang-dark/10 p-8">
            <h2 className="font-extrabold text-2xl text-umang-dark mb-1">Claim Assistance — Fee Structure</h2>
            <p className="text-slate-500 text-sm mb-6">
              For {feeCall.unclaimed_records?.institution_name} · {feeCall.unclaimed_records?.asset_type}
            </p>
            <div className="border-t border-b border-umang-dark/10 py-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated value</span>
                <span className="font-medium">₹{Number(feeCall.unclaimed_records?.amount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Claim Assistance Fee (one-time)</span>
                <span className="font-medium">₹299</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Success Fee — only if recovered</span>
                <span className="font-medium">10% of recovered amount</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
              The ₹299 fee covers document guidance, claim-process guidance, form
              assistance and ongoing support. It is charged now. The 10% success
              fee applies only if and when your money is successfully recovered.
            </p>
            {payError && <p className="text-xs text-red-500 mt-3" role="alert">{payError}</p>}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setFeeCall(null); setPayError(null); }}
                className="flex-1 border border-umang-dark/20 rounded-full py-3 text-sm hover:border-umang-dark/40 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmClaim}
                disabled={submitting}
                className="flex-1 bg-umang-dark text-white rounded-full py-3 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? "Processing…" : "Pay ₹299 & start"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AGREEMENT MODAL */}
      {agreementClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full rounded-xl border border-umang-dark/10 p-8">
            <h2 className="font-extrabold text-2xl text-umang-dark mb-1">Success Fee Agreement</h2>
            <p className="text-slate-500 text-sm mb-6">
              For {agreementClaim.unclaimed_records?.institution_name} · {agreementClaim.unclaimed_records?.asset_type}
            </p>
            <div className="border border-umang-dark/10 rounded-lg p-5 text-sm text-slate-600 space-y-3 max-h-64 overflow-y-auto leading-relaxed">
              <p><strong className="text-umang-dark">1. Success fee.</strong> If and only if this asset is successfully recovered on your behalf, UMANG charges a fee of 10% of the actual recovered amount.</p>
              <p><strong className="text-umang-dark">2. When it's payable.</strong> The success fee is payable only after recovery is confirmed and the amount is known.</p>
              <p><strong className="text-umang-dark">3. What "recovered" means.</strong> Recovery is considered successful once the institution has released the funds and they are confirmed as received.</p>
              <p><strong className="text-umang-dark">4. If recovery fails.</strong> If the asset cannot be recovered, no success fee is charged. The ₹299 fee already paid is not refundable.</p>
              <p><strong className="text-umang-dark">5. Cancellation.</strong> You may withdraw your claim at any point before recovery by contacting support; no success fee applies to a withdrawn claim.</p>
            </div>
            <label className="flex items-start gap-3 text-sm text-slate-600 mt-5 cursor-pointer">
              <input type="checkbox" checked={agreeChecked} onChange={(e) => setAgreeChecked(e.target.checked)} className="mt-1" />
              I have read and agree to the 10% Success Fee terms above.
            </label>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setAgreementClaim(null); setAgreeChecked(false); }}
                className="flex-1 border border-umang-dark/20 rounded-full py-3 text-sm hover:border-umang-dark/40 transition"
              >
                Cancel
              </button>
              <button
                onClick={acceptAgreement}
                disabled={!agreeChecked || acceptingAgreement}
                className="flex-1 bg-umang-dark text-white rounded-full py-3 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {acceptingAgreement ? "Saving…" : "Accept & continue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLAIM DETAIL MODAL */}
      {detailClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full rounded-xl border border-umang-dark/10 p-8 max-h-[85vh] overflow-y-auto">
            <button onClick={() => setDetailClaim(null)} className="text-xs text-slate-500 hover:text-umang-dark mb-4">
              ← Close
            </button>
            <ClaimStatusDetail
              claimId={detailClaim.id}
              user={{ id: currentUser?.id, email: currentUser?.email, name: currentUser?.user_metadata?.full_name || "" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}