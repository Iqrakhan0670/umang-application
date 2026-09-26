import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const resetAll = () => {
    setMode("login");
    setStep(1);
    setFullName("");
    setEmail("");
    setOtp("");
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    if (mode === "register" && !fullName.trim()) {
      alert("Please enter your full name to register.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options:
          mode === "register"
            ? { data: { full_name: fullName.trim() } }
            : undefined,
      });
      if (error) throw error;
      setStep(2);
    } catch (err) {
      alert(`Could not send code: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return alert("Enter the full code.");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "email",
      });
      if (error) throw error;
      onLoginSuccess(data.user);
      resetAll();
      onClose();
    } catch (err) {
      alert("Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-emerald-950/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-sm w-full rounded-2xl border border-slate-200 shadow-lg p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-emerald-950"
        >
          ✕
        </button>

        {step === 1 ? (
          <>
            {/* Login / Register toggle */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1 mb-6">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 text-sm font-semibold py-2 rounded-full transition ${
                  mode === "login"
                    ? "bg-white text-emerald-950 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 text-sm font-semibold py-2 rounded-full transition ${
                  mode === "register"
                    ? "bg-white text-emerald-950 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={sendOtp} className="space-y-5">
              <div>
                <h2 className="font-extrabold text-2xl text-emerald-950">
                  {mode === "register" ? "Create your account" : "Sign in"}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  We'll email you a one-time code.
                </p>
              </div>

              {mode === "register" && (
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full border-b-2 border-slate-200 bg-transparent py-2 text-lg focus:outline-none focus:border-emerald-700 transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border-b-2 border-slate-200 bg-transparent py-2 text-lg focus:outline-none focus:border-emerald-700 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-emerald-950 text-white py-3 text-sm font-semibold hover:bg-emerald-900 transition disabled:opacity-50"
              >
                {loading
                  ? "Sending…"
                  : mode === "register"
                  ? "Create account"
                  : "Send code"}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-5">
            <h2 className="font-extrabold text-2xl text-emerald-950">Enter code</h2>
            <p className="text-slate-500 text-sm">Sent to {email}</p>
            <input
              type="text"
              maxLength="8"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="w-full border-b-2 border-slate-200 bg-transparent py-2 text-2xl tracking-[0.4em] text-center focus:outline-none focus:border-emerald-700 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-950 text-white py-3 text-sm font-semibold hover:bg-emerald-900 transition disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify & continue"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs text-slate-400 hover:text-emerald-950"
            >
              ← Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}