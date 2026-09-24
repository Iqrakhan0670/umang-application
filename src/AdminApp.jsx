import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Admin from "./pages/Admin";

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setSession(data.user || null);
      setChecking(false);
    });
  }, []);

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (error) throw error;
      setStep(2);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "email",
      });
      if (error) throw error;
      setSession(data.user);
    } catch (err) {
      alert("Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  if (!session) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 font-sans">
        <div className="bg-white max-w-sm w-full rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center">
              <span className="text-emerald-200 text-xs font-black">₹</span>
            </div>
            <span className="font-extrabold text-lg text-emerald-950 tracking-tight">UMANG Admin</span>
          </div>
          <p className="text-slate-500 text-sm mb-6">Sign in to continue.</p>

          {step === 1 ? (
            <form onSubmit={sendOtp} className="space-y-4">
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
                  className="w-full border-b-2 border-slate-200 bg-transparent py-2 focus:outline-none focus:border-emerald-700 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-emerald-950 text-white py-3 text-sm font-semibold hover:bg-emerald-900 transition disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send code"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1.5">
                  Verification code
                </label>
                <input
                  type="text"
                  maxLength="8"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="w-full border-b-2 border-slate-200 bg-transparent py-2 text-center text-xl tracking-[0.4em] focus:outline-none focus:border-emerald-700 transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-emerald-950 text-white py-3 text-sm font-semibold hover:bg-emerald-900 transition disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify"}
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

  return (
    <div className="min-h-screen bg-white font-sans">
      <Admin />
    </div>
  );
}