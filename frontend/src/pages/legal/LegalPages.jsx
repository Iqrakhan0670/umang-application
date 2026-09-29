import React from "react";

/* =====================================================
   THREE LEGAL PAGE COMPONENTS
   Save each as its own file under src/pages/legal/:
   - ClaimAssistanceTerms.jsx
   - FeeTerms.jsx
   - RefundPolicy.jsx
   Add routes for /terms, /fees, /refund-policy pointing to these,
   and link them from your Footer.jsx.
   ===================================================== */

const LAST_UPDATED = "27 September 2026";

function LegalLayout({ title, children }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-3xl text-ink mb-2">{title}</h1>
      <p className="text-sm text-stone mb-8">Last updated: {LAST_UPDATED}</p>
      <div className="space-y-6 text-sm leading-relaxed text-ink/90">{children}</div>
    </div>
  );
}

/* ---------------- 1. Claim Assistance Terms ---------------- */

export function ClaimAssistanceTerms({ setView }) {
  return (
    <LegalLayout title="Claim Assistance Terms">
      <p>
        These Claim Assistance Terms ("Terms") govern the assistance services provided by UMANG
        ("we", "us", "our") to help you identify and pursue unclaimed financial assets held with
        banks, mutual funds, insurance companies, and other institutions ("Unclaimed Assets").
      </p>

      <h2 className="font-semibold text-ink text-base">1. Nature of Service</h2>
      <p>
        UMANG is an assistance and facilitation service. We help you search for, identify, and
        prepare documentation for potential Unclaimed Assets in your name (or in the name of a
        deceased relative, where you are a legal heir). We are not a bank, financial institution,
        or government body, and we do not guarantee that any search result reflects an asset you
        are legally entitled to, or that any claim will be successful.
      </p>

      <h2 className="font-semibold text-ink text-base">2. Search Results Are Indicative</h2>
      <p>
        Search results shown on UMANG are based on publicly available unclaimed asset records and
        are indicative only. A name or partial match does not confirm ownership. Final ownership
        and entitlement are determined solely by the concerned bank, institution, or regulatory
        authority (such as the RBI, IEPF, or an insurance regulator) during the claim process.
      </p>

      <h2 className="font-semibold text-ink text-base">3. Your Responsibilities</h2>
      <p>
        You agree to provide accurate personal information and genuine documents. You are
        responsible for verifying that any asset you pursue genuinely belongs to you or to the
        person you legally represent. Submitting false claims or fraudulent documents may result
        in immediate termination of our services and, where applicable, action by the concerned
        institution or authorities.
      </p>

      <h2 className="font-semibold text-ink text-base">4. What We Do Not Do</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>We do not hold, transfer, or have access to your unclaimed funds at any point.</li>
        <li>We do not represent any government body or financial institution.</li>
        <li>We do not guarantee any timeline for claim resolution, as this depends on the concerned institution.</li>
      </ul>

      <h2 className="font-semibold text-ink text-base">5. Fees</h2>
      <p>
        Our fee structure is described separately in our{" "}
        <button onClick={() => setView && setView("fee-terms")} className="underline text-pine">
          Fee Terms
        </button>
        . By using our claim assistance service, you agree to those fee terms.
      </p>

      <h2 className="font-semibold text-ink text-base">6. Limitation of Liability</h2>
      <p>
        UMANG's liability, to the maximum extent permitted by law, is limited to the assistance
        fee paid by you. We are not liable for delays, rejections, or outcomes determined by the
        concerned institution or regulatory authority.
      </p>

      <h2 className="font-semibold text-ink text-base">7. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of our services after an update
        constitutes acceptance of the revised Terms.
      </p>

      <h2 className="font-semibold text-ink text-base">8. Contact</h2>
      <p>For any questions about these Terms, please reach out through the contact details on our website.</p>
    </LegalLayout>
  );
}

/* ---------------- 2. Fee Terms ---------------- */

export function FeeTerms({ setView }) {
  return (
    <LegalLayout title="Fee Terms">
      <p>
        UMANG charges fees only in connection with actual claim assistance work performed. There
        is no fee for searching. This page explains exactly what you pay, and when.
      </p>

      <h2 className="font-semibold text-ink text-base">1. Search is Free</h2>
      <p>Searching for unclaimed assets on UMANG is completely free, with no login required.</p>

      <h2 className="font-semibold text-ink text-base">2. Claim Assistance Fee — ₹299 (One-Time)</h2>
      <p>
        When you choose to start a claim on a matched asset, a one-time, non-recurring Claim
        Assistance Fee of ₹299 applies. This fee covers:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Preparation of your claim report and documentation checklist</li>
        <li>Guidance through the claim submission process</li>
        <li>Access to your claim dashboard and document upload system</li>
      </ul>
      <p>
        This fee is charged regardless of whether the claim is ultimately successful, as it covers
        the assistance work performed at the time of filing.
      </p>

      <h2 className="font-semibold text-ink text-base">3. Success Fee — 10% (Only If Money Is Recovered)</h2>
      <p>
        If, and only if, your claim results in an actual recovery of funds, a Success Fee of 10%
        of the recovered amount becomes payable. This is a "no recovery, no success fee" model —
        if nothing is recovered, no success fee is charged.
      </p>
      <p>
        The Success Fee amount is confirmed and agreed to by you at the time your money is
        recovered, via a Success Fee Agreement, before the fee is collected.
      </p>

      <h2 className="font-semibold text-ink text-base">4. Payment Method</h2>
      <p>
        All payments are processed securely through our payment gateway partner (Razorpay). We do
        not store your card, UPI, or bank details.
      </p>

      <h2 className="font-semibold text-ink text-base">5. Refunds</h2>
      <p>
        Refund eligibility for the Claim Assistance Fee is described in our{" "}
        <button onClick={() => setView && setView("refund-policy")} className="underline text-pine">
          Refund Policy
        </button>
        .
      </p>
    </LegalLayout>
  );
}

/* ---------------- 3. Refund Policy ---------------- */

export function RefundPolicy() {
  return (
    <LegalLayout title="Refund Policy">
      <h2 className="font-semibold text-ink text-base">1. Claim Assistance Fee (₹299)</h2>
      <p>
        The ₹299 Claim Assistance Fee covers work performed at the time your claim is filed
        (report preparation, documentation guidance, and dashboard access). Because this work is
        performed immediately after payment, this fee is <strong>generally non-refundable</strong>{" "}
        once your claim has been submitted.
      </p>
      <p>An exception applies in the following case:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          If a technical error on our end causes a duplicate charge for the same claim, the
          duplicate amount will be refunded in full within 7–10 business days of being reported.
        </li>
      </ul>

      <h2 className="font-semibold text-ink text-base">2. Success Fee (10%)</h2>
      <p>
        The Success Fee is only ever charged after money has actually been recovered into your
        account, and only after you've confirmed the amount via the Success Fee Agreement. Since
        this fee is tied to a confirmed recovery, it is non-refundable once paid.
      </p>

      <h2 className="font-semibold text-ink text-base">3. How to Request a Refund</h2>
      <p>
        If you believe you're eligible for a refund under the exception above, please contact us
        with your claim ID and payment reference. We will review and respond within 3 business
        days.
      </p>

      <h2 className="font-semibold text-ink text-base">4. Processing Time</h2>
      <p>
        Approved refunds are processed to the original payment method within 7–10 business days,
        subject to your bank's or payment provider's own processing timelines.
      </p>
    </LegalLayout>
  );
}