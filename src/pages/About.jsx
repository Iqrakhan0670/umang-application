import React from "react";

export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 bg-white">
      <h1 className="font-extrabold text-4xl text-emerald-950 mb-8">How it works</h1>

      <div className="space-y-8">
        <div className="border-l-2 border-emerald-700 pl-6">
          <h3 className="font-semibold text-emerald-950 mb-1">1. Search, free</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Search UMANG's registry by name. No account needed, no charge,
            no hidden gate — see your results immediately.
          </p>
        </div>
        <div className="border-l-2 border-emerald-700 pl-6">
          <h3 className="font-semibold text-emerald-950 mb-1">2. File a claim</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            If you find a match, sign in and start Claim Assistance for a
            one-time ₹299 fee. This covers document guidance, claim-process
            guidance, and ongoing support until your claim is filed.
          </p>
        </div>
        <div className="border-l-2 border-emerald-700 pl-6">
          <h3 className="font-semibold text-emerald-950 mb-1">3. We recover it</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            If your money is successfully recovered, UMANG charges a 10%
            success fee on the recovered amount. If it isn't recovered,
            you don't pay the success fee.
          </p>
        </div>
      </div>

      <p className="mt-12 text-xs text-slate-400 border-t border-slate-200 pt-6">
        UMANG is an independent service and is not affiliated with any
        government body or regulator. Search results are indicative;
        ownership is verified during the claim process.
      </p>
    </div>
  );
}