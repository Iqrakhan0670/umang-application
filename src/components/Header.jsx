import React from "react";
import { LogOut } from "lucide-react";

export default function Header({
  view,
  setView,
  isLoggedIn,
  onLogout,
}) {
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
      <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 h-16 grid grid-cols-3 items-center">

        {/* Logo */}
        <button
          onClick={() => setView("home")}
          className="flex items-center gap-2 justify-self-start"
        >
          <div className="w-8 h-8 rounded-lg bg-umang-dark flex items-center justify-center">
            <span className="text-umang-mint text-xs font-black">
              ₹
            </span>
          </div>

          <span className="font-extrabold text-lg text-umang-dark tracking-tight">
            UMANG
          </span>
        </button>

        {/* Navigation */}
        <nav className="hidden sm:flex items-center gap-8 justify-self-center">
          {link("home", "Home")}
          {link("search", "Search")}

          {isLoggedIn && link("dashboard", "Dashboard")}

          {link("about", "How it works")}
        </nav>

        {/* Logout — only shown once signed in. Sign-in itself now happens
            contextually (e.g. after "Continue" on a claim), not from the
            header. */}
        <div className="justify-self-end">
          {isLoggedIn && (
            <button
              onClick={onLogout}
              className="
                text-sm
                border border-umang-dark/20
                text-umang-dark
                rounded-full
                px-4 py-2
                font-semibold
                hover:bg-umang-mint
                transition
                flex items-center gap-1.5
              "
            >
              <LogOut size={14} />
              Log out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}