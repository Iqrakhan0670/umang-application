import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Search, ShieldCheck, Globe2, Leaf,
  FileSearch, PhoneCall as PhoneIcon, ClipboardCheck, ArrowRight, PlayCircle,
} from "lucide-react";

const FEATURES = [
  { icon: Search, title: "Search for Free", desc: "No account. No upfront payment." },
  { icon: ShieldCheck, title: "Trusted & Secure", desc: "Your data is protected with privacy-first technology." },
  { icon: Globe2, title: "Global Access", desc: "Available to anyone, anywhere in the world." },
  { icon: Leaf, title: "A Better Tomorrow", desc: "Less waste, more value. For you and the planet." },
];

const HOW_IT_WORKS = [
  { num: "01", icon: Search, title: "Search", desc: "Enter your name and explore available unclaimed assets." },
  { num: "02", icon: FileSearch, title: "Match Found", desc: "Review potential matches from banks, mutual funds, insurers and IEPF." },
  { num: "03", icon: PhoneIcon, title: "Call Assistance", desc: "Receive a call from our team for details and claim guidance." },
  { num: "04", icon: ClipboardCheck, title: "Claim & Recover", desc: "Submit required documents, track your claim and get your money back." },
];

export default function Home({ setView }) {
  const [recordCount, setRecordCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("unclaimed_records")
      .select("*", { count: "exact", head: true })
      .then(({ count }) => {
        setRecordCount(count ?? 0);
        setLoading(false);
      });
  }, []);

  return (
    <div className="font-heading">
      {/* HERO */}
      <section
        className="relative bg-cover bg-no-repeat overflow-hidden h-[380px] flex flex-col justify-center"
        style={{
          backgroundImage: "url('/hero-globe.png')",
          backgroundSize: "cover",
          backgroundPosition: "center 8%",
        }}
      >
        <div className="absolute inset-0 bg-white/5" />

        <div className="relative w-full px-8 lg:px-16">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-widest text-umang-dark font-bold mb-4">
              Global Access &nbsp;•&nbsp; Real Opportunities
            </p>
            <h1 className="font-extrabold text-4xl leading-[1.05] text-umang-dark mb-1">UMANG</h1>
            <h2 className="font-extrabold text-3xl sm:text-4xl leading-[1.1] text-umang-dark">
              Your Unclaimed Assets, Now Within Reach.
            </h2>
            <p className="mt-4 text-sm text-slate-600 max-w-lg leading-relaxed">
              Search, discover and claim your unclaimed money and assets from
              banks, mutual funds, insurers and IEPF — all in one place. No
              account needed. Free to search. Accessible worldwide.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <button
                onClick={() => setView("search")}
                className="bg-umang-dark text-white rounded-full px-6 py-3 text-sm font-semibold hover:opacity-90 transition flex items-center gap-2"
              >
                Search Your Name <ArrowRight size={16} />
              </button>
              <button
                onClick={() => setView("about")}
                className="border border-umang-dark/30 text-umang-dark rounded-full px-6 py-3 text-sm font-semibold hover:bg-white/60 transition flex items-center gap-2"
              >
                <PlayCircle size={16} /> Learn How It Works
              </button>
            </div>
          </div>

          <p className="font-hand text-xl text-umang-dark absolute right-10 lg:right-20 top-0 leading-tight rotate-[-4deg] hidden xl:block">
            Across<br />Borders<br />Across<br />Continents
          </p>
        </div>
      </section>

      {/* Feature strip — separate from hero */}
      <div className="relative border-t border-b border-umang-dark/10 bg-umang-mint-light">
        <div className="w-full px-8 lg:px-16 py-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-x divide-umang-dark/10">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className={`flex items-center gap-3 ${i > 0 ? "sm:pl-6" : ""}`}>
                <div className="w-11 h-11 rounded-full bg-umang-mint flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-umang-dark" />
                </div>
                <div>
                  <p className="font-semibold text-umang-dark text-sm">{f.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="w-full px-8 lg:px-16 py-20 bg-white">
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Simple Steps</p>
            <h2 className="font-extrabold text-4xl text-umang-dark mb-1">How It Works</h2>
            <p className="text-slate-500">Find your unclaimed assets in just a few easy steps.</p>
          </div>
          <p className="font-hand text-xl text-umang-dark hidden md:block rotate-[-3deg]">
            It's simple,<br />just 4 steps!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.num}>
                <div className="flex-1 border border-umang-dark/10 rounded-xl p-6 bg-white shadow-sm">
                  <div className="w-11 h-11 rounded-full bg-umang-mint flex items-center justify-center mb-5">
                    <Icon size={18} className="text-umang-dark" />
                  </div>
                  <p className="text-xs text-slate-400 mb-1">{step.num}</p>
                  <h3 className="font-bold text-umang-dark mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>

                {i < HOW_IT_WORKS.length - 1 && (
                  <ArrowRight size={20} className="text-slate-300 shrink-0 hidden lg:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* STATS BAND */}
      <section
        className="relative text-white bg-cover bg-no-repeat h-[140px] flex items-center"
        style={{
          backgroundImage: "url('/hero-globe.png')",
          backgroundPosition: "center 85%",
        }}
      >
        <div className="absolute inset-0 bg-umang-dark/55" />
        <div className="relative w-full px-8 lg:px-16 flex flex-wrap items-center justify-between gap-8">
          <div>
            <h3 className="font-extrabold text-xl">UMANG</h3>
            <p className="text-white/70 text-sm mt-1">Turning unclaimed assets into new possibilities.</p>
          </div>
          <div className="flex flex-wrap gap-10 text-sm">
            <div>
              <p className="font-extrabold text-2xl">
                {loading ? "—" : `${recordCount?.toLocaleString("en-IN")}+`}
              </p>
              <p className="text-white/70">Records searchable</p>
            </div>
            <div>
              <p className="font-extrabold text-2xl">10%</p>
              <p className="text-white/70">Only if recovered</p>
            </div>
            <div>
              <p className="font-extrabold text-2xl">100%</p>
              <p className="text-white/70">Secure &amp; Private</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}