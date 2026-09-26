import React from "react";
import {
  PhoneCall,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  ReceiptIndianRupee,
  BadgeIndianRupee,
  HourglassIcon,
  CalendarDays,
  ShieldCheck,
  Upload,
  Wallet as WalletIcon,
  ArrowRight,
  PhoneCall as PhoneIcon,
} from "lucide-react";

/* ---------------- Small building blocks ---------------- */

function KpiCard({ label, value, sub, icon: Icon, emphasis }) {
  if (emphasis) {
    return (
      <div className="rounded-2xl p-6 bg-emerald-950 text-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-emerald-200">{label}</p>
          <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
            <Icon size={16} className="text-emerald-200" />
          </span>
        </div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {sub && <p className="text-xs text-emerald-300 mt-2">{sub}</p>}
      </div>
    );
  }
  return (
    <div className="rounded-2xl p-6 bg-white border border-emerald-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{label}</p>
        <span className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
          <Icon size={16} className="text-emerald-600" />
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>}
    </div>
  );
}

function MiniStat({ label, value, sub, icon: Icon, tone = "default" }) {
  const tones = {
    default: "bg-gray-100 text-gray-500",
    negative: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">{label}</p>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon size={15} />
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-1.5">{sub}</p>}
    </div>
  );
}

/** Lightweight SVG donut — no chart library dependency */
function DonutChart({ segments, total }) {
  const size = 140;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative w-[140px] h-[140px] shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ecfdf5" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const pct = total > 0 ? seg.value / total : 0;
          const dash = pct * circumference;
          const circle = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return circle;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-900">{total}</span>
        <span className="text-[10px] text-gray-400">total</span>
      </div>
    </div>
  );
}

const DONUT_PALETTE = ["#059669", "#34d399", "#a7f3d0", "#065f46", "#6ee7b7", "#10b981"];

function StatusDonutCard({ title, byStatus, total }) {
  const entries = Object.entries(byStatus);
  const segments = entries.map(([label, value], i) => ({
    label,
    value,
    color: DONUT_PALETTE[i % DONUT_PALETTE.length],
  }));

  return (
    <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-5">{title}</h3>
      {total === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No data yet.</p>
      ) : (
        <div className="flex items-center gap-6">
          <DonutChart segments={segments} total={total} />
          <div className="flex-1 space-y-2.5">
            {segments.map((seg) => (
              <div key={seg.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-600 capitalize">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
                  {seg.label.replace(/_/g, " ")}
                </span>
                <span className="font-semibold text-gray-900">{seg.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/* ---------------- Main component ---------------- */

export default function DashboardSummary({ calls, claims, onNavigate }) {
  const totalCalls = calls.length;
  const callsByStatus = calls.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const totalClaims = claims.length;
  const claimsByStatus = claims.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const recoveredClaims = claims.filter((c) => c.status === "recovered");
  const totalRecoveredAmount = recoveredClaims.reduce(
    (sum, c) => sum + Number(c.recovered_amount || 0),
    0
  );

  const assistanceFeesCollected = claims.filter((c) => c.assistance_fee_paid).length * 299;

  const successFeesDue = recoveredClaims
    .filter((c) => !c.success_fee_paid)
    .reduce((sum, c) => sum + Number(c.success_fee_amount || 0), 0);

  const successFeesCollected = claims
    .filter((c) => c.success_fee_paid)
    .reduce((sum, c) => sum + Number(c.success_fee_amount || 0), 0);

  const pendingClaims =
    (claimsByStatus.submitted || 0) +
    (claimsByStatus.under_review || 0) +
    (claimsByStatus.documents_pending || 0) +
    (claimsByStatus.filed_with_authority || 0);

  const completedClaims = claimsByStatus.recovered || 0;
  const closedBad = (claimsByStatus.rejected || 0) + (claimsByStatus.cancelled || 0);
  const totalRevenue = assistanceFeesCollected + successFeesCollected;

  // Recent activity built from real call/claim records (no fabricated data)
  const activity = [
    ...calls.map((c) => ({
      label:
        c.status === "called"
          ? "Call completed"
          : c.status === "no_answer"
          ? "Call attempted"
          : "New call request",
      at: c.created_at,
    })),
    ...claims.map((c) => ({
      label: c.status === "recovered" ? "Money recovered" : "Claim filed",
      at: c.created_at,
    })),
  ]
    .filter((a) => a.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 6);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const quickActions = [
    { label: "View Call Requests", icon: PhoneIcon, tab: "calls" },
    { label: "Manage Claims", icon: FileText, tab: "claims" },
    { label: "Settlement Panel", icon: WalletIcon, tab: "settlements" },
    { label: "Import Records", icon: Upload, tab: "import" },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your UMANG admin portal</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
          <CalendarDays size={14} className="text-emerald-600" />
          {today}
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid sm:grid-cols-3 gap-5 mb-5">
        <KpiCard
          label="Total Revenue Collected"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          sub="assistance + success fees"
          icon={Wallet}
          emphasis
        />
        <KpiCard
          label="Success Fees Pending"
          value={`₹${successFeesDue.toLocaleString("en-IN")}`}
          sub="recovered but not yet paid"
          icon={HourglassIcon}
        />
        <KpiCard
          label="Total Money Recovered"
          value={`₹${totalRecoveredAmount.toLocaleString("en-IN")}`}
          sub={`across ${completedClaims} claim${completedClaims === 1 ? "" : "s"}`}
          icon={BadgeIndianRupee}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        <MiniStat label="Total Call Requests" value={totalCalls} icon={PhoneCall} />
        <MiniStat label="Total Claims Filed" value={totalClaims} icon={FileText} />
        <MiniStat
          label="Claims in Progress"
          value={pendingClaims}
          sub="submitted / review / docs / filed"
          icon={Clock}
        />
        <MiniStat
          label="Rejected / Cancelled"
          value={closedBad}
          icon={XCircle}
          tone={closedBad > 0 ? "negative" : "default"}
        />
      </div>

      {/* Financial cards */}
      <div className="grid sm:grid-cols-2 gap-5 mb-8">
        <MiniStat
          label="Assistance Fees Collected"
          value={`₹${assistanceFeesCollected.toLocaleString("en-IN")}`}
          sub="₹299 × paid claims"
          icon={ReceiptIndianRupee}
        />
        <MiniStat
          label="Success Fees Collected"
          value={`₹${successFeesCollected.toLocaleString("en-IN")}`}
          icon={CheckCircle2}
        />
      </div>

      {/* Analytics */}
      <div className="grid lg:grid-cols-2 gap-5 mb-8">
        <StatusDonutCard title="Call Requests by Status" byStatus={callsByStatus} total={totalCalls} />
        <StatusDonutCard title="Claims by Status" byStatus={claimsByStatus} total={totalClaims} />
      </div>

      {/* Recent activity + Quick actions */}
      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No recent activity</p>
          ) : (
            <ul className="space-y-4">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="flex-1 text-sm text-gray-700">{a.label}</span>
                  <span className="text-xs text-gray-400">{timeAgo(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((qa) => (
              <button
                key={qa.tab}
                onClick={() => onNavigate && onNavigate(qa.tab)}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
              >
                <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <qa.icon size={15} className="text-emerald-600" />
                </span>
                <span className="flex-1 text-left text-sm font-medium text-gray-700">{qa.label}</span>
                <ArrowRight
                  size={15}
                  className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
        <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
        <p className="text-xs text-emerald-800">All admin data is securely protected.</p>
      </div>
    </div>
  );
}