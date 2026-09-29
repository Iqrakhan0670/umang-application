import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import { Search } from "lucide-react";
import Sidebar from "../components/admin/Sidebar";
import TopHeader from "../components/admin/TopHeader";
import ImportRecords from "../components/admin/ImportRecords";
import DashboardSummary from "../components/admin/DashboardSummary";
import Settings from "../components/admin/Settings";
import Settlements from "../components/admin/Settlements";
import ActivityLog from "../components/admin/ActivityLog";
import AdminDocumentReview from "../components/admin/AdminDocumentReview";
import ClaimTimeline from "../components/ClaimTimeline";
import ManageAdmins from "../components/admin/ManageAdmins";
import SettlementPanel from "../components/admin/SettlementPanel";
import ErrorBoundary from "../components/ErrorBoundary";
import { notifyUser } from "../lib/notify";
import { getCurrentAdminRole } from "../lib/adminAuth";

// Which roles can see which tab
const TAB_ACCESS = {
  dashboard: ["super_admin", "agent", "reviewer", "settlement_admin"],
  calls: ["super_admin", "agent"],
  claims: ["super_admin", "reviewer"],
  import: ["super_admin"],
  settlements: ["super_admin", "settlement_admin"],
  activity: ["super_admin"],
  settings: ["super_admin"],
  manage_admins: ["super_admin"],
};

const CALL_STATUSES = [
  "requested",
  "scheduled",
  "called",
  "callback_requested",
  "no_answer",
  "closed",
];
const CLAIM_STATUSES = [
  "submitted",
  "under_review",
  "documents_pending",
  "filed_with_authority",
  "recovered",
  "rejected",
  "cancelled",
];

// Color tokens per status so admins can scan tables at a glance
const STATUS_COLORS = {
  requested: "bg-emerald-100 text-emerald-800 border-emerald-200",
  scheduled: "bg-amber-50 text-amber-700 border-amber-200",
  called: "bg-emerald-50 text-emerald-700 border-emerald-200",
  callback_requested: "bg-amber-100 text-amber-800 border-amber-300",
  no_answer: "bg-emerald-50 text-gray-500 border-gray-200",
  closed: "bg-emerald-50 text-gray-500 border-gray-200",
  submitted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  under_review: "bg-emerald-50 text-emerald-700 border-emerald-200",
  documents_pending: "bg-emerald-100 text-emerald-700 border-emerald-200",
  filed_with_authority: "bg-emerald-200 text-emerald-800 border-emerald-300",
  recovered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-white text-gray-600 border-gray-300",
  cancelled: "bg-emerald-50 text-gray-500 border-gray-200",
};

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || "bg-emerald-50 text-gray-500 border-gray-200";
  return (
    <span className={`inline-block text-[11px] font-medium px-2 py-1 rounded-full border ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function EmptyState({ label }) {
  return (
    <div className="py-16 text-center border border-dashed border-gray-200 rounded-lg">
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  );
}

// Converts a timestamptz value into the string format <input type="datetime-local"> expects
function toDatetimeLocalValue(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

/* ---------------- Call details panel (notes + scheduled time) ---------------- */

function CallDetailsPanel({ call, onSave }) {
  const [notes, setNotes] = useState(call.call_notes || "");
  const [scheduledAt, setScheduledAt] = useState(toDatetimeLocalValue(call.scheduled_at));
  const [saving, setSaving] = useState(false);

  const showScheduleField = call.status === "scheduled" || call.status === "callback_requested";

  const handleSave = async () => {
    setSaving(true);
    await onSave(call, {
      call_notes: notes.trim() === "" ? null : notes.trim(),
      scheduled_at: showScheduleField && scheduledAt ? new Date(scheduledAt).toISOString() : null,
    });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {showScheduleField && (
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1.5">
            {call.status === "callback_requested" ? "Callback date & time" : "Scheduled date & time"}
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="border border-gray-200 bg-white px-3 py-2 text-sm rounded-md w-full sm:w-64"
          />
        </div>
      )}
      <div>
        <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1.5">
          Call notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="What was discussed on the call…"
          className="w-full border border-gray-200 bg-white px-3 py-2 text-sm rounded-md resize-none"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-xs font-semibold bg-emerald-950 text-white px-4 py-2 rounded-md hover:bg-emerald-900 transition disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save details"}
      </button>
    </div>
  );
}

/* ---------------- Claim expand panel (documents + settlement + timeline) ---------------- */
// Each part is wrapped in its own ErrorBoundary, so if one crashes the rest
// of the page keeps working and the exact error is shown in that section.

function ClaimExpandPanel({ claim, onUpdated }) {
  return (
    <div className="space-y-4">
      <ErrorBoundary label="Documents">
        <AdminDocumentReview claimId={claim.id} />
      </ErrorBoundary>

      <ErrorBoundary label="Settlement">
        <SettlementPanel claim={claim} onUpdated={onUpdated} />
      </ErrorBoundary>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Timeline
        </h4>
        <ErrorBoundary label="Timeline">
          <ClaimTimeline claimId={claim.id} />
        </ErrorBoundary>
      </div>
    </div>
  );
}

const TAB_TITLES = {
  dashboard: "Dashboard",
  calls: "Call Requests",
  claims: "Claims",
  import: "Import Records",
  settlements: "Settlements",
  activity: "Activity Log",
  settings: "Settings",
  manage_admins: "Manage Admins",
};

// Best-effort activity log write — never blocks the main action if it fails
async function logActivity(action, entityType, entityId) {
  try {
    await supabase.from("activity_log").insert({ action, entity_type: entityType, entity_id: entityId });
  } catch (err) {
    console.error("activity log insert failed:", err);
  }
}

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [adminRole, setAdminRole] = useState(null);
  const [calls, setCalls] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [expandedClaimId, setExpandedClaimId] = useState(null);
  const [expandedCallId, setExpandedCallId] = useState(null);
  const [search, setSearch] = useState("");

  const load = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);

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
    if (isManualRefresh) setRefreshing(false);
  };

  useEffect(() => {
    const check = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const info = await getCurrentAdminRole(user.email);
        if (info && info.role) {
          setAdminRole(info.role);
          setIsAdmin(true);
          // default tab = first tab this role is allowed to see
          const firstAllowed = Object.keys(TAB_ACCESS).find((t) =>
            TAB_ACCESS[t].includes(info.role)
          );
          setTab(firstAllowed || "dashboard");
          load();
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    check();
  }, []);

  // Reset search when switching tabs so old filters don't linger
  useEffect(() => {
    setSearch("");
  }, [tab]);

  const handleNavigate = (key) => {
    if (key === "logout") {
      supabase.auth.signOut();
      return;
    }
    // A role can't jump into a tab it isn't allowed to see
    if (TAB_ACCESS[key] && !TAB_ACCESS[key].includes(adminRole)) {
      return;
    }
    setTab(key);
  };

  const updateCallStatus = async (call, status) => {
    const { error } = await supabase.from("call_requests").update({ status }).eq("id", call.id);
    if (error) {
      console.error("updateCallStatus failed:", error);
      alert("Status update failed: " + error.message);
      return;
    }
    logActivity(`Call request marked as "${status.replace(/_/g, " ")}"`, "call_request", call.id);
    if (status === "scheduled" || status === "callback_requested") {
      notifyUser(call.user_id, status, {
        name: call.full_name,
        mobile: call.mobile_number,
        scheduledAt: call.scheduled_at
          ? new Date(call.scheduled_at).toLocaleString("en-IN")
          : null,
      });
    }
    load();
  };

  const updateCallDetails = async (call, { call_notes, scheduled_at }) => {
    const { error } = await supabase
      .from("call_requests")
      .update({ call_notes, scheduled_at })
      .eq("id", call.id);
    if (error) {
      console.error("updateCallDetails failed:", error);
      alert("Update failed: " + error.message);
      return;
    }
    logActivity("Call details updated (notes/schedule)", "call_request", call.id);
    if (scheduled_at && (call.status === "scheduled" || call.status === "callback_requested")) {
      notifyUser(call.user_id, call.status, {
        name: call.full_name,
        mobile: call.mobile_number,
        scheduledAt: new Date(scheduled_at).toLocaleString("en-IN"),
      });
    }
    load();
  };

  const updateClaimStatus = async (claim, status) => {
    const { error } = await supabase.from("claim_requests").update({ status }).eq("id", claim.id);
    if (error) {
      console.error("updateClaimStatus failed:", error);
      alert("Status update failed: " + error.message);
      return;
    }
    logActivity(`Claim marked as "${status.replace(/_/g, " ")}"`, "claim_request", claim.id);

    if (status === "recovered") {
      notifyUser(claim.user_id, "claim_recovered", {
        name: claim.unclaimed_records?.first_name,
        recoveredAmount: Number(claim.recovered_amount || 0).toLocaleString("en-IN"),
        successFeeAmount: Number(claim.success_fee_amount || 0).toLocaleString("en-IN"),
      });
    } else {
      notifyUser(claim.user_id, "claim_status_changed", {
        name: claim.unclaimed_records?.first_name,
        newStatus: status.replace(/_/g, " "),
      });
    }
    load();
  };

  const updateRecoveredAmount = async (id, amount) => {
    const { error } = await supabase
      .from("claim_requests")
      .update({ recovered_amount: amount === "" ? null : Number(amount) })
      .eq("id", id);
    if (error) {
      console.error("updateRecoveredAmount failed:", error);
      alert("Update failed: " + error.message);
      return;
    }
    if (amount !== "") {
      logActivity(`Recovered amount set to ₹${Number(amount).toLocaleString("en-IN")}`, "claim_request", id);
    }
    load();
  };

  const filteredCalls = useMemo(() => {
    if (!search.trim()) return calls;
    const q = search.toLowerCase();
    return calls.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(q) ||
        c.mobile_number?.toLowerCase().includes(q) ||
        c.unclaimed_records?.first_name?.toLowerCase().includes(q) ||
        c.unclaimed_records?.last_name?.toLowerCase().includes(q) ||
        c.unclaimed_records?.institution_name?.toLowerCase().includes(q)
    );
  }, [calls, search]);

  const filteredClaims = useMemo(() => {
    if (!search.trim()) return claims;
    const q = search.toLowerCase();
    return claims.filter(
      (c) =>
        c.unclaimed_records?.first_name?.toLowerCase().includes(q) ||
        c.unclaimed_records?.last_name?.toLowerCase().includes(q) ||
        c.unclaimed_records?.institution_name?.toLowerCase().includes(q) ||
        c.status?.toLowerCase().includes(q)
    );
  }, [claims, search]);

  if (isAdmin === null) {
    return <div className="max-w-3xl mx-auto px-6 py-20 text-gray-500">Checking access…</div>;
  }

  if (isAdmin === false) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-gray-500">You don't have access to this page.</p>
      </div>
    );
  }

  // Tabs visible to this role, passed to Sidebar for filtering
  const visibleTabs = Object.keys(TAB_ACCESS).filter((t) => TAB_ACCESS[t].includes(adminRole));

  return (
    <div className="flex bg-emerald-50/30 min-h-screen">
      <Sidebar
        active={tab}
        onNavigate={handleNavigate}
        counts={{ calls: calls.length, claims: claims.length }}
        allowedTabs={visibleTabs}
        role={adminRole}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader onRefresh={() => load(true)} refreshing={refreshing} />

        <div className="flex-1 px-8 py-8 w-full">
          {tab !== "dashboard" && (
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{TAB_TITLES[tab] || "Admin"}</h1>
            </div>
          )}

          {(tab === "calls" || tab === "claims") && (
            <div className="relative mb-5 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${tab === "calls" ? "calls" : "claims"}…`}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 bg-white rounded-md focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          )}

          {loading && tab !== "import" && tab !== "dashboard" && tab !== "settings" && tab !== "activity" && tab !== "manage_admins" ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-emerald-50 animate-pulse rounded-md" />
              ))}
            </div>
          ) : tab === "dashboard" ? (
            <DashboardSummary calls={calls} claims={claims} onNavigate={handleNavigate} />
          ) : tab === "calls" ? (
            filteredCalls.length === 0 ? (
              <EmptyState label={search ? "No calls match your search." : "No call requests yet."} />
            ) : (
              <>
                {/* Desktop table */}
                <table className="w-full text-sm hidden md:table">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="py-2 font-medium">Name</th>
                      <th className="py-2 font-medium">Mobile</th>
                      <th className="py-2 font-medium">Record</th>
                      <th className="py-2 font-medium">Status</th>
                      <th className="py-2 font-medium">Scheduled</th>
                      <th className="py-2 font-medium text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCalls.map((c) => (
                      <React.Fragment key={c.id}>
                        <tr className="border-b border-gray-100 hover:bg-emerald-50 transition">
                          <td className="py-3">{c.full_name}</td>
                          <td className="py-3">{c.mobile_number}</td>
                          <td className="py-3 text-gray-500">
                            {c.unclaimed_records?.first_name} {c.unclaimed_records?.last_name} ·{" "}
                            {c.unclaimed_records?.institution_name}
                          </td>
                          <td className="py-3">
                            <select
                              value={c.status}
                              onChange={(e) => updateCallStatus(c, e.target.value)}
                              className="border border-gray-200 bg-white px-2 py-1 text-sm rounded-md"
                            >
                              {CALL_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s.replace(/_/g, " ")}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 text-gray-500 text-xs">
                            {c.scheduled_at
                              ? new Date(c.scheduled_at).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => setExpandedCallId(expandedCallId === c.id ? null : c.id)}
                              className="text-xs border border-gray-200 px-3 py-1.5 rounded-md hover:border-emerald-500 transition"
                            >
                              {expandedCallId === c.id ? "Hide" : "Details"}
                            </button>
                          </td>
                        </tr>
                        {expandedCallId === c.id && (
                          <tr>
                            <td colSpan={6} className="py-4 bg-emerald-50 px-4">
                              <CallDetailsPanel call={c} onSave={updateCallDetails} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {filteredCalls.map((c) => (
                    <div key={c.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{c.full_name}</p>
                          <p className="text-xs text-gray-500">{c.mobile_number}</p>
                        </div>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        {c.unclaimed_records?.first_name} {c.unclaimed_records?.last_name} ·{" "}
                        {c.unclaimed_records?.institution_name}
                      </p>
                      {c.scheduled_at && (
                        <p className="text-xs text-amber-700 mb-2">
                          Scheduled:{" "}
                          {new Date(c.scheduled_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                      <select
                        value={c.status}
                        onChange={(e) => updateCallStatus(c, e.target.value)}
                        className="w-full border border-gray-200 bg-white px-2 py-1.5 text-sm rounded-md mb-2"
                      >
                        {CALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setExpandedCallId(expandedCallId === c.id ? null : c.id)}
                        className="w-full text-xs border border-gray-200 px-3 py-2 rounded-md hover:border-emerald-500 transition"
                      >
                        {expandedCallId === c.id ? "Hide details" : "Open details"}
                      </button>
                      {expandedCallId === c.id && (
                        <div className="mt-3">
                          <CallDetailsPanel call={c} onSave={updateCallDetails} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )
          ) : tab === "claims" ? (
            filteredClaims.length === 0 ? (
              <EmptyState label={search ? "No claims match your search." : "No claims yet."} />
            ) : (
              <>
                {/* Desktop table */}
                <table className="w-full text-sm hidden md:table">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="py-2 font-medium">Record</th>
                      <th className="py-2 font-medium">Status</th>
                      <th className="py-2 font-medium">Agreement</th>
                      <th className="py-2 font-medium text-right">Recovered ₹</th>
                      <th className="py-2 font-medium text-right">Settlement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.map((c) => (
                      <React.Fragment key={c.id}>
                        <tr className="border-b border-gray-100 hover:bg-emerald-50 transition">
                          <td className="py-3 text-gray-500">
                            {c.unclaimed_records?.first_name} {c.unclaimed_records?.last_name} ·{" "}
                            {c.unclaimed_records?.institution_name}
                          </td>
                          <td className="py-3">
                            <select
                              value={c.status}
                              onChange={(e) => updateClaimStatus(c, e.target.value)}
                              className="border border-gray-200 bg-white px-2 py-1 text-sm rounded-md"
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
                              <span className="text-xs text-emerald-600">Accepted</span>
                            ) : (
                              <span className="text-xs text-gray-500">Pending</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <input
                              type="number"
                              defaultValue={c.recovered_amount || ""}
                              onBlur={(e) => updateRecoveredAmount(c.id, e.target.value)}
                              placeholder="—"
                              className="border border-gray-200 bg-white px-2 py-1 text-sm w-28 text-right rounded-md"
                            />
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => setExpandedClaimId(expandedClaimId === c.id ? null : c.id)}
                              className="text-xs border border-gray-200 px-3 py-1.5 rounded-md hover:border-emerald-500 transition"
                            >
                              {expandedClaimId === c.id ? "Hide" : "Settle"}
                            </button>
                          </td>
                        </tr>
                        {expandedClaimId === c.id && (
                          <tr>
                            <td colSpan={5} className="py-4 bg-emerald-50 px-4">
                              <ClaimExpandPanel claim={c} onUpdated={load} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {filteredClaims.map((c) => (
                    <div key={c.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-gray-500">
                          {c.unclaimed_records?.first_name} {c.unclaimed_records?.last_name} ·{" "}
                          {c.unclaimed_records?.institution_name}
                        </p>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="flex items-center justify-between mb-2 text-xs">
                        <span className={c.agreement_accepted ? "text-emerald-600" : "text-gray-500"}>
                          Agreement: {c.agreement_accepted ? "Accepted" : "Pending"}
                        </span>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <select
                          value={c.status}
                          onChange={(e) => updateClaimStatus(c, e.target.value)}
                          className="flex-1 border border-gray-200 bg-white px-2 py-1.5 text-sm rounded-md"
                        >
                          {CLAIM_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          defaultValue={c.recovered_amount || ""}
                          onBlur={(e) => updateRecoveredAmount(c.id, e.target.value)}
                          placeholder="Recovered ₹"
                          className="w-32 border border-gray-200 bg-white px-2 py-1.5 text-sm rounded-md"
                        />
                      </div>
                      <button
                        onClick={() => setExpandedClaimId(expandedClaimId === c.id ? null : c.id)}
                        className="w-full text-xs border border-gray-200 px-3 py-2 rounded-md hover:border-emerald-500 transition"
                      >
                        {expandedClaimId === c.id ? "Hide settlement" : "Open settlement"}
                      </button>
                      {expandedClaimId === c.id && (
                        <div className="mt-3">
                          <ClaimExpandPanel claim={c} onUpdated={load} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )
          ) : tab === "import" ? (
            <ImportRecords onImported={load} />
          ) : tab === "settings" ? (
            <Settings />
          ) : tab === "settlements" ? (
            <ErrorBoundary label="Settlements">
              <Settlements />
            </ErrorBoundary>
          ) : tab === "activity" ? (
            <ActivityLog />
          ) : tab === "manage_admins" ? (
            <ManageAdmins />
          ) : null}
        </div>
      </div>
    </div>
  );
}