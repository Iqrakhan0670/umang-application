import React, { useMemo } from "react";
import { Wallet, CheckCircle2, HourglassIcon } from "lucide-react";

function SummaryCard({ label, value, icon: Icon, tone = "default" }) {
  const tones = {
    default: "bg-white border-gray-200",
    positive: "bg-gradient-to-br from-emerald-50 to-white border-emerald-200",
    warning: "bg-gradient-to-br from-amber-50 to-white border-amber-200",
  };
  const iconTones = {
    default: "bg-gray-100 text-gray-500",
    positive: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
  };
  return (
    <div className={`rounded-2xl p-5 border shadow-sm ${tones[tone]}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">{label}</p>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconTones[tone]}`}>
          <Icon size={15} />
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function Settlements({ claims }) {
  const recoveredClaims = useMemo(
    () => claims.filter((c) => c.status === "recovered"),
    [claims]
  );

  const totalRecovered = recoveredClaims.reduce(
    (sum, c) => sum + Number(c.recovered_amount || 0),
    0
  );
  const feesCollected = recoveredClaims
    .filter((c) => c.success_fee_paid)
    .reduce((sum, c) => sum + Number(c.success_fee_amount || 0), 0);
  const feesPending = recoveredClaims
    .filter((c) => !c.success_fee_paid)
    .reduce((sum, c) => sum + Number(c.success_fee_amount || 0), 0);

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-5 mb-6">
        <SummaryCard
          label="Total Recovered"
          value={`₹${totalRecovered.toLocaleString("en-IN")}`}
          icon={Wallet}
          tone="positive"
        />
        <SummaryCard
          label="Success Fees Collected"
          value={`₹${feesCollected.toLocaleString("en-IN")}`}
          icon={CheckCircle2}
          tone="positive"
        />
        <SummaryCard
          label="Success Fees Pending"
          value={`₹${feesPending.toLocaleString("en-IN")}`}
          icon={HourglassIcon}
          tone={feesPending > 0 ? "warning" : "default"}
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {recoveredClaims.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">No settled claims yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500 bg-gray-50/50">
                <th className="py-3 px-5 font-medium">Record</th>
                <th className="py-3 px-5 font-medium text-right">Recovered ₹</th>
                <th className="py-3 px-5 font-medium text-right">Success Fee ₹</th>
                <th className="py-3 px-5 font-medium">Fee Status</th>
              </tr>
            </thead>
            <tbody>
              {recoveredClaims.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-b-0 hover:bg-emerald-50/40 transition">
                  <td className="py-3 px-5 text-gray-700">
                    {c.unclaimed_records?.first_name} {c.unclaimed_records?.last_name} ·{" "}
                    <span className="text-gray-400">{c.unclaimed_records?.institution_name}</span>
                  </td>
                  <td className="py-3 px-5 text-right font-medium text-gray-900">
                    ₹{Number(c.recovered_amount || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-5 text-right font-medium text-gray-900">
                    ₹{Number(c.success_fee_amount || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-5">
                    {c.success_fee_paid ? (
                      <span className="inline-block text-[11px] font-medium px-2 py-1 rounded-full border bg-emerald-100 text-emerald-800 border-emerald-200">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-block text-[11px] font-medium px-2 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}