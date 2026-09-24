import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Banknote, Building2, FileSearch, ArrowLeft, PhoneCall } from "lucide-react";

// Fallback contact shown to the person once they submit a call request,
// regardless of whether the request was successfully saved to the backend.
const CONTACT_NAME = "Pranali Waghode";
const CONTACT_PHONE = "8692956949";

export default function Results({ results, setView, onContinueClaim }) {
  const [callRecord, setCallRecord] = useState(null);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [callStatus, setCallStatus] = useState("requested");

  const records = results?.records || [];

  // While the confirmation screen is open with a real request id, keep
  // checking whether the admin has marked the call "called" — so this
  // same screen can switch itself from "call us" to "sign in & pay"
  // without the person needing to reload the page.
  useEffect(() => {
    if (!requested || !requestId) return;

    let cancelled = false;

    const checkStatus = async () => {
      const { data } = await supabase
        .from("call_requests")
        .select("status")
        .eq("id", requestId)
        .single();
      if (!cancelled && data?.status) {
        setCallStatus(data.status);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [requested, requestId]);

  // No login required to open the Claim Assistance form.
  const openCallForm = (record) => {
    setCallRecord(record);
    setRequested(false);
    setRequestId(null);
    setCallStatus("requested");
  };

  const submitCallRequest = async (e) => {
    e.preventDefault();
    if (!callRecord) return;

    if (!fullName.trim() || mobile.trim().length !== 10) {
      alert("Please enter your name and a valid 10-digit mobile number.");
      return;
    }

    setSubmitting(true);
    try {
      // Not logged in yet — that's fine. user_id is attached later if/when
      // the person chooses to sign in to track this request.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("call_requests")
        .insert({
          user_id: user?.id ?? null,
          record_id: callRecord.id,
          full_name: fullName.trim(),
          mobile_number: mobile.trim(),
          email: email.trim() || null,
          status: "requested",
        })
        .select()
        .single();

      if (error) throw error;
      setRequestId(data.id);
      setRequested(true);

      // Remember this request locally so that when the person comes back
      // (before or after signing in), we can check whether the admin has
      // since marked it "called" and prompt them to sign in and pay.
      try {
        const stored = JSON.parse(
          localStorage.getItem("umang_call_request_ids") || "[]"
        );
        if (!stored.includes(data.id)) {
          localStorage.setItem(
            "umang_call_request_ids",
            JSON.stringify([...stored, data.id])
          );
        }
      } catch (storageErr) {
        console.error(storageErr);
      }
    } catch (err) {
      // Even if saving the request fails (e.g. backend/table issue), don't
      // block the person with an error — still show the confirmation screen
      // with a direct contact so they can move forward.
      console.error(err);
      setRequestId(null);
      setRequested(true);
    } finally {
      setSubmitting(false);
    }
  };

  const closeCallForm = () => {
    setCallRecord(null);
    setFullName("");
    setMobile("");
    setEmail("");
    setRequested(false);
    setRequestId(null);
    setCallStatus("requested");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 bg-white">
      <button
        onClick={() => setView("search")}
        className="text-sm text-slate-500 hover:text-emerald-950 mb-8 flex items-center gap-1.5"
      >
        <ArrowLeft size={14} /> New search
      </button>

      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
          <FileSearch size={18} className="text-emerald-700" />
        </div>
        <h1 className="font-extrabold text-3xl text-emerald-950">
          {records.length} {records.length === 1 ? "match" : "matches"} for "
          {results?.query}"
        </h1>
      </div>
      <p className="text-slate-500 text-sm mb-10 ml-[52px]">
        Results are indicative. Ownership is confirmed during the claim
        process.
      </p>

      {records.length === 0 ? (
        <div className="border border-slate-200 rounded-2xl px-6 py-14 text-center">
          <Banknote size={28} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">
            No records found for this name. Try a different spelling, or
            check back later as new records are added.
          </p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-3 font-medium">Holder</th>
              <th className="py-3 font-medium">Asset</th>
              <th className="py-3 font-medium">Institution</th>
              <th className="py-3 font-medium text-right">Est. value</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr
                key={r.id}
                className="border-b border-slate-100 hover:bg-emerald-50/50 transition"
              >
                <td className="py-4 font-medium text-emerald-950">
                  {r.first_name} {r.last_name}
                </td>
                <td className="py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full">
                    {r.asset_type || "Unclaimed Asset"}
                  </span>
                </td>
                <td className="py-4 text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 size={13} /> {r.institution_name || "—"}
                  </span>
                </td>
                <td className="py-4 text-right font-medium text-emerald-950">
                  ₹{Number(r.amount || 0).toLocaleString("en-IN")}
                </td>
                <td className="py-4 text-right">
                  <button
                    onClick={() => openCallForm(r)}
                    className="text-sm rounded-full border border-emerald-950 text-emerald-950 px-4 py-1.5 hover:bg-emerald-950 hover:text-white transition"
                  >
                    File claim
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {callRecord && (
        <div className="fixed inset-0 bg-emerald-950/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-lg p-8">
            {!requested ? (
              <>
                <h2 className="font-extrabold text-2xl text-emerald-950 mb-1">
                  Let's talk it through
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  For {callRecord.first_name} {callRecord.last_name} ·{" "}
                  {callRecord.institution_name}. Please enter your details so
                  our claim assistance team can explain the possible match
                  and the claim process to you — no payment is taken now.
                </p>

                <form onSubmit={submitCallRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border-b-2 border-slate-200 bg-transparent py-2 focus:outline-none focus:border-emerald-700 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1.5">
                      Mobile number
                    </label>
                    <input
                      type="tel"
                      maxLength="10"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      placeholder="98765 43210"
                      className="w-full border-b-2 border-slate-200 bg-transparent py-2 focus:outline-none focus:border-emerald-700 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1.5">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-b-2 border-slate-200 bg-transparent py-2 focus:outline-none focus:border-emerald-700 transition"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeCallForm}
                      className="flex-1 rounded-full border border-slate-200 py-3 text-sm hover:border-slate-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-full bg-emerald-950 text-white py-3 text-sm font-semibold hover:bg-emerald-900 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <PhoneCall size={14} />
                      {submitting ? "Submitting…" : "Request a call"}
                    </button>
                  </div>
                </form>
              </>
            ) : callStatus === "called" ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <PhoneCall size={20} className="text-emerald-700" />
                </div>
                <h2 className="font-extrabold text-2xl text-emerald-950 mb-2">
                  Call completed
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Sign in or create a free account to proceed with payment
                  and start claim assistance for this asset.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={closeCallForm}
                    className="flex-1 rounded-full border border-slate-200 py-3 text-sm hover:border-slate-300 transition"
                  >
                    Not now
                  </button>
                  <button
                    onClick={() => {
                      onContinueClaim?.(requestId);
                      closeCallForm();
                    }}
                    className="flex-1 rounded-full bg-emerald-950 text-white py-3 text-sm font-semibold hover:bg-emerald-900 transition"
                  >
                    Sign in / Create account
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <PhoneCall size={20} className="text-emerald-700" />
                </div>
                <h2 className="font-extrabold text-2xl text-emerald-950 mb-2">
                  Request received
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-2">
                  Your request has been noted for this asset.
                </p>
                <div className="bg-emerald-50 rounded-xl px-4 py-3 mb-6 text-sm text-emerald-950">
                  To proceed further with the claim process, required
                  documents and applicable charges, please call{" "}
                  <span className="font-semibold">{CONTACT_NAME}</span> at{" "}
                  <a
                    href={`tel:${CONTACT_PHONE}`}
                    className="font-semibold underline underline-offset-2"
                  >
                    {CONTACT_PHONE}
                  </a>
                  .
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={closeCallForm}
                    className="flex-1 rounded-full border border-slate-200 py-3 text-sm hover:border-slate-300 transition"
                  >
                    Close
                  </button>
                  <a
                    href={`tel:${CONTACT_PHONE}`}
                    className="flex-1 rounded-full bg-emerald-950 text-white py-3 text-sm font-semibold hover:bg-emerald-900 transition flex items-center justify-center gap-2"
                  >
                    <PhoneCall size={14} />
                    Call now
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}