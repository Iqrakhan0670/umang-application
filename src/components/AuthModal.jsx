import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
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
      onClose();
    } catch (err) {
      alert("Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
      <div className="bg-parchment max-w-sm w-full border border-ink/15 p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone hover:text-ink"
        >
          ✕
        </button>

        {step === 1 ? (
          <form onSubmit={sendOtp} className="space-y-5">
            <h2 className="font-serif text-2xl text-ink">Sign in</h2>
            <p className="text-stone text-sm">
              We'll email you a one-time code.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border-b-2 border-ink/20 bg-transparent py-2 text-lg focus:outline-none focus:border-pine transition"
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
          <form onSubmit={verifyOtp} className="space-y-5">
            <h2 className="font-serif text-2xl text-ink">Enter code</h2>
            <p className="text-stone text-sm">Sent to {email}</p>
            <input
              type="text"
              maxLength="8"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="w-full border-b-2 border-ink/20 bg-transparent py-2 text-2xl tracking-[0.4em] text-center focus:outline-none focus:border-pine transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pine text-parchment py-3 text-sm font-medium hover:bg-pine-light transition disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify & continue"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-xs text-stone hover:text-ink"
            >
              ← Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}