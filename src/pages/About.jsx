import React, { useState } from "react";
import {
  Search,
  FileCheck,
  Headphones,
  ClipboardCheck,
  Wallet,
  FileText,
  ShieldCheck,
  ListChecks,
  Activity,
  CreditCard,
  Phone,
  FolderOpen,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

const TIMELINE = [
  {
    num: "01",
    icon: Search,
    title: "Search",
    desc: "Search the registry using your name.",
    note: "No account needed. Free to search.",
  },
  {
    num: "02",
    icon: FileCheck,
    title: "Match Found",
    desc: "Review the possible unclaimed asset record.",
    note: "A match is indicative and does not confirm ownership.",
  },
  {
    num: "03",
    icon: Headphones,
    title: "Claim Assistance",
    desc: "If you want assistance, start the claim assistance process.",
    note: "Get guidance on documents and the claim process.",
  },
  {
    num: "04",
    icon: ClipboardCheck,
    title: "Verification & Filing",
    desc: "Provide the required information/documents and proceed with the appropriate claim process.",
    note: null,
  },
  {
    num: "05",
    icon: Wallet,
    title: "Recovery",
    desc: "If the claim is successfully recovered, the success-fee terms apply.",
    note: null,
  },
];

const AFTER_MATCH = [
  { icon: FileText, title: "Review the record", desc: "Check the institution and asset type associated with the possible match." },
  { icon: Headphones, title: "Get assistance", desc: "Understand what information and documents may be required." },
  { icon: ShieldCheck, title: "Verify ownership", desc: "Ownership is confirmed through the relevant verification process." },
  { icon: ClipboardCheck, title: "File the claim", desc: "Proceed with the appropriate claim process." },
  { icon: Activity, title: "Track progress", desc: "Keep track of your claim status and required next steps." },
];

const WHAT_YOU_NEED = [
  { icon: CreditCard, title: "Identity details" },
  { icon: Phone, title: "Contact information" },
  { icon: FileText, title: "Relevant account/policy/share details", note: "where applicable" },
  { icon: FolderOpen, title: "Supporting documents", note: "depending on the asset and institution" },
];

const YOUR_ROLE = [
  "Provide accurate information",
  "Provide required documents",
  "Review information carefully",
  "Complete required verification",
];

const UMANG_ROLE = [
  "Help explain the available record",
  "Provide claim-process guidance",
  "Help with document requirements",
  "Provide assistance during the claim process",
];

const IMPORTANT_POINTS = [
  "A name match does not confirm ownership.",
  "Ownership must be verified during the claim process.",
  "Claim requirements can differ by institution and asset type.",
  "Recovery timelines can vary.",
  "UMANG is an independent service and is not affiliated with any government body or regulator.",
];

const FAQS = [
  {
    q: "Is searching the registry free?",
    a: "Yes. Searching UMANG's registry by name is completely free and does not require an account.",
  },
  {
    q: "What does a match mean?",
    a: "A match means a record in the registry appears to be associated with your name. It is indicative only and does not by itself confirm ownership.",
  },
  {
    q: "Does finding a match guarantee that I own the asset?",
    a: "No. Ownership is confirmed only through the verification process during the claim, not by the search result alone.",
  },
  {
    q: "What is the ₹299 claim assistance fee?",
    a: "It's a one-time fee for claim assistance — document guidance and claim-process guidance to help you file correctly.",
  },
  {
    q: "When does the 10% success fee apply?",
    a: "The 10% success fee applies only if your money is successfully recovered, as per the applicable agreement. If it isn't recovered, this fee doesn't apply.",
  },
  {
    q: "What happens if the claim is not recovered?",
    a: "If the claim isn't successfully recovered, you don't pay the success fee. Terms are shared with you before you proceed.",
  },
  {
    q: "What documents may be required?",
    a: "This depends on the asset and institution, but generally includes identity details, contact information, and relevant account, policy, or share details.",
  },
  {
    q: "How long can the claim process take?",
    a: "Timelines vary depending on the institution and the type of asset. There's no fixed recovery time we can guarantee.",
  },
  {
    q: "Is UMANG a government website?",
    a: "No. UMANG is an independent service and is not affiliated with any government body or regulator.",
  },
];

function FaqItem({ q, a, isOpen, onClick }) {
  return (
    <div className="border-b border-ink/10">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-medium text-ink text-sm sm:text-base">{q}</span>
        <ChevronDown
          size={18}
          className={`text-stone shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-40 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-stone text-sm leading-relaxed pr-8">{a}</p>
      </div>
    </div>
  );
}

export default function About() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div>
      <div className="max-w-2xl mx-auto px-6 py-20">
        <h1 className="font-serif text-4xl text-ink mb-8">How it works</h1>

        <div className="space-y-8">
          <div className="border-l-2 border-brass pl-6">
            <h3 className="font-medium text-ink mb-1">1. Search, free</h3>
            <p className="text-stone text-sm leading-relaxed">
              Search UMANG's registry by name. No account needed, no charge,
              no hidden gate — see your results immediately.
            </p>
          </div>
          <div className="border-l-2 border-brass pl-6">
            <h3 className="font-medium text-ink mb-1">2. File a claim</h3>
            <p className="text-stone text-sm leading-relaxed">
              If you find a match, sign in and start Claim Assistance for a
              one-time ₹299 fee. This covers document guidance, claim-process
              guidance, and ongoing support until your claim is filed.
            </p>
          </div>
          <div className="border-l-2 border-brass pl-6">
            <h3 className="font-medium text-ink mb-1">3. We recover it</h3>
            <p className="text-stone text-sm leading-relaxed">
              If your money is successfully recovered, UMANG charges a 10%
              success fee on the recovered amount. If it isn't recovered,
              you don't pay the success fee.
            </p>
          </div>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-6 py-16 border-t border-ink/10">
        <p className="text-xs uppercase tracking-widest text-stone font-semibold mb-2 text-center">
          The Full Journey
        </p>
        <h2 className="font-serif text-3xl text-ink mb-12 text-center">
          Your complete journey, step by step
        </h2>

        <div className="relative">
          <div className="hidden lg:block absolute top-11 left-0 right-0 h-px bg-ink/10" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4">
            {TIMELINE.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="relative flex flex-col items-center text-center">
                  <div className="relative z-10 w-[72px] h-[72px] rounded-full bg-white border border-brass/40 shadow-sm flex items-center justify-center mb-4">
                    <Icon size={22} className="text-brass" />
                  </div>
                  <p className="text-xs text-stone mb-1">{step.num}</p>
                  <h3 className="font-medium text-ink mb-2">{step.title}</h3>
                  <p className="text-stone text-sm leading-relaxed">{step.desc}</p>
                  {step.note && (
                    <p className="text-xs text-brass mt-2 italic">{step.note}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-ink/[0.03] border-y border-ink/10">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl text-ink mb-2 text-center">
            Found a possible match?
          </h2>
          <p className="text-stone text-sm text-center mb-10">
            Here's what happens next.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {AFTER_MATCH.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-ink/10 shadow-sm p-6"
                >
                  <div className="w-10 h-10 rounded-full bg-brass/10 flex items-center justify-center mb-4">
                    <Icon size={16} className="text-brass" />
                  </div>
                  <h3 className="font-medium text-ink text-sm mb-1">{item.title}</h3>
                  <p className="text-stone text-xs leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-serif text-3xl text-ink mb-10 text-center">
          What you may need
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHAT_YOU_NEED.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-ink/10 shadow-sm p-6 text-center"
              >
                <div className="w-11 h-11 rounded-full bg-brass/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={18} className="text-brass" />
                </div>
                <h3 className="font-medium text-ink text-sm mb-1">{item.title}</h3>
                {item.note && (
                  <p className="text-stone text-xs leading-relaxed">{item.note}</p>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-stone text-xs text-center mt-8">
          Requirements can vary depending on the institution and type of asset.
        </p>
      </section>

      <section className="bg-ink/[0.03] border-y border-ink/10">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-serif text-3xl text-ink mb-10 text-center">
            Simple, transparent fees
          </h2>

          <div className="grid sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-7 text-center">
              <p className="text-xs uppercase tracking-widest text-stone font-semibold mb-3">
                Search
              </p>
              <p className="font-serif text-3xl text-ink mb-3">₹0</p>
              <p className="text-stone text-xs leading-relaxed">
                Search the registry for free.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-brass/30 shadow-sm p-7 text-center">
              <p className="text-xs uppercase tracking-widest text-stone font-semibold mb-3">
                Claim Assistance
              </p>
              <p className="font-serif text-3xl text-ink mb-3">₹299</p>
              <p className="text-stone text-xs leading-relaxed">
                One-time fee for claim assistance, document guidance and
                claim-process guidance.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-7 text-center">
              <p className="text-xs uppercase tracking-widest text-stone font-semibold mb-3">
                Success Fee
              </p>
              <p className="font-serif text-3xl text-ink mb-3">10%</p>
              <p className="text-stone text-xs leading-relaxed">
                Applied only if the money is successfully recovered,
                according to the applicable agreement.
              </p>
            </div>
          </div>

          <p className="text-stone text-xs text-center mt-8">
            Fees and applicable terms are shown before you proceed.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-serif text-3xl text-ink mb-10 text-center">
          Who does what?
        </h2>

        <div className="grid sm:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-ink/10 shadow-sm p-7">
            <h3 className="font-medium text-ink mb-4 flex items-center gap-2">
              <ListChecks size={16} className="text-brass" /> Your role
            </h3>
            <ul className="space-y-3">
              {YOUR_ROLE.map((item, i) => (
                <li key={i} className="text-stone text-sm leading-relaxed flex gap-2">
                  <span className="text-brass mt-1">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-ink/10 shadow-sm p-7">
            <h3 className="font-medium text-ink mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-brass" /> UMANG's role
            </h3>
            <ul className="space-y-3">
              {UMANG_ROLE.map((item, i) => (
                <li key={i} className="text-stone text-sm leading-relaxed flex gap-2">
                  <span className="text-brass mt-1">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-stone text-xs text-center mt-8">
          UMANG does not guarantee recovery.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-brass/5 border border-brass/20 rounded-2xl p-8">
          <h3 className="font-medium text-ink mb-4">Important to know</h3>
          <ul className="space-y-2">
            {IMPORTANT_POINTS.map((point, i) => (
              <li key={i} className="text-stone text-sm leading-relaxed flex gap-2">
                <span className="text-brass mt-1">—</span> {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-16 border-t border-ink/10">
        <h2 className="font-serif text-3xl text-ink mb-10 text-center">
          Frequently asked questions
        </h2>

        <div>
          {FAQS.map((faq, i) => (
            <FaqItem
              key={i}
              q={faq.q}
              a={faq.a}
              isOpen={openFaq === i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </section>

      <section className="bg-ink/[0.03] border-y border-ink/10">
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h2 className="font-serif text-3xl text-ink mb-2">
            Ready to check if you have an unclaimed asset?
          </h2>
          <p className="text-stone text-sm mb-8">
            Search the registry for free. No account needed.
          </p>
          
            href="/"
            className="inline-flex items-center gap-2 bg-ink text-white rounded-full px-7 py-3 text-sm font-medium hover:opacity-90 transition"
          >
            Search the Registry <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 pb-20">
        <p className="text-xs text-stone border-t border-ink/10 pt-6">
          UMANG is an independent service and is not affiliated with any
          government body or regulator. Search results are indicative;
          ownership is verified during the claim process.
        </p>
      </div>
    </div>
  );
}