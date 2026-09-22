import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { PhoneCall, FileText, Upload, LayoutDashboard } from "lucide-react";
import SettlementPanel from "../components/admin/SettlementPanel";
import ImportRecords from "../components/admin/ImportRecords";
import DashboardSummary from "../components/admin/DashboardSummary";

const ADMIN_EMAIL = "fybsciqrakhan0670@gmail.com";

const CALL_STATUSES = ["requested", "called", "no_answer", "closed"];
const CLAIM_STATUSES = [
  "submitted",
  "under_review",
  "documents_pending",
  "filed_with_authority",
  "recovered",
  "rejected",
  "cancelled",
];

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [calls, setCalls] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [expandedClaimId, setExpandedClaimId] = useState(null);

  const load = async () => {
    const { data: callData } = await supabase
      .from("call_requests")
      .select("*, unclaimed_records(first_name,last_name,institution_name,asset_type,amount)")
      .order("created_at", { ascending: false });
    setCalls(callData || []);

    const { data: claimData } = await supabase
      .from("claim_requests")
      .select("*, unclaimed_records(first_name,last_name,institution_name,asset_type,amount)")
      .order("created_at", { ascending: false });
    setClaims(claimData || []);

    setLoading(false);
  };

  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        load();
      } else {
        setIsAdmin(false);
      }
    };
    check();
  }, []);

  const updateCallStatus = async (id, status) => {
    await supabase.from("call_requests").update({ status }).eq("id", id);
    load();
  };

  const updateClaimStatus = async (id, status) => {
    await supabase.from("claim_requests").update({ status }).eq("id", id);
    load();
  };

  const updateRecoveredAmount = async (id, amount) => {
    await supabase
      .from("claim_requests")
      .update({ recovered_amount: amount === "" ? null : Number(amount) })
      .eq("id", id);
    load();
  };

  if (isAdmin === null) {
    return <div className="max-w-3xl mx-auto px-6 py-20 text-stone">Checking access…</div>;
  }

  if (isAdmin === false) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-stone">You don't have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-serif text-3xl text-ink mb-8">Admin</h1>

      <div className="flex gap-2 mb-8 border-b border-ink/10">
        <button
          onClick={() => setTab("dashboard")}
          className={`px-4 py-2 text-sm flex items-center gap-2 border-b-2 -mb-px ${
            tab === "dashboard" ? "border-pine text-pine font-medium" : "border-transparent text-stone"
          }`}
        >
          <LayoutDashboard size={14} /> Dashboard
        </button>
        <button
          onClick={() => setTab("calls")}
          className={`px-4 py-2 text-sm flex items-center gap-2 border-b-2 -mb-px ${
            tab === "calls" ? "border-pine text-pine font-medium" : "border-transparent text-stone"
          }`}
        >
          <PhoneCall size={14} /> Call requests ({calls.length})
        </button>
        <button
          onClick={() => setTab("claims")}
          className={`px-4 py-2 text-sm flex items-center gap-2 border-b-2 -mb-px ${
            tab === "claims" ? "border-pine text-pine font-medium" : "border-transparent text-stone"
          }`}
        >
          <FileText size={14} /> Claims ({claims.length})
        </button>
        <button
          onClick={() => setTab("import")}
          className={`px-4 py-2 text-sm flex items-center gap-2 border-b-2 -mb-px ${
            tab === "import" ? "border-pine text-pine font-medium" : "border-transparent text-stone"
          }`}
        >
          <Upload size={14} /> Import Records
        </button>
      </div>

      {loading && tab !== "import" && tab !== "dashboard" ? (
        <p className="text-stone text-sm">Loading…</p>
      ) : tab === "dashboard" ? (
        <DashboardSummary calls={calls} claims={claims} />
      ) : tab === "calls" ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-left text-stone">
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">Mobile</th>
              <th className="py-2 font-medium">Record</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((c) => (
              <tr key={c.id} className="border-b border-ink/5">
                <td className="py-3">{c.full_name}</td>
                <td className="py-3">{c.mobile_number}</td>
                <td className="py-3 text-stone">
                  {c.unclaimed_records?.first_name} {c.unclaimed_records?.last_name} ·{" "}
                  {c.unclaimed_records?.institution_name}
                </td>
                <td className="py-3">
                  <select
                    value={c.status}
                    onChange={(e) => updateCallStatus(c.id, e.target.value)}
                    className="border border-ink/20 bg-parchment px-2 py-1 text-sm"
                  >
                    {CALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : tab === "claims" ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-left text-stone">
              <th className="py-2 font-medium">Record</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Agreement</th>
              <th className="py-2 font-medium text-right">Recovered ₹</th>
              <th className="py-2 font-medium text-right">Settlement</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <React.Fragment key={c.id}>
                <tr className="border-b border-ink/5">
                  <td className="py-3 text-stone">
                    {c.unclaimed_records?.first_name} {c.unclaimed_records?.last_name} ·{" "}
                    {c.unclaimed_records?.institution_name}
                  </td>
                  <td className="py-3">
                    <select
                      value={c.status}
                      onChange={(e) => updateClaimStatus(c.id, e.target.value)}
                      className="border border-ink/20 bg-parchment px-2 py-1 text-sm"
                    >
                      {CLAIM_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3">
                    {c.agreement_accepted ? (
                      <span className="text-xs text-pine">Accepted</span>
                    ) : (
                      <span className="text-xs text-stone">Pending</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <input
                      type="number"
                      defaultValue={c.recovered_amount || ""}
                      onBlur={(e) => updateRecoveredAmount(c.id, e.target.value)}
                      placeholder="—"
                      className="border border-ink/20 bg-parchment px-2 py-1 text-sm w-28 text-right"
                    />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setExpandedClaimId(expandedClaimId === c.id ? null : c.id)}
                      className="text-xs border border-ink/20 px-3 py-1.5 hover:border-ink/40 transition"
                    >
                      {expandedClaimId === c.id ? "Hide" : "Settle"}
                    </button>
                  </td>
                </tr>
                {expandedClaimId === c.id && (
                  <tr>
                    <td colSpan={5} className="py-4 bg-parchment-dim/40 px-4">
                      <SettlementPanel claim={c} onUpdated={load} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <ImportRecords onImported={load} />
      )}
    </div>
  );
}