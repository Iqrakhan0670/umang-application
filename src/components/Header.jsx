import React from "react";
import { LogIn, LogOut, ArrowRight } from "lucide-react";

export default function Header({ view, setView, isLoggedIn, onLogout, onLoginClick }) {
  const link = (key, label) => (
    <button
      onClick={() => setView(key)}
      className={`text-sm font-semibold tracking-wide transition ${
        view === key
          ? "text-umang-dark border-b-2 border-umang-dark pb-1"
          : "text-slate-500 hover:text-umang-dark"
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="border-b border-umang-dark/10 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-8 lg:px-16 h-16 flex items-center justify-between">
        <button
          onClick={() => setView("home")}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-umang-dark flex items-center justify-center">
            <span className="text-umang-mint text-xs font-black">₹</span>
          </div>
          <span className="font-extrabold text-lg text-umang-dark tracking-tight">UMANG</span>
        </button>

        <nav className="hidden sm:flex items-center gap-8">
          {link("home", "Home")}
          {link("search", "Search")}
          {isLoggedIn && link("dashboard", "Dashboard")}
          {link("about", "How it works")}
        </nav>

        {isLoggedIn ? (
          <button
            onClick={onLogout}
            className="text-sm border border-umang-dark/20 text-umang-dark rounded-full px-4 py-2 font-semibold hover:bg-umang-mint transition flex items-center gap-1.5"
          >
            <LogOut size={14} /> Log out
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            className="text-sm bg-umang-dark text-white rounded-full px-5 py-2.5 font-semibold hover:opacity-90 transition flex items-center gap-1.5"
          >
            <LogIn size={14} /> Sign in <ArrowRight size={14} />
          </button>
        )}
      </div>
    </header>
  );
}