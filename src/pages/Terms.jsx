import React from "react";

export default function Terms() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 bg-white">
      <h1 className="font-extrabold text-4xl text-emerald-950 mb-2">Terms & Conditions</h1>
      <p className="text-slate-500 text-sm mb-10">Last updated: [DATE]</p>

      <div className="space-y-8 text-sm text-slate-500 leading-relaxed">
        <div>
          <h2 className="font-semibold text-emerald-950 mb-2">1. Who we are</h2>
          <p>
            UMANG is an independent service that helps you search for
            potential unclaimed financial assets and assists with the
            claim process. UMANG is not affiliated with any government
            body or regulator.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-emerald-950 mb-2">2. Search results</h2>
          <p>
            Search results are indicative and based on name matching.
            A result appearing in your search does not guarantee that the
            asset belongs to you — ownership is verified separately during
            the claim process.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-emerald-950 mb-2">3. Fees</h2>
          <p>
            Searching and viewing results is free. If you choose to
            proceed with Claim Assistance, a one-time, non-refundable
            ₹299 fee applies, covering document guidance, claim-process
            guidance, form assistance and support. If your asset is
            successfully recovered, a 10% success fee applies to the
            recovered amount, payable only after recovery is confirmed and
            only with your prior explicit agreement.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-emerald-950 mb-2">4. No guarantee of recovery</h2>
          <p>
            UMANG assists with the claim process but cannot guarantee that
            any claim will be successful, as final approval rests with the
            relevant institution.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-emerald-950 mb-2">5. Cancellation</h2>
          <p>
            You may withdraw a claim at any point before recovery is
            completed. The ₹299 Claim Assistance Fee is non-refundable
            once assistance has begun.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-emerald-950 mb-2">6. Governing law</h2>
          <p>
            [To be filled in — governing jurisdiction, dispute resolution
            process.]
          </p>
        </div>
      </div>

      <p className="mt-12 text-xs text-slate-400 border-t border-slate-200 pt-6">
        This is a draft policy. It should be reviewed by a qualified legal
        professional before the site goes live, and the bracketed sections
        completed.
      </p>
    </div>
  );
}