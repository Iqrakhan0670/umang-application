import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Banknote, Building2, FileSearch, ArrowLeft, PhoneCall } from "lucide-react";

export default function Results({ results, setView, onRequireLogin }) {
  const [callRecord, setCallRecord] = useState(null);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requested, setRequested] = useState(false);

  const records = results?.records || [];

  const openCallForm = async (record) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      onRequireLogin();
      return;
    }
    setCallRecord(record);
    setRequested(false);
  };

  const submitCallRequest = async (e) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !callRecord) return;

    if (!fullName.trim() || mobile.trim().length !== 10) {
      alert("Please enter your name and a valid 10-digit mobile number.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("call_requests").insert({
        user_id: user.id,
        record_id: callRecord.id,
        full_name: fullName.trim(),
        mobile_number: mobile.trim(),
        email: email.trim() || null,
        status: "requested",
      });
      if (error) throw error;
      setRequested(true);
    } catch (err) {
      console.error(err);
      alert("Could not submit your request. Please try again.");
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
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <button
        onClick={() => setView("search")}
        className="text-sm text-stone hover:text-ink mb-8 flex items-center gap-1.5"
      >
        <ArrowLeft size={14} /> New search
      </button>

      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-full bg-pine/10 flex items-center justify-center shrink-0">
          <FileSearch size={18} className="text-pine" />
        </div>
        <h1 className="font-serif text-3xl text-ink">
          {records.length} {records.length === 1 ? "match" : "matches"} for "
          {results?.query}"
        </h1>
      </div>
      <p className="text-stone text-sm mb-10 ml-[52px]">
        Results are indicative. Ownership is confirmed during the claim
        process.
      </p>

      {records.length === 0 ? (
        <div className="border border-ink/10 px-6 py-14 text-center">
          <Banknote size={28} className="mx-auto text-stone/40 mb-4" />
          <p className="text-stone">
            No records found for this name. Try a different spelling, or
            check back later as new records are added.
          </p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-left text-stone">
              <th className="py-3 font-medium">Holder</th>
              <th className="py-3 font-medium">Asset</th>
              <th className="py-3 font-medium">Institution</th>
              <th className="py-3 font-medium text-right">Est. value</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-ink/5 hover:bg-parchment-dim/50 transition">
                <td className="py-4 font-medium">
                  {r.first_name} {r.last_name}
                </td>
                <td className="py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs bg-brass/10 text-brass px-2.5 py-1 rounded-full">
                    {r.asset_type || "Unclaimed Asset"}
                  </span>
                </td>
                <td className="py-4 text-stone">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 size={13} /> {r.institution_name || "—"}
                  </span>
                </td>
                <td className="py-4 text-right font-medium">
                  ₹{Number(r.amount || 0).toLocaleString("en-IN")}
                </td>
                <td className="py-4 text-right">
                  <button
                    onClick={() => openCallForm(r)}
                    className="text-sm border border-pine text-pine px-4 py-1.5 hover:bg-pine hover:text-parchment transition"
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
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
          <div className="bg-parchment max-w-md w-full border border-ink/15 p-8">
            {!requested ? (
              <>
                <h2 className="font-serif text-2xl text-ink mb-1">
                  Let's talk it through
                </h2>
                <p className="text-stone text-sm mb-6">
                  For {callRecord.first_name} {callRecord.last_name} ·{" "}
                  {callRecord.institution_name}. Our team will call you to
                  explain the asset, the claim process, required documents,
                  and charges — no payment is taken now.
                </p>

                <form onSubmit={submitCallRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-stone mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border-b-2 border-ink/20 bg-transparent py-2 focus:outline-none focus:border-pine transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-stone mb-1.5">
                      Mobile number
                    </label>
                    <input
                      type="tel"
                      maxLength="10"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      placeholder="98765 43210"
                      className="w-full border-b-2 border-ink/20 bg-transparent py-2 focus:outline-none focus:border-pine transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-stone mb-1.5">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-b-2 border-ink/20 bg-transparent py-2 focus:outline-none focus:border-pine transition"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeCallForm}
                      className="flex-1 border border-ink/20 py-3 text-sm hover:border-ink/40 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-pine text-parchment py-3 text-sm font-medium hover:bg-pine-light transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <PhoneCall size={14} />
                      {submitting ? "Submitting…" : "Request a call"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-pine/10 flex items-center justify-center mx-auto mb-4">
                  <PhoneCall size={20} className="text-pine" />
                </div>
                <h2 className="font-serif text-2xl text-ink mb-2">
                  Request received
                </h2>
                <p className="text-stone text-sm leading-relaxed mb-6">
                  Our team will call you shortly to explain this asset and
                  the claim process. No payment is due at this stage — you
                  decide whether to proceed after the call.
                </p>
                <button
                  onClick={closeCallForm}
                  className="bg-pine text-parchment px-6 py-2.5 text-sm font-medium hover:bg-pine-light transition"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}