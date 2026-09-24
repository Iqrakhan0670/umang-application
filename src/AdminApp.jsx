import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Admin from "./pages/Admin";

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setSession(data.user || null);
      setChecking(false);
    });
  }, []);

  const signIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (error) throw error;
      setSession(data.user);
    } catch (err) {
      setError(err.message || "Invalid email or password.");
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

          <form onSubmit={signIn} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              className="w-full border-b-2 border-ink/20 bg-transparent py-2 focus:outline-none focus:border-pine"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border-b-2 border-ink/20 bg-transparent py-2 focus:outline-none focus:border-pine"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pine text-parchment py-3 text-sm font-medium hover:bg-pine-light transition disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
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