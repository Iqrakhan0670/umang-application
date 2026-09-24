import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  PhoneCall,
  FileText,
  Upload,
  LayoutDashboard,
  Search,
  RefreshCw,
} from "lucide-react";
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

// Color tokens per status so admins can scan tables at a glance
const STATUS_COLORS = {
  requested: "bg-emerald-100 text-emerald-800 border-emerald-200",
  called: "bg-emerald-50 text-emerald-700 border-emerald-200",
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

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [calls, setCalls] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [expandedClaimId, setExpandedClaimId] = useState(null);
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
      if (user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        load();
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

  const TABS = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, count: null },
    { key: "calls", label: "Call requests", icon: PhoneCall, count: calls.length },
    { key: "claims", label: "Claims", icon: FileText, count: claims.length },
    { key: "import", label: "Import Records", icon: Upload, count: null },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-gray-900">Admin</h1>
        <button
          onClick={() => load(true)}
          className="flex items-center gap-2 text-xs text-gray-500 border border-gray-200 px-3 py-2 rounded-md hover:border-emerald-400 hover:text-gray-900 transition disabled:opacity-50"
          disabled={refreshing}
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm flex items-center gap-2 border-b-2 -mb-px whitespace-nowrap transition ${
              tab === key
                ? "border-emerald-600 text-emerald-600 font-medium"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Icon size={14} />
            {label}
            {count !== null && (
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  tab === key ? "bg-emerald-100 text-emerald-600" : "bg-emerald-50 text-gray-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

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

      {loading && tab !== "import" && tab !== "dashboard" ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-emerald-50 animate-pulse rounded-md" />
          ))}
        </div>
      ) : tab === "dashboard" ? (
        <DashboardSummary calls={calls} claims={claims} />
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
                </tr>
              </thead>
              <tbody>
                {filteredCalls.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-emerald-50 transition">
                    <td className="py-3">{c.full_name}</td>
                    <td className="py-3">{c.mobile_number}</td>
                    <td className="py-3 text-gray-500">
                      {c.unclaimed_records?.first_name} {c.unclaimed_records?.last_name} ·{" "}
                      {c.unclaimed_records?.institution_name}
                    </td>
                    <td className="py-3">
                      <select
                        value={c.status}
                        onChange={(e) => updateCallStatus(c.id, e.target.value)}
                        className="border border-gray-200 bg-white px-2 py-1 text-sm rounded-md"
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
                  <select
                    value={c.status}
                    onChange={(e) => updateCallStatus(c.id, e.target.value)}
                    className="w-full border border-gray-200 bg-white px-2 py-1.5 text-sm rounded-md"
                  >
                    {CALL_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
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
                          onChange={(e) => updateClaimStatus(c.id, e.target.value)}
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
                          <SettlementPanel claim={c} onUpdated={load} />
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
                      onChange={(e) => updateClaimStatus(c.id, e.target.value)}
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
                      <SettlementPanel claim={c} onUpdated={load} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )
      ) : (
        <ImportRecords onImported={load} />
      )}
    </div>
  );
}