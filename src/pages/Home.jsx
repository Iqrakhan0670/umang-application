import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import {
  Search,
  ShieldCheck,
  Globe2,
  Leaf,
  FileSearch,
  PhoneCall as PhoneIcon,
  ClipboardCheck,
  ArrowRight,
  PlayCircle,
  Users,
  Database,
  LockKeyhole,
} from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    title: "Search for Free",
    text: "No account. No upfront payment.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted & Secure",
    text: "Your data is protected with privacy-first technology.",
  },
  {
    icon: Globe2,
    title: "Global Access",
    text: "Available to anyone, anywhere in the world.",
  },
  {
    icon: Leaf,
    title: "A Better Tomorrow",
    text: "Less waste, more value. For you and the planet.",
  },
];

const HOW_IT_WORKS = [
  {
    number: "01",
    icon: Search,
    title: "Search",
    text: "Enter your name and explore available unclaimed assets.",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    number: "02",
    icon: FileSearch,
    title: "Match Found",
    text: "Review potential matches from banks, mutual funds, insurers and IEPF.",
    color: "bg-sky-100 text-sky-700",
  },
  {
    number: "03",
    icon: PhoneIcon,
    title: "AI Assistance",
    text: "Receive a call from our AI assistant for details and claim guidance.",
    color: "bg-violet-100 text-violet-700",
  },
  {
    number: "04",
    icon: ClipboardCheck,
    title: "Claim & Recover",
    text: "Submit required documents, track your claim and get your money back.",
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function Home({ setView }) {
  const [recordCount, setRecordCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Arrow hover state
  const [hoveredArrow, setHoveredArrow] = useState(null);

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
    <main className="w-full overflow-hidden">

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative min-h-[590px] lg:min-h-[650px] overflow-hidden">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-[85%_25%]"
          style={{
            backgroundImage: "url('/hero-globe.png')",
            filter: "brightness(0.82) contrast(1.08) saturate(1.05)",
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 w-full px-[6vw] lg:px-[8vw] pt-16 lg:pt-20">
          <div className="max-w-[600px] text-left">

            {/* Small heading */}
            <p className="mb-4 text-[10px] sm:text-[11px] font-extrabold tracking-[0.20em] text-emerald-800 uppercase text-left">
              GLOBAL ACCESS
              <span className="mx-2">•</span>
              REAL OPPORTUNITIES
            </p>

            {/* UMANG */}
            <h1 className="text-5xl sm:text-6xl lg:text-[72px] leading-[0.92] font-extrabold tracking-[-0.04em] text-emerald-950">
              UMANG
            </h1>

            {/* Main heading */}
            <h2 className="mt-3 text-left text-[31px] sm:text-[35px] lg:text-[40px] leading-[1.02] font-extrabold tracking-[-0.035em] text-emerald-950">
              Your Unclaimed Assets,
              <br />
              Now Within Reach.
            </h2>

            {/* Description */}
            <p className="mt-4 max-w-[555px] text-left text-[12px] sm:text-[13px] leading-[1.55] font-medium text-slate-700">
              Search, discover and claim your unclaimed money and assets from
              banks, mutual funds, insurers and IEPF — all in one place. No
              account needed. Free to search. Accessible worldwide.
            </p>

            {/* Buttons */}
            <div className="mt-5 flex flex-wrap items-center gap-3">

              <button
                onClick={() => setView("search")}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-950 px-6 py-3 text-[12px] font-bold text-white shadow-md transition-all duration-200 hover:bg-emerald-900 hover:-translate-y-0.5"
              >
                <Search size={16} strokeWidth={2} />
                <span>Search Your Name</span>
                <ArrowRight size={15} strokeWidth={2} />
              </button>

              <button
                onClick={() => setView("about")}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-800/35 bg-white/70 px-6 py-3 text-[12px] font-bold text-emerald-950 backdrop-blur-sm transition-all duration-200 hover:bg-white"
              >
                <PlayCircle size={16} strokeWidth={2} />
                <span>Learn How It Works</span>
              </button>

            </div>

            {/* Trust line */}
            <p className="mt-4 text-left text-[11px] font-medium text-slate-600">
              Trusted to help reconnect people with what&apos;s rightfully
              theirs.
            </p>

          </div>
        </div>
      </section>


      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section className="border-b border-slate-200 bg-white">

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className={`
                  flex items-center gap-4
                  px-[6vw] lg:px-[4vw] xl:px-[5vw]
                  py-7
                  ${
                    index !== 0
                      ? "border-t sm:border-t-0 sm:border-l border-slate-200"
                      : ""
                  }
                `}
              >

                <div className="w-11 h-11 shrink-0 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Icon
                    size={19}
                    strokeWidth={1.8}
                    className="text-emerald-700"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-emerald-950">
                    {feature.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500 max-w-[220px]">
                    {feature.text}
                  </p>
                </div>

              </div>
            );
          })}

        </div>
      </section>


      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}
      <section className="bg-white py-20 lg:py-24">

        <div className="w-full px-[6vw] lg:px-[8vw]">

          {/* Section Heading */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">

            <div>
              <p className="text-[11px] font-bold tracking-[0.22em] text-emerald-700 uppercase mb-3">
                SIMPLE STEPS
              </p>

              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-950">
                How It Works
              </h2>

              <p className="mt-3 text-sm sm:text-base text-slate-500">
                Find your unclaimed assets in just a few easy steps.
              </p>
            </div>

            <div className="lg:pr-[7vw]">
              <p className="font-serif italic text-sm text-emerald-700 rotate-[-2deg]">
                It&apos;s simple,
                <br />
                just 4 steps! :)
              </p>
            </div>

          </div>


          {/* =================================================
              HOW IT WORKS CARDS
          ================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {HOW_IT_WORKS.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >

                  {/* -----------------------------------------
                      Mint Side Highlight
                      Only appears when arrow is hovered
                  ----------------------------------------- */}
                  <div
                    className={`absolute top-6 bottom-6 right-0 w-1 rounded-l-full bg-emerald-300 transition-opacity duration-200 ${
                      hoveredArrow === index
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />


                  {/* -----------------------------------------
                      Arrow Between Cards
                  ----------------------------------------- */}
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div
                      className="
                        hidden xl:flex
                        absolute top-1/2 -right-4
                        z-20
                        w-8 h-8
                        -translate-y-1/2
                        items-center justify-center
                        rounded-full
                        bg-white
                        border border-slate-200
                        cursor-pointer
                        transition-all duration-200
                        hover:bg-emerald-50
                        hover:border-emerald-300
                      "
                      onMouseEnter={() => setHoveredArrow(index)}
                      onMouseLeave={() => setHoveredArrow(null)}
                    >
                      <ArrowRight
                        size={18}
                        className="text-emerald-700"
                      />
                    </div>
                  )}


                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center ${step.color}`}
                  >
                    <Icon size={19} />
                  </div>


                  {/* Number */}
                  <p className="mt-5 text-[10px] font-bold tracking-[0.15em] text-emerald-700">
                    {step.number}
                  </p>


                  {/* Title */}
                  <h3 className="mt-1 text-base font-extrabold text-emerald-950">
                    {step.title}
                  </h3>


                  {/* Description */}
                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    {step.text}
                  </p>

                </div>
              );
            })}

          </div>

        </div>
      </section>

{/* =====================================================
    STATS + FOOTER
===================================================== */}
<section className="relative overflow-hidden bg-emerald-950 text-white">

  <div
    className="absolute inset-0 bg-cover bg-center opacity-10"
    style={{
      backgroundImage: "url('/hero-globe.png')",
    }}
  />

  <div className="absolute inset-0 bg-emerald-950/90" />

  <div className="relative z-10 w-full px-[6vw] lg:px-[8vw]">

    {/* STATS */}
    <div className="py-8 lg:py-9">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-emerald-200 text-sm font-black">₹</span>
          </div>

          <div>
            <p className="text-base font-extrabold">UMANG</p>
            <p className="mt-0.5 text-[11px] leading-4 text-white/55">
              Turning unclaimed assets into new possibilities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <Users size={16} />
          </div>

          <div>
            <p className="text-lg font-extrabold">
              {loading ? "—" : `${recordCount}+`}
            </p>
            <p className="mt-0.5 text-[11px] text-white/55">
              Records searchable
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <Database size={16} />
          </div>

          <div>
            <p className="text-lg font-extrabold">₹500 Cr+</p>
            <p className="mt-0.5 text-[11px] text-white/55">
              Estimated unclaimed assets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <LockKeyhole size={16} />
          </div>

          <div>
            <p className="text-lg font-extrabold">100%</p>
            <p className="mt-0.5 text-[11px] text-white/55">
              Secure &amp; Private
            </p>
          </div>
        </div>

      </div>
    </div>


    {/* FOOTER — ONLY ONCE */}
    <div className="border-t border-white/10 py-6">

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div className="flex items-start gap-3">

          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-emerald-200 text-sm font-black">
              ₹
            </span>
          </div>

          <div>
            <p className="text-sm font-extrabold">
              UMANG
            </p>

            <p className="mt-1 max-w-[520px] text-[11px] leading-5 text-white/50">
              Independent unclaimed asset search &amp; claim assistance.
              Not affiliated with any government body or regulator.
            </p>
          </div>

        </div>


        <div className="flex items-center gap-5 text-[11px] font-semibold text-white/55">

          <button
            onClick={() => setView("privacy")}
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </button>

          <button
            onClick={() => setView("terms")}
            className="hover:text-white transition-colors"
          >
            Terms
          </button>

          <button
            onClick={() => setView("contact")}
            className="hover:text-white transition-colors"
          >
            Contact
          </button>

        </div>

      </div>

    </div>

  </div>
</section>
    </main>
  );
}