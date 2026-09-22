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

  return (
    <div className="min-h-screen font-sans">
      <Header
        view={view}
        setView={setView}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onLoginClick={() => setAuthOpen(true)}
      />

      {view === "home" && <Home setView={setView} />}
      {view === "search" && (
        <Search setView={setView} setResults={setResults} />
      )}
      {view === "results" && (
        <Results
          results={results}
          setView={setView}
          onRequireLogin={() => setAuthOpen(true)}
        />
      )}
      {view === "about" && <About setView={setView} />}
      {view === "privacy" && <Privacy />}
      {view === "terms" && <Terms />}
      {view === "dashboard" && <Dashboard setView={setView} />}

      <Footer setView={setView} />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={() => setIsLoggedIn(true)}
      />

      <ChatWidget />
    </div>
  );
}