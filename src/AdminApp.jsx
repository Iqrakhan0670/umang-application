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
      <div className="min-h-screen bg-parchment flex items-center justify-center px-4 font-sans">
        <div className="bg-white max-w-sm w-full border border-ink/15 p-8">
          <h1 className="font-serif text-2xl text-ink mb-1">UMANG Admin</h1>
          <p className="text-stone text-sm mb-6">Sign in to continue.</p>

          {step === 1 ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border-b-2 border-ink/20 bg-transparent py-2 focus:outline-none focus:border-pine"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pine text-parchment py-3 text-sm font-medium hover:bg-pine-light transition disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send code"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength="8"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter code"
                className="w-full border-b-2 border-ink/20 bg-transparent py-2 text-center tracking-[0.4em] focus:outline-none focus:border-pine"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pine text-parchment py-3 text-sm font-medium hover:bg-pine-light transition disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment font-sans">
      <Admin />
    </div>
  );
}