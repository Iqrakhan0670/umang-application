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

export default function App() {
  const [view, setView] = useState("home");
  const [results, setResults] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Set when the person taps "Continue" after a call request, from
  // Results.jsx. Once they sign in, this call_requests row is linked to
  // their new/returning account so it shows up on their Dashboard.
  const [pendingCallRequestId, setPendingCallRequestId] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setView("home");
  };

  // Called from Results.jsx when the person chooses "Continue" after
  // requesting a call. Opens sign-in/register; does NOT charge anything
  // and does NOT show the 10% agreement — those stay gated later in
  // Dashboard.jsx exactly as they already are.
  const handleContinueClaim = (callRequestId) => {
    setPendingCallRequestId(callRequestId || null);
    setAuthOpen(true);
  };

  const handleLoginSuccess = async (user) => {
    setIsLoggedIn(true);
    setAuthOpen(false);

    // Link the anonymous call request (if any) to the now-signed-in user,
    // so it appears in their Dashboard's "Your call requests" list.
    if (pendingCallRequestId && user?.id) {
      try {
        await supabase
          .from("call_requests")
          .update({ user_id: user.id })
          .eq("id", pendingCallRequestId)
          .is("user_id", null);
      } catch (err) {
        console.error("Could not link call request to account:", err);
      } finally {
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

      {/* Chat */}
      <ChatWidget />

    </div>
  );
}