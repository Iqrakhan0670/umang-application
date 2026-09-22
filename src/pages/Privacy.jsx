import React from "react";

export default function Privacy() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="font-serif text-4xl text-ink mb-2">Privacy Policy</h1>
      <p className="text-stone text-sm mb-10">Last updated: [DATE]</p>

      <div className="space-y-8 text-sm text-stone leading-relaxed">
        <div>
          <h2 className="font-medium text-ink mb-2">1. What we collect</h2>
          <p>
            When you search, we process the name you enter to match against
            our records. When you request a call or file a claim, we
            collect your name, mobile number, email address, and any
            documents you later share with our team for claim assistance.
          </p>
        </div>
        <div>
          <h2 className="font-medium text-ink mb-2">2. Why we collect it</h2>
          <p>
            Your details are used solely to: (a) search for a potential
            match in our records, (b) contact you about a claim you've
            initiated, and (c) assist with filing that claim with the
            relevant institution. We do not use your data for any other
            purpose.
          </p>
        </div>
        <div>
          <h2 className="font-medium text-ink mb-2">3. Your consent</h2>
          <p>
            Every search and claim request requires your explicit consent,
            given at the point of action, under the Digital Personal Data
            Protection (DPDP) Act, 2023.
          </p>
        </div>
        <div>
          <h2 className="font-medium text-ink mb-2">4. Data retention</h2>
          <p>
            [To be filled in — how long is data kept, and for how long
            after a claim is closed.]
          </p>
        </div>
        <div>
          <h2 className="font-medium text-ink mb-2">5. Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your
            personal data at any time by contacting us at [SUPPORT EMAIL].
          </p>
        </div>
        <div>
          <h2 className="font-medium text-ink mb-2">6. Third parties</h2>
          <p>
            We do not sell your data. [List any processors — e.g. email
            provider, payment gateway — once finalised.]
          </p>
        </div>
      </div>

      <p className="mt-12 text-xs text-stone border-t border-ink/10 pt-6">
        This is a draft policy. It should be reviewed by a qualified legal
        professional before the site goes live, and the bracketed sections
        completed.
      </p>
    </div>
  );
}