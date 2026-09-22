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
    <section className="max-w-5xl mx-auto px-6 py-16 border-t border-ink/10">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl text-ink mb-2">
          How matching works
        </h2>
        <p className="text-stone text-sm">
          A simple, three-step way to see what the registry holds.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-10 sm:gap-6">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.num} className="relative text-center px-4">
              <div className="w-14 h-14 rounded-full bg-pine/10 flex items-center justify-center mx-auto mb-5">
                <Icon size={22} className="text-pine" />
              </div>
              <div className="text-xs tracking-widest text-brass font-medium mb-2">
                {s.num}
              </div>
              <h3 className="font-serif text-lg text-ink mb-2">{s.title}</h3>
              <p className="text-sm text-stone leading-relaxed">{s.desc}</p>

              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-7 left-[calc(50%+40px)] right-[calc(-50%+40px)] border-t border-dashed border-ink/15" />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-stone/80 mt-12 max-w-md mx-auto leading-relaxed">
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
    <section className="bg-parchment-dim/40 border-t border-ink/10">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl text-ink mb-2">
            Found a possible match?
          </h2>
          <p className="text-stone text-sm">
            Here's what happens next, one step at a time.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="bg-parchment rounded-2xl border border-ink/10 shadow-sm px-6 py-7 text-center hover:shadow-md transition"
              >
                <div className="w-11 h-11 rounded-full bg-pine/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={18} className="text-pine" />
                </div>
                <h3 className="font-serif text-base text-ink mb-1.5">
                  {c.title}
                </h3>
                <p className="text-xs text-stone leading-relaxed">{c.desc}</p>
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
    <section className="max-w-5xl mx-auto px-6 py-14 border-t border-ink/10">
      <div className="max-w-2xl mx-auto bg-parchment rounded-2xl border border-ink/10 shadow-sm px-8 py-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-brass/10 flex items-center justify-center shrink-0">
            <Info size={16} className="text-brass" />
          </div>
          <h3 className="font-serif text-xl text-ink">Before you search</h3>
        </div>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-stone">
              <span className="w-1.5 h-1.5 rounded-full bg-pine mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Privacy & Security ---------- */
function PrivacySection() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-6">
      <div className="max-w-2xl mx-auto bg-pine/5 border border-pine/15 rounded-2xl px-8 py-8 text-center">
        <div className="w-11 h-11 rounded-full bg-pine/10 flex items-center justify-center mx-auto mb-4">
          <Lock size={18} className="text-pine" />
        </div>
        <h3 className="font-serif text-xl text-ink mb-2">
          Your privacy matters
        </h3>
        <p className="text-sm text-stone leading-relaxed mb-4">
          Your name is used only to perform the requested registry search.
          Sensitive financial information should not be displayed in public
          search results.
        </p>
        <a
          href="/privacy"
          className="text-sm text-pine font-medium hover:text-pine-light transition inline-flex items-center gap-1"
        >
          View Privacy Policy →
        </a>
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
    <section className="max-w-3xl mx-auto px-6 py-16 border-t border-ink/10">
      <div className="text-center mb-10">
        <h2 className="font-serif text-3xl text-ink mb-2">
          Frequently asked questions
        </h2>
      </div>

      <div className="divide-y divide-ink/10 border-t border-b border-ink/10">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between text-left py-5 gap-4"
              >
                <span className="text-sm sm:text-base text-ink font-medium">
                  {f.q}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-stone shrink-0 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="text-sm text-stone leading-relaxed pb-5 pr-8">
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
    <section className="border-t border-ink/10 bg-parchment-dim/40">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.label}
              className="flex items-center gap-2 text-xs sm:text-sm text-stone"
            >
              <Icon size={14} className="text-pine" />
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
    <div>
      <div className="max-w-4xl mx-auto px-6 py-20 grid sm:grid-cols-5 gap-16">
        <div className="sm:col-span-3">
          <h1 className="font-serif text-4xl text-ink mb-2">
            Search the registry
          </h1>
          <p className="text-stone mb-10">
            Free to search. No account needed to see results.
          </p>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wide text-stone mb-2">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Rahul"
                  className="w-full border-b-2 border-ink/20 bg-transparent py-2 text-lg focus:outline-none focus:border-pine transition"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-stone mb-2">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sharma"
                  className="w-full border-b-2 border-ink/20 bg-transparent py-2 text-lg focus:outline-none focus:border-pine transition"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-stone cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              I authorise UMANG to search its records using this name, under
              the Digital Personal Data Protection (DPDP) Act, 2023.
            </label>

            {error && <p className="text-clay text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-pine text-parchment px-7 py-3.5 text-sm font-medium hover:bg-pine-light transition disabled:opacity-50 flex items-center gap-2"
            >
              <SearchIcon size={15} />
              {loading ? "Searching…" : "Search"}
            </button>
          </form>
        </div>

        <div className="sm:col-span-2 border-l border-ink/10 pl-10 hidden sm:block">
          <h3 className="text-xs uppercase tracking-wide text-stone mb-4">
            What we search
          </h3>
          <ul className="space-y-4 text-sm text-stone">
            <li className="flex items-center gap-3">
              <Landmark size={16} className="text-brass shrink-0" />
              Bank deposits gone dormant
            </li>
            <li className="flex items-center gap-3">
              <TrendingUp size={16} className="text-brass shrink-0" />
              Unclaimed mutual fund dividends & redemptions
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-brass shrink-0" />
              Matured, unclaimed insurance policies
            </li>
            <li className="flex items-center gap-3">
              <FileStack size={16} className="text-brass shrink-0" />
              IEPF unclaimed shares & company dividends
            </li>
          </ul>
          <p className="text-xs text-stone mt-8 leading-relaxed">
            A match means the record looks like yours by name. Ownership is
            confirmed during the claim process — matches aren't a guarantee.
          </p>
        </div>
      </div>

      {/* New informational sections below the existing search form */}
      <HowMatchingWorks />
      <FoundMatchSection />
      <BeforeYouSearch />
      <PrivacySection />
      <FAQSection />

      <p className="max-w-3xl mx-auto px-6 text-center text-xs text-stone/70 pb-10 leading-relaxed">
        Independent unclaimed asset search & claim assistance. Not affiliated
        with any government body or regulator.
      </p>

      <TrustStrip />
    </div>
  );
}