import React from "react";

function StatCard({ label, value, sub }) {
  return (
    <div className="border border-ink/10 p-5">
      <p className="text-2xl font-serif text-ink">{value}</p>
      <p className="text-sm text-stone mt-1">{label}</p>
      {sub && <p className="text-xs text-stone/70 mt-0.5">{sub}</p>}
    </div>
  );
}

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

  const completedClaims = (claimsByStatus.recovered || 0);
  const closedBad = (claimsByStatus.rejected || 0) + (claimsByStatus.cancelled || 0);

  return (
    <div>
      <h2 className="font-serif text-2xl text-ink mb-6">Dashboard</h2>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total call requests" value={totalCalls} />
        <StatCard label="Total claims filed" value={totalClaims} />
        <StatCard
          label="Claims in progress"
          value={pendingClaims}
          sub="submitted / under review / docs / filed"
        />
        <StatCard label="Recovered claims" value={completedClaims} />
        <StatCard label="Rejected / cancelled" value={closedBad} />
        <StatCard
          label="Total money recovered"
          value={`₹${totalRecoveredAmount.toLocaleString("en-IN")}`}
        />
        <StatCard
          label="Assistance fees collected"
          value={`₹${assistanceFeesCollected.toLocaleString("en-IN")}`}
          sub="₹299 × paid claims"
        />
        <StatCard
          label="Success fees collected"
          value={`₹${successFeesCollected.toLocaleString("en-IN")}`}
        />
        <StatCard
          label="Success fees pending"
          value={`₹${successFeesDue.toLocaleString("en-IN")}`}
          sub="recovered but not yet paid"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-ink mb-2">Call requests by status</h3>
          <ul className="text-sm text-stone space-y-1">
            {Object.entries(callsByStatus).map(([status, count]) => (
              <li key={status} className="flex justify-between border-b border-ink/5 py-1">
                <span className="capitalize">{status.replace("_", " ")}</span>
                <span className="font-medium text-ink">{count}</span>
              </li>
            ))}
            {totalCalls === 0 && <li className="text-stone/60">No call requests yet.</li>}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-medium text-ink mb-2">Claims by status</h3>
          <ul className="text-sm text-stone space-y-1">
            {Object.entries(claimsByStatus).map(([status, count]) => (
              <li key={status} className="flex justify-between border-b border-ink/5 py-1">
                <span className="capitalize">{status.replace("_", " ")}</span>
                <span className="font-medium text-ink">{count}</span>
              </li>
            ))}
            {totalClaims === 0 && <li className="text-stone/60">No claims filed yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}