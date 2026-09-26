import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Admin from "./pages/Admin";
import { Eye, EyeOff, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Brand() {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-9 h-9 rounded-lg bg-emerald-950 flex items-center justify-center shrink-0">
        <span className="text-emerald-200 text-sm font-black">₹</span>
      </div>
      <div>
        <div className="font-extrabold text-lg text-emerald-950 tracking-tight leading-tight">
          UMANG Admin
        </div>
      </div>
    </div>
  );
}

function AlertBanner({ tone = "error", children }) {
  const styles =
    tone === "error"
      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
      : "bg-emerald-50 border-emerald-300 text-emerald-800";
  return (
    <div className={`flex items-start gap-2 border rounded-lg px-3 py-2.5 text-sm ${styles}`}>
      {tone === "error" ? (
        <XCircle size={16} className="mt-0.5 shrink-0 text-emerald-700" />
      ) : (
        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
      )}
      <span>{children}</span>
    </div>
  );
}

function PasswordField({ value, onChange, placeholder, show, setShow, autoComplete, name, id }) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        id={id}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 pr-10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function Requirement({ met, label }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${met ? "text-emerald-700" : "text-gray-400"}`}>
      <CheckCircle2 size={13} className={met ? "text-emerald-500" : "text-gray-300"} />
      {label}
    </div>
  );
}

function AuthCard({ children }) {
  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-10 font-sans">
      <div className="bg-white w-full max-w-[400px] rounded-xl border border-gray-200 shadow-sm p-8">
        <Brand />
        {children}
        <p className="text-[11px] text-gray-400 text-center mt-8 leading-relaxed">
          Authorized administrators only.
          <br />
          Your access is protected.
        </p>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [view, setView] = useState("login"); // login | forgot | reset

  // login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");

  // reset password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("umang_admin_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    supabase.auth.getUser().then(({ data }) => {
      setSession(data.user || null);
      setChecking(false);
    });

    // Supabase redirects here with a recovery session when the user opens
    // the "reset password" email link — switch straight to the reset screen.
    const { data: listener } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event === "PASSWORD_RECOVERY") {
        setView("reset");
        setChecking(false);
      } else if (event === "SIGNED_IN") {
        setSession(sess?.user || null);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const passwordChecks = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };
  const passwordValid = Object.values(passwordChecks).every(Boolean);

  const signIn = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (rememberMe) {
        localStorage.setItem("umang_admin_remember_email", email.trim());
      } else {
        localStorage.removeItem("umang_admin_remember_email");
      }
      setSession(data.user);
    } catch (err) {
      setError("Incorrect email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendResetLink = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSent(false);

    if (!forgotEmail.trim() || !EMAIL_RE.test(forgotEmail.trim())) {
      setForgotError("Enter a valid admin email address.");
      return;
    }

    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: window.location.origin + window.location.pathname,
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (err) {
      setForgotError(err.message || "Could not send reset link. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const submitNewPassword = async (e) => {
    e.preventDefault();
    setResetError("");

    if (!newPassword || !confirmPassword) {
      setResetError("Please fill in both fields.");
      return;
    }
    if (!passwordValid) {
      setResetError("Password does not meet the requirements below.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setResetSuccess(true);
    } catch (err) {
      setResetError(err.message || "Could not reset your password. The link may have expired.");
    } finally {
      setResetLoading(false);
    }
  };

  if (checking) return null;

  // ---- Already authenticated → dashboard ----
  if (session && view !== "reset") {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Admin />
      </div>
    );
  }

  // ---- Reset password screen (arrived via emailed recovery link) ----
  if (view === "reset") {
    if (resetSuccess) {
      return (
        <AuthCard>
          <div className="text-center py-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-3" />
            <h1 className="text-base font-semibold text-gray-900 mb-1">Password reset</h1>
            <p className="text-sm text-gray-500 mb-6">Your password has been updated successfully.</p>
            <button
              onClick={() => {
                setView("login");
                setResetSuccess(false);
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="w-full bg-emerald-950 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-900 transition"
            >
              Return to sign in
            </button>
          </div>
        </AuthCard>
      );
    }

    return (
      <AuthCard>
        <h1 className="text-base font-semibold text-gray-900 mb-1">Create a new password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Choose a strong password for your admin account.
        </p>

        <form onSubmit={submitNewPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">New password</label>
            <PasswordField
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              show={showNewPassword}
              setShow={setShowNewPassword}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirm password</label>
            <PasswordField
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              show={showConfirmPassword}
              setShow={setShowConfirmPassword}
              autoComplete="new-password"
            />
          </div>

          <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 bg-emerald-50/60 border border-emerald-100 rounded-lg px-3.5 py-3">
            <Requirement met={passwordChecks.length} label="At least 8 characters" />
            <Requirement met={passwordChecks.upper} label="One uppercase letter" />
            <Requirement met={passwordChecks.number} label="One number" />
            <Requirement met={passwordChecks.special} label="One special character" />
          </div>

          {resetError && <AlertBanner tone="error">{resetError}</AlertBanner>}

          <button
            type="submit"
            disabled={resetLoading}
            className="w-full bg-emerald-950 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-900 transition disabled:opacity-50"
          >
            {resetLoading ? "Resetting password…" : "Reset password"}
          </button>
        </form>
      </AuthCard>
    );
  }

  // ---- Forgot password screen ----
  if (view === "forgot") {
    return (
      <AuthCard>
        <h1 className="text-base font-semibold text-gray-900 mb-1">Reset your password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your admin email and we'll send you a password reset link.
        </p>

        {forgotSent ? (
          <div className="space-y-4">
            <AlertBanner tone="success">
              A password reset link has been sent to <strong>{forgotEmail.trim()}</strong>. Check
              your inbox and follow the link to continue.
            </AlertBanner>
            <button
              onClick={() => setView("login")}
              className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:border-emerald-400 hover:text-emerald-700 transition"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={sendResetLink} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Admin email</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your admin email"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
            </div>

            {forgotError && <AlertBanner tone="error">{forgotError}</AlertBanner>}

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full bg-emerald-950 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-900 transition disabled:opacity-50"
            >
              {forgotLoading ? "Sending…" : "Send reset link"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => setView("login")}
                className="text-emerald-700 font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </AuthCard>
    );
  }

  // ---- Login screen ----
  return (
    <AuthCard>
      <div className="flex items-center gap-1.5 mb-1">
        <ShieldCheck size={15} className="text-emerald-600" />
        <h1 className="text-base font-semibold text-gray-900">Admin sign in</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">Secure access to the administration portal.</p>

      <form onSubmit={signIn} className="space-y-4" noValidate autoComplete="on">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Admin Email</label>
          <input
            type="email"
            name="email"
            id="admin-email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError("");
            }}
            placeholder="Enter your admin email"
            autoComplete="username"
            className={`w-full border rounded-lg px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition ${
              emailError
                ? "border-emerald-400 focus:ring-emerald-300"
                : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
            }`}
          />
          {emailError && <p className="text-xs text-emerald-700 mt-1.5">{emailError}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            show={showPassword}
            setShow={setShowPassword}
            autoComplete="current-password"
            name="password"
            id="admin-password"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => {
              setForgotEmail(email);
              setForgotError("");
              setForgotSent(false);
              setView("forgot");
            }}
            className="text-emerald-700 font-medium hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {error && <AlertBanner tone="error">{error}</AlertBanner>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-950 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-900 transition disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </AuthCard>
  );
}