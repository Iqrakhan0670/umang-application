import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const RESEND_COOLDOWN = 45; // seconds before "Resend OTP" is enabled again
const MAX_ATTEMPTS = 5;     // wrong-code attempts before forcing a resend

// Steps: 1 = email form, 2 = email otp, 3 = mobile number form,
//        4 = mobile otp, 5 = all verified
export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [step, setStep] = useState(1);

  // email step state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpError, setEmailOtpError] = useState("");
  const [emailAttempts, setEmailAttempts] = useState(0);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const emailTimerRef = useRef(null);

  // mobile step state
  const [mobile, setMobile] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileOtpError, setMobileOtpError] = useState("");
  const [mobileAttempts, setMobileAttempts] = useState(0);
  const [mobileCooldown, setMobileCooldown] = useState(0);
  const mobileTimerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [authedUser, setAuthedUser] = useState(null);

  const resetAll = () => {
    setMode("login");
    setStep(1);
    setFullName("");
    setEmail("");
    setEmailOtp("");
    setEmailOtpError("");
    setEmailAttempts(0);
    setEmailCooldown(0);
    setMobile("");
    setMobileOtp("");
    setMobileOtpError("");
    setMobileAttempts(0);
    setMobileCooldown(0);
    setAuthedUser(null);
    clearInterval(emailTimerRef.current);
    clearInterval(mobileTimerRef.current);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  useEffect(() => () => {
    clearInterval(emailTimerRef.current);
    clearInterval(mobileTimerRef.current);
  }, []);

  // IMPORTANT: this early return must come AFTER every hook above it
  // (useState/useRef/useEffect) and BEFORE any plain helper functions/JSX,
  // so the number and order of hooks never changes between renders.
  if (!isOpen) return null;

  const startCooldown = (setCooldown, timerRef) => {
    setCooldown(RESEND_COOLDOWN);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  /* ---------------- EMAIL OTP ---------------- */

  const sendEmailOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim()) return;
    if (mode === "register" && !fullName.trim()) {
      alert("Please enter your full name to register.");
      return;
    }
    setLoading(true);
    setEmailOtpError("");
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
      setEmailOtp("");
      setEmailAttempts(0);
      startCooldown(setEmailCooldown, emailTimerRef);
    } catch (err) {
      alert(`Could not send code: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resendEmailOtp = async () => {
    if (emailCooldown > 0 || loading) return;
    await sendEmailOtp();
  };

  const verifyEmailOtp = async (e) => {
    e.preventDefault();
    if (emailOtp.length < 6) {
      setEmailOtpError("Enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    setEmailOtpError("");
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: emailOtp.trim(),
        type: "email",
      });
      if (error) throw error;

      setAuthedUser(data.user);

      // If a mobile number is already verified on this account, skip straight through
      if (data.user?.phone && data.user?.phone_confirmed_at) {
        finishAllVerified(data.user);
        return;
      }
      setStep(3);
    } catch (err) {
      const nextAttempts = emailAttempts + 1;
      setEmailAttempts(nextAttempts);
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("expired")) {
        setEmailOtpError("This code has expired. Please request a new one.");
      } else if (nextAttempts >= MAX_ATTEMPTS) {
        setEmailOtpError("Too many incorrect attempts. Please request a new code.");
      } else {
        setEmailOtpError(`Invalid code. ${MAX_ATTEMPTS - nextAttempts} attempt${MAX_ATTEMPTS - nextAttempts === 1 ? "" : "s"} left.`);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- MOBILE OTP ---------------- */
  // Uses Supabase's phone-change flow: the user is already signed in (via email),
  // so we attach + verify a phone number on the same account.
  // Requires an SMS provider (Twilio / MessageBird / Vonage) to be configured in
  // Supabase Dashboard → Authentication → Providers → Phone. Until that is
  // connected, sendMobileOtp will return a clear error instead of silently failing.

  const normalizePhone = (raw) => {
    const digits = raw.replace(/[^\d+]/g, "");
    if (digits.startsWith("+")) return digits;
    // default to India country code if none given
    return `+91${digits}`;
  };

  const sendMobileOtp = async (e) => {
    e?.preventDefault();
    if (!mobile.trim() || mobile.replace(/\D/g, "").length < 10) {
      setMobileOtpError("Enter a valid mobile number.");
      return;
    }
    setLoading(true);
    setMobileOtpError("");
    try {
      const phone = normalizePhone(mobile.trim());
      const { error } = await supabase.auth.updateUser({ phone });
      if (error) throw error;
      setStep(4);
      setMobileOtp("");
      setMobileAttempts(0);
      startCooldown(setMobileCooldown, mobileTimerRef);
    } catch (err) {
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("provider") || msg.includes("sms") || msg.includes("not enabled")) {
        setMobileOtpError(
          "SMS verification isn't connected yet. Please contact support — this will work automatically once it's set up."
        );
      } else {
        setMobileOtpError(err.message || "Could not send code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resendMobileOtp = async () => {
    if (mobileCooldown > 0 || loading) return;
    await sendMobileOtp();
  };

  const verifyMobileOtp = async (e) => {
    e.preventDefault();
    if (mobileOtp.length < 6) {
      setMobileOtpError("Enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    setMobileOtpError("");
    try {
      const phone = normalizePhone(mobile.trim());
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: mobileOtp.trim(),
        type: "phone_change",
      });
      if (error) throw error;
      finishAllVerified(data.user || authedUser);
    } catch (err) {
      const nextAttempts = mobileAttempts + 1;
      setMobileAttempts(nextAttempts);
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("expired")) {
        setMobileOtpError("This code has expired. Please request a new one.");
      } else if (nextAttempts >= MAX_ATTEMPTS) {
        setMobileOtpError("Too many incorrect attempts. Please request a new code.");
      } else {
        setMobileOtpError(`Invalid code. ${MAX_ATTEMPTS - nextAttempts} attempt${MAX_ATTEMPTS - nextAttempts === 1 ? "" : "s"} left.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const skipMobileForNow = () => {
    // Lets the user continue browsing; call/claim/payment flows should still
    // check mobile_verified before allowing action (enforced in Phase 3).
    finishAllVerified(authedUser, { mobileSkipped: true });
  };

  const finishAllVerified = (user, opts = {}) => {
    setStep(5);
    setTimeout(() => {
      onLoginSuccess(user, opts);
      resetAll();
      onClose();
    }, 900);
  };

  const emailAttemptsExhausted = emailAttempts >= MAX_ATTEMPTS;
  const mobileAttemptsExhausted = mobileAttempts >= MAX_ATTEMPTS;

  return (
    <div className="fixed inset-0 bg-emerald-950/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-sm w-full rounded-2xl border border-slate-200 shadow-lg p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-emerald-950"
        >
          ✕
        </button>

        {/* STEP 1 — email + name */}
        {step === 1 && (
          <>
            <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1 mb-6">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 text-sm font-semibold py-2 rounded-full transition ${
                  mode === "login" ? "bg-white text-emerald-950 shadow-sm" : "text-slate-500"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 text-sm font-semibold py-2 rounded-full transition ${
                  mode === "register" ? "bg-white text-emerald-950 shadow-sm" : "text-slate-500"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={sendEmailOtp} className="space-y-5">
              <div>
                <h2 className="font-extrabold text-2xl text-emerald-950">
                  {mode === "register" ? "Create your account" : "Sign in"}
                </h2>
                <p className="text-slate-500 text-sm mt-1">We'll email you a one-time code.</p>
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
                {loading ? "Sending…" : mode === "register" ? "Create account" : "Send code"}
              </button>
            </form>
          </>
        )}

        {/* STEP 2 — email OTP */}
        {step === 2 && (
          <form onSubmit={verifyEmailOtp} className="space-y-5">
            <h2 className="font-extrabold text-2xl text-emerald-950">Verify Your Email</h2>
            <p className="text-slate-500 text-sm">
              Enter the 6-digit code sent to <span className="font-medium text-emerald-950">{email}</span>
            </p>
            <input
              type="text"
              maxLength="8"
              value={emailOtp}
              onChange={(e) => {
                setEmailOtp(e.target.value.replace(/\D/g, ""));
                if (emailOtpError) setEmailOtpError("");
              }}
              disabled={emailAttemptsExhausted}
              placeholder="••••••"
              className="w-full border-b-2 border-slate-200 bg-transparent py-2 text-2xl tracking-[0.4em] text-center focus:outline-none focus:border-emerald-700 transition disabled:opacity-40"
            />
            {emailOtpError && (
              <p className="text-xs text-rose-600 text-center" role="alert">{emailOtpError}</p>
            )}
            <button
              type="submit"
              disabled={loading || emailAttemptsExhausted}
              className="w-full rounded-full bg-emerald-950 text-white py-3 text-sm font-semibold hover:bg-emerald-900 transition disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify & continue"}
            </button>
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => { setStep(1); setEmailOtpError(""); }}
                className="text-slate-400 hover:text-emerald-950"
              >
                ← Use a different email
              </button>
              <button
                type="button"
                onClick={resendEmailOtp}
                disabled={emailCooldown > 0 || loading}
                className="font-medium text-emerald-700 hover:underline disabled:text-slate-300 disabled:no-underline"
              >
                {emailCooldown > 0 ? `Resend OTP in ${emailCooldown}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 — mobile number entry */}
        {step === 3 && (
          <form onSubmit={sendMobileOtp} className="space-y-5">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold mb-1">
              <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">✓</span>
              Email Verified
            </div>
            <h2 className="font-extrabold text-2xl text-emerald-950">Verify Your Mobile Number</h2>
            <p className="text-slate-500 text-sm">
              We'll send a one-time code to confirm your number.
            </p>
            <div>
              <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1.5">
                Mobile number
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full border-b-2 border-slate-200 bg-transparent py-2 text-lg focus:outline-none focus:border-emerald-700 transition"
              />
            </div>
            {mobileOtpError && (
              <p className="text-xs text-rose-600" role="alert">{mobileOtpError}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-950 text-white py-3 text-sm font-semibold hover:bg-emerald-900 transition disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send code"}
            </button>
            <button
              type="button"
              onClick={skipMobileForNow}
              className="w-full text-xs text-slate-400 hover:text-emerald-950"
            >
              Skip for now
            </button>
          </form>
        )}

        {/* STEP 4 — mobile OTP */}
        {step === 4 && (
          <form onSubmit={verifyMobileOtp} className="space-y-5">
            <h2 className="font-extrabold text-2xl text-emerald-950">Verify Your Mobile Number</h2>
            <p className="text-slate-500 text-sm">
              Enter the 6-digit code sent to <span className="font-medium text-emerald-950">{mobile}</span>
            </p>
            <input
              type="text"
              maxLength="8"
              value={mobileOtp}
              onChange={(e) => {
                setMobileOtp(e.target.value.replace(/\D/g, ""));
                if (mobileOtpError) setMobileOtpError("");
              }}
              disabled={mobileAttemptsExhausted}
              placeholder="••••••"
              className="w-full border-b-2 border-slate-200 bg-transparent py-2 text-2xl tracking-[0.4em] text-center focus:outline-none focus:border-emerald-700 transition disabled:opacity-40"
            />
            {mobileOtpError && (
              <p className="text-xs text-rose-600 text-center" role="alert">{mobileOtpError}</p>
            )}
            <button
              type="submit"
              disabled={loading || mobileAttemptsExhausted}
              className="w-full rounded-full bg-emerald-950 text-white py-3 text-sm font-semibold hover:bg-emerald-900 transition disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify & continue"}
            </button>
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => { setStep(3); setMobileOtpError(""); }}
                className="text-slate-400 hover:text-emerald-950"
              >
                ← Use a different number
              </button>
              <button
                type="button"
                onClick={resendMobileOtp}
                disabled={mobileCooldown > 0 || loading}
                className="font-medium text-emerald-700 hover:underline disabled:text-slate-300 disabled:no-underline"
              >
                {mobileCooldown > 0 ? `Resend OTP in ${mobileCooldown}s` : "Resend OTP"}
              </button>
            </div>
            <button
              type="button"
              onClick={skipMobileForNow}
              className="w-full text-xs text-slate-400 hover:text-emerald-950"
            >
              Skip for now
            </button>
          </form>
        )}

        {/* STEP 5 — all verified */}
        {step === 5 && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-emerald-700 text-xl">✓</span>
            </div>
            <h2 className="font-extrabold text-xl text-emerald-950 mb-1">You're all set</h2>
            <p className="text-slate-500 text-sm">Continuing…</p>
          </div>
        )}
      </div>
    </div>
  );
}