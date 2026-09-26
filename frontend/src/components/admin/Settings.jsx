import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Mail, Palette, Bell, Save, Check } from "lucide-react";

const STORAGE_KEY = "umang_admin_settings";

const DEFAULT_SETTINGS = {
  theme: "mint", // mint | slate
  notifyNewCall: true,
  notifyNewClaim: true,
  notifyRecovered: true,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
        checked ? "bg-emerald-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function Row({ title, sub, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="border border-gray-200 rounded-2xl bg-white shadow-sm p-5 mb-5">
      <div className="flex items-center gap-2.5 mb-1">
        <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <Icon size={15} />
        </span>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function Settings() {
  const [email, setEmail] = useState("");
  const [settings, setSettings] = useState(loadSettings());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const getEmail = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEmail(user?.email || "");
    };
    getEmail();
  }, []);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      {/* Account */}
      <SectionCard icon={Mail} title="Account">
        <Row title="Admin email" sub="Used to sign in to this admin panel">
          <span className="text-sm text-gray-600">{email || "—"}</span>
        </Row>
      </SectionCard>

      {/* Appearance */}
      <SectionCard icon={Palette} title="Appearance">
        <Row title="Color theme" sub="Accent color used across the admin panel">
          <div className="flex gap-2">
            <button
              onClick={() => update("theme", "mint")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                settings.theme === "mint"
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Mint
            </button>
            <button
              onClick={() => update("theme", "slate")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                settings.theme === "slate"
                  ? "border-slate-400 bg-slate-50 text-slate-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-slate-500" />
              Slate
            </button>
          </div>
        </Row>
      </SectionCard>

      {/* Notifications */}
      <SectionCard icon={Bell} title="Notifications">
        <Row title="New call request" sub="Alert when a user requests a call">
          <Toggle checked={settings.notifyNewCall} onChange={(v) => update("notifyNewCall", v)} />
        </Row>
        <Row title="New claim filed" sub="Alert when a claim is submitted">
          <Toggle checked={settings.notifyNewClaim} onChange={(v) => update("notifyNewClaim", v)} />
        </Row>
        <Row title="Money recovered" sub="Alert when a claim status changes to recovered">
          <Toggle checked={settings.notifyRecovered} onChange={(v) => update("notifyRecovered", v)} />
        </Row>
      </SectionCard>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition"
      >
        {saved ? <Check size={15} /> : <Save size={15} />}
        {saved ? "Saved" : "Save changes"}
      </button>
    </div>
  );
}