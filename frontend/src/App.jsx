import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import ChatWidget from "./components/ChatWidget";

import Home from "./pages/Home";
import Search from "./pages/Search";
import Results from "./pages/Results";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact"; {/* NEW */}
import { ClaimAssistanceTerms, FeeTerms, RefundPolicy } from "./pages/legal/LegalPages";

export default function App() {
  const [view, setView] = useState("home");
  const [results, setResults] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const [pendingCallRequestId, setPendingCallRequestId] = useState(null);
  const [calledRequest, setCalledRequest] = useState(null);

  const checkCalledRequests = async () => {
    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem("umang_call_request_ids") || "[]");
    } catch {
      stored = [];
    }
    if (!stored.length) return;

    const ids = stored
      .map((item) => (typeof item === "string" ? item : item?.id))
      .filter(Boolean);
    if (!ids.length) return;

    const { data: rpcData, error } = await supabase.rpc("check_called_requests", {
      p_request_ids: ids,
    });

    let calls = rpcData;
    if (error || !calls) {
      const { data } = await supabase
        .from("call_requests")
        .select("id, status, unclaimed_records(institution_name, asset_type)")
        .in("id", ids);
      calls = data || [];
    }

    const called = (calls || []).find((r) => r.status === "called");
    setCalledRequest(called || null);
  };

  const dismissCalledBanner = () => {
    if (calledRequest) {
      try {
        const stored = JSON.parse(
          localStorage.getItem("umang_call_request_ids") || "[]"
        );
        localStorage.setItem(
          "umang_call_request_ids",
          JSON.stringify(
            stored.filter((item) =>
              typeof item === "string"
                ? item !== calledRequest.id
                : item?.id !== calledRequest.id
            )
          )
        );
      } catch {
        // ignore
      }
    }
    setCalledRequest(null);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
    checkCalledRequests();
    const interval = setInterval(checkCalledRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setView("home");
  };

  const handleContinueClaim = (callRequestId) => {
    setPendingCallRequestId(callRequestId || null);
    setAuthOpen(true);
  };

  const handleLoginSuccess = async (user) => {
    setIsLoggedIn(true);
    setAuthOpen(false);

    if (pendingCallRequestId && user?.id) {
      try {
        let stored = [];
        try {
          stored = JSON.parse(
            localStorage.getItem("umang_call_request_ids") || "[]"
          );
        } catch {
          stored = [];
        }
        const item = stored.find((it) =>
          typeof it === "string"
            ? it === pendingCallRequestId
            : it?.id === pendingCallRequestId
        );
        const token = typeof item === "object" ? item?.token : null;

        const { error: linkErr } = await supabase.rpc("link_call_request", {
          p_call_request_id: pendingCallRequestId,
          p_verification_token: token || null,
        });

        if (linkErr) {
          await supabase
            .from("call_requests")
            .update({ user_id: user.id })
            .eq("id", pendingCallRequestId)
            .is("user_id", null);
        }
      } catch (err) {
        console.error("Could not link call request to account:", err);
      } finally {
        try {
          const stored = JSON.parse(
            localStorage.getItem("umang_call_request_ids") || "[]"
          );
          localStorage.setItem(
            "umang_call_request_ids",
            JSON.stringify(
              stored.filter((it) =>
                typeof it === "string"
                  ? it !== pendingCallRequestId
                  : it?.id !== pendingCallRequestId
              )
            )
          );
        } catch {
          // ignore
        }
        setCalledRequest(null);
        setPendingCallRequestId(null);
        setView("dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Header */}
      <Header
        view={view}
        setView={setView}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      {/* "Your call is done — sign in to pay" banner */}
      {!isLoggedIn && calledRequest && (
        <div className="bg-emerald-950 text-white">
          <div className="max-w-5xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span>
              Our team has called you about{" "}
              <span className="font-semibold">
                {calledRequest.unclaimed_records?.institution_name || calledRequest.asset_type || "your asset"}
              </span>
              . Sign in or create an account to proceed with payment.
            </span>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleContinueClaim(calledRequest.id)}
                className="rounded-full bg-white text-emerald-950 px-4 py-1.5 font-semibold hover:bg-emerald-50 transition"
              >
                Sign in / Create account
              </button>
              <button
                onClick={dismissCalledBanner}
                className="text-emerald-100 hover:text-white"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages */}
      {view === "home" && (
        <Home setView={setView} />
      )}

      {view === "search" && (
        <Search
          setView={setView}
          setResults={setResults}
        />
      )}

      {view === "results" && (
        <Results
          results={results}
          setView={setView}
          onContinueClaim={handleContinueClaim}
        />
      )}

      {view === "about" && (
        <About setView={setView} />
      )}

      {view === "privacy" && (
        <Privacy />
      )}

      {view === "terms" && (
        <Terms />
      )}

      {view === "claim-assistance-terms" && (
        <ClaimAssistanceTerms />
      )}

      {view === "fee-terms" && (
        <FeeTerms />
      )}

      {view === "refund-policy" && (
        <RefundPolicy />
      )}

      {view === "contact" && ( /* NEW */
        <Contact />
      )}

      {view === "dashboard" && (
        <Dashboard setView={setView} />
      )}

      {/* Login Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setPendingCallRequestId(null);
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Footer */}
      <Footer setView={setView} /> {/* NEW — was imported but never rendered */}

      {/* Chat */}
      <ChatWidget />
      <ChatWidget setView={setView} />

    </div>
  );
}