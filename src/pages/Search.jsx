

Search · JSX
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  SearchIcon,
  Landmark,
  TrendingUp,
  ShieldCheck,
  FileStack,
  ClipboardCheck,
  UserCheck,
  ScrollText,
  Wallet,
  LifeBuoy,
  BadgeCheck,
  Info,
  Lock,
  ChevronDown,
  ShieldCheck as ShieldIcon,
  UserRound,
  Building2,
} from "lucide-react";
 
/* ---------- How matching works ---------- */
function HowMatchingWorks() {
  const steps = [
    {
      num: "01",
      title: "Search",
      desc: "Enter your name and search the available registry records.",
      icon: SearchIcon,
    },
    {
      num: "02",
      title: "Match Found",
      desc: "We identify possible records that may match your name.",
      icon: UserCheck,
    },
    {
      num: "03",
      title: "Review",
      desc: "Review the possible match and decide whether to proceed with verification.",
      icon: ClipboardCheck,
    },
  ];
 
  return (
    <section className="w-full px-[6vw] lg:px-[8vw] py-16 border-t border-emerald-950/10">
      <div className="text-center mb-12">
        <h2 className="font-extrabold text-3xl text-emerald-950 mb-2">
          How matching works
        </h2>
        <p className="text-emerald-950/60 text-sm">
          A simple, three-step way to see what the registry holds.
        </p>
      </div>
 
      <div className="grid sm:grid-cols-3 gap-10 sm:gap-6">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.num} className="relative text-center px-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <Icon size={22} className="text-emerald-950" />
              </div>
              <div className="text-xs tracking-widest text-emerald-700 font-semibold mb-2">
                {s.num}
              </div>
              <h3 className="font-extrabold text-lg text-emerald-950 mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-emerald-950/60 leading-relaxed">
                {s.desc}
              </p>
 
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-7 left-[calc(50%+40px)] right-[calc(-50%+40px)] border-t border-dashed border-emerald-950/15" />
              )}
            </div>
          );
        })}
      </div>
 
      <p className="text-center text-xs text-emerald-950/40 mt-12 max-w-md mx-auto leading-relaxed">
        A name match does not confirm ownership. Ownership is verified during
        the claim process.
      </p>
    </section>
  );
}
 
/* ---------- Found a possible match? ---------- */
function FoundMatchSection() {
  const cards = [
    {
      icon: ScrollText,
      title: "Review Match",
      desc: "Check the institution and asset type.",
    },
    {
      icon: LifeBuoy,
      title: "Assistance",
      desc: "Get guidance about the possible record.",
    },
    {
      icon: BadgeCheck,
      title: "Verify Ownership",
      desc: "Provide the information required for verification.",
    },
    {
      icon: Wallet,
      title: "Claim",
      desc: "Proceed with the appropriate claim process.",
    },
  ];
 
  return (
    <section className="bg-emerald-50/30 border-t border-emerald-950/10">
      <div className="w-full px-[6vw] lg:px-[8vw] py-16">
        <div className="text-center mb-12">
          <h2 className="font-extrabold text-3xl text-emerald-950 mb-2">
            Found a possible match?
          </h2>
          <p className="text-emerald-950/60 text-sm">
            Here's what happens next, one step at a time.
          </p>
        </div>
 
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="bg-white rounded-2xl border border-emerald-950/10 shadow-sm px-6 py-7 text-center hover:shadow-md hover:border-emerald-700/30 transition"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Icon size={18} className="text-emerald-950" />
                </div>
                <h3 className="font-extrabold text-base text-emerald-950 mb-1.5">
                  {c.title}
                </h3>
                <p className="text-xs text-emerald-950/60 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
 
/* ---------- Before you search ---------- */
function BeforeYouSearch() {
  const items = [
    "Use your legal/full name",
    "Check the spelling carefully",
    "Try name variations if appropriate",
    "A result is only a possible match",
  ];
 
  return (
    <section className="w-full px-[6vw] lg:px-[8vw] py-14 border-t border-emerald-950/10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-emerald-950/10 shadow-sm px-8 py-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <Info size={16} className="text-emerald-950" />
          </div>
          <h3 className="font-extrabold text-xl text-emerald-950">
            Before you search
          </h3>
        </div>
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm text-emerald-950/70"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
 
/* ---------- Privacy & Security ---------- */
function PrivacySection({ setView }) {
  return (
    <section className="w-full px-[6vw] lg:px-[8vw] py-6">
      <div className="max-w-2xl mx-auto bg-emerald-50/40 border border-emerald-700/20 rounded-2xl px-8 py-8 text-center">
        <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
          <Lock size={18} className="text-emerald-950" />
        </div>
        <h3 className="font-extrabold text-xl text-emerald-950 mb-2">
          Your privacy matters
        </h3>
        <p className="text-sm text-emerald-950/60 leading-relaxed mb-4">
          Your name is used only to perform the requested registry search.
          Sensitive financial information should not be displayed in public
          search results.
        </p>
        <button
          onClick={() => setView("privacy")}
          className="text-sm text-emerald-950 font-semibold hover:text-emerald-700 transition inline-flex items-center gap-1"
        >
          View Privacy Policy →
        </button>
      </div>
    </section>
  );
}
 
/* ---------- FAQ ---------- */
function FAQSection() {
  const faqs = [
    {
      q: "Is the search free?",
      a: "Yes. Searching the registry is completely free and does not require an account.",
    },
    {
      q: "Does a match mean the money belongs to me?",
      a: "No. A match only means a record looks similar to your name. Ownership is confirmed separately during the verification and claim process.",
    },
    {
      q: "What happens if I find a match?",
      a: "You can review the match details and choose to request assistance. Our team will guide you through the verification and claim process.",
    },
    {
      q: "Do I need an account to search?",
      a: "No account is needed to search. You may be asked to sign in only when taking further action, such as requesting assistance on a specific record.",
    },
    {
      q: "What information may be required to claim?",
      a: "This typically includes identity proof, address proof, and documents linking you to the account or policy. Exact requirements depend on the institution and asset type.",
    },
  ];
 
  const [open, setOpen] = useState(null);
 
  return (
    <section className="max-w-3xl mx-auto px-6 py-16 border-t border-emerald-950/10">
      <div className="text-center mb-10">
        <h2 className="font-extrabold text-3xl text-emerald-950 mb-2">
          Frequently asked questions
        </h2>
      </div>
 
      <div className="divide-y divide-emerald-950/10 border-t border-b border-emerald-950/10">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between text-left py-5 gap-4"
              >
                <span className="text-sm sm:text-base text-emerald-950 font-medium">
                  {f.q}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-emerald-700 shrink-0 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="text-sm text-emerald-950/60 leading-relaxed pb-5 pr-8">
                  {f.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
 
/* ---------- Trust strip ---------- */
function TrustStrip() {
  const items = [
    { icon: ShieldIcon, label: "Secure Search" },
    { icon: UserRound, label: "No account required" },
    { icon: SearchIcon, label: "Free registry search" },
    { icon: Building2, label: "Independent service" },
  ];
 
  return (
    <section className="border-t border-emerald-950/10 bg-emerald-50/30">
      <div className="w-full px-[6vw] lg:px-[8vw] py-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.label}
              className="flex items-center gap-2 text-xs sm:text-sm text-emerald-950/70"
            >
              <Icon size={14} className="text-emerald-700" />
              {it.label}
            </div>
          );
        })}
      </div>
    </section>
  );
}
 
export default function Search({ setView, setResults }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
 
    if (!firstName.trim()) {
      setError("Enter at least a first name to search.");
      return;
    }
    if (!consent) {
      setError("Please confirm the consent checkbox to continue.");
      return;
    }
 
    setLoading(true);
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    try {
      const { data, error: searchError } = await supabase.rpc(
        "fuzzy_search_unclaimed_records",
        { p_search_name: fullName },
      );
      if (searchError) throw searchError;
      setResults({ query: fullName, records: data || [] });
      setView("results");
    } catch (err) {
      console.error(err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="bg-white">
      <div className="w-full px-[6vw] lg:px-[8vw] py-20 grid sm:grid-cols-5 gap-16">
        <div className="sm:col-span-3">
          <h1 className="font-extrabold text-4xl text-emerald-950 mb-2">
            Search the registry
          </h1>
          <p className="text-emerald-950/60 mb-10">
            Free to search. No account needed to see results.
          </p>
 
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wide text-emerald-950/50 mb-2">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Rahul"
                  className="w-full border-b-2 border-emerald-950/15 bg-transparent py-2 text-lg focus:outline-none focus:border-emerald-700 transition"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-emerald-950/50 mb-2">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sharma"
                  className="w-full border-b-2 border-emerald-950/15 bg-transparent py-2 text-lg focus:outline-none focus:border-emerald-700 transition"
                />
              </div>
            </div>
 
            <div>
              <label className="block text-xs uppercase tracking-wide text-emerald-950/50 mb-2">
                Mobile number
              </label>
              <input
                type="tel"
                maxLength="10"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                placeholder="98765 43210"
                className="w-full border-b-2 border-emerald-950/15 bg-transparent py-2 text-lg focus:outline-none focus:border-emerald-700 transition"
              />
              <p className="text-xs text-emerald-950/40 mt-1.5">
                Enter the mobile number linked to the account or asset — the
                same number that's registered wherever this was held.
              </p>
            </div>
 
            <label className="flex items-start gap-3 text-sm text-emerald-950/60 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 accent-emerald-700"
              />
              I authorise UMANG to search its records using this name, under
              the Digital Personal Data Protection (DPDP) Act, 2023.
            </label>
 
            {error && <p className="text-red-500 text-sm">{error}</p>}
 
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-emerald-950 text-white px-7 py-3.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
            >
              <SearchIcon size={15} />
              {loading ? "Searching…" : "Search"}
            </button>
          </form>
        </div>
 
        <div className="sm:col-span-2 border-l border-emerald-950/10 pl-10 hidden sm:block">
          <h3 className="text-xs uppercase tracking-wide text-emerald-950/50 mb-4">
            What we search
          </h3>
          <ul className="space-y-4 text-sm text-emerald-950/70">
            <li className="flex items-center gap-3">
              <Landmark size={16} className="text-emerald-700 shrink-0" />
              Bank deposits gone dormant
            </li>
            <li className="flex items-center gap-3">
              <TrendingUp size={16} className="text-emerald-700 shrink-0" />
              Unclaimed mutual fund dividends & redemptions
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
              Matured, unclaimed insurance policies
            </li>
            <li className="flex items-center gap-3">
              <FileStack size={16} className="text-emerald-700 shrink-0" />
              IEPF unclaimed shares & company dividends
            </li>
          </ul>
          <p className="text-xs text-emerald-950/50 mt-8 leading-relaxed">
            A match means the record looks like yours by name. Ownership is
            confirmed during the claim process — matches aren't a guarantee.
          </p>
        </div>
      </div>
 
      {/* New informational sections below the existing search form */}
      <HowMatchingWorks />
      <FoundMatchSection />
      <BeforeYouSearch />
      <PrivacySection setView={setView} />
      <FAQSection />
 
      <p className="max-w-3xl mx-auto px-6 text-center text-xs text-emerald-950/40 pb-10 leading-relaxed">
        Independent unclaimed asset search & claim assistance. Not affiliated
        with any government body or regulator.
      </p>
 
      <TrustStrip />
    </div>
  );
}
 
