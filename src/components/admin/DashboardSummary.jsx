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
} from "lucide-react";

function StatCard({ label, value, sub, icon: Icon, tone = "default" }) {
  const toneStyles = {
    default: "border-gray-200",
    positive: "border-emerald-200 bg-emerald-50",
    warning: "border-emerald-300 bg-emerald-50",
    negative: "border-emerald-200 bg-emerald-50",
  };
  const iconTone = {
    default: "text-gray-500",
    positive: "text-emerald-600",
    warning: "text-emerald-700",
    negative: "text-emerald-700",
  };

  return (
    <div className={`border rounded-lg p-5 ${toneStyles[tone]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{label}</p>
        {Icon && <Icon size={16} className={iconTone[tone]} />}
      </div>
      <p className="text-2xl font-serif text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function StatusBar({ label, count, total, colorClass }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="py-1.5">
      <div className="flex justify-between text-sm mb-1">
        <span className="capitalize text-gray-500">{label.replace(/_/g, " ")}</span>
        <span className="font-medium text-gray-900">{count}</span>
      </div>
      <div className="h-1.5 bg-emerald-50 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const STATUS_BAR_COLORS = {
  requested: "bg-emerald-300",
  called: "bg-emerald-400",
  no_answer: "bg-emerald-200",
  closed: "bg-emerald-300",
  submitted: "bg-emerald-300",
  under_review: "bg-emerald-400",
  documents_pending: "bg-emerald-500",
  filed_with_authority: "bg-emerald-600",
  recovered: "bg-emerald-500",
  rejected: "bg-gray-400",
  cancelled: "bg-emerald-300",
};

export default function DashboardSummary({ calls, claims }) {
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

  return (
    <div>
      <h2 className="font-serif text-2xl text-gray-900 mb-6">Dashboard</h2>

      {/* Revenue highlight strip */}
      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <StatCard
          label="Total revenue collected"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          sub="assistance + success fees"
          icon={Wallet}
          tone="positive"
        />
        <StatCard
          label="Success fees pending"
          value={`₹${successFeesDue.toLocaleString("en-IN")}`}
          sub="recovered but not yet paid"
          icon={HourglassIcon}
          tone={successFeesDue > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Total money recovered"
          value={`₹${totalRecoveredAmount.toLocaleString("en-IN")}`}
          sub={`across ${completedClaims} claim${completedClaims === 1 ? "" : "s"}`}
          icon={BadgeIndianRupee}
          tone="positive"
        />
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total call requests" value={totalCalls} icon={PhoneCall} />
        <StatCard label="Total claims filed" value={totalClaims} icon={FileText} />
        <StatCard
          label="Claims in progress"
          value={pendingClaims}
          sub="submitted / review / docs / filed"
          icon={Clock}
        />
        <StatCard
          label="Rejected / cancelled"
          value={closedBad}
          icon={XCircle}
          tone={closedBad > 0 ? "negative" : "default"}
        />
        <StatCard
          label="Assistance fees collected"
          value={`₹${assistanceFeesCollected.toLocaleString("en-IN")}`}
          sub="₹299 × paid claims"
          icon={ReceiptIndianRupee}
        />
        <StatCard
          label="Success fees collected"
          value={`₹${successFeesCollected.toLocaleString("en-IN")}`}
          icon={CheckCircle2}
          tone="positive"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Call requests by status</h3>
          {totalCalls === 0 ? (
            <p className="text-sm text-gray-400">No call requests yet.</p>
          ) : (
            Object.entries(callsByStatus).map(([status, count]) => (
              <StatusBar
                key={status}
                label={status}
                count={count}
                total={totalCalls}
                colorClass={STATUS_BAR_COLORS[status] || "bg-emerald-300"}
              />
            ))
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Claims by status</h3>
          {totalClaims === 0 ? (
            <p className="text-sm text-gray-400">No claims filed yet.</p>
          ) : (
            Object.entries(claimsByStatus).map(([status, count]) => (
              <StatusBar
                key={status}
                label={status}
                count={count}
                total={totalClaims}
                colorClass={STATUS_BAR_COLORS[status] || "bg-emerald-300"}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}