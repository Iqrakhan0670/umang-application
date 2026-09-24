import React from "react";
import {
  LayoutDashboard,
  PhoneCall,
  FileText,
  Upload,
  Wallet,
  History,
  Settings,
  LogOut,
} from "lucide-react";

/**
 * UMANG Admin Sidebar
 * White + mint-green theme, sectioned navigation.
 *
 * Props:
 *  - active: string (current tab key)
 *  - onNavigate: (key: string) => void
 *  - counts: { calls?: number, claims?: number }
 */
export default function Sidebar({ active, onNavigate, counts = {} }) {
  const mainItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "calls", label: "Call Requests", icon: PhoneCall, count: counts.calls },
    { key: "claims", label: "Claims", icon: FileText, count: counts.claims },
    { key: "import", label: "Import Records", icon: Upload },
  ];

  const managementItems = [
    { key: "settlements", label: "Settlements", icon: Wallet },
    { key: "activity", label: "Activity Log", icon: History },
  ];

  const systemItems = [{ key: "settings", label: "Settings", icon: Settings }];

  const NavItem = ({ item }) => {
    const isActive = active === item.key;
    const Icon = item.icon;
    return (
      <button
        onClick={() => onNavigate(item.key)}
        className={`relative w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl text-sm transition-colors
          ${
            isActive
              ? "bg-emerald-50 text-emerald-700 font-semibold"
              : "text-gray-800 font-medium hover:bg-emerald-50/60"
          }`}
      >
        {isActive && (
          <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-[3px] h-4.5 rounded-r bg-emerald-500" />
        )}
        <Icon
          size={18}
          className={isActive ? "text-emerald-600 shrink-0" : "text-gray-400 shrink-0"}
        />
        <span className="flex-1 text-left">{item.label}</span>
        {typeof item.count === "number" && item.count > 0 && (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            {item.count}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-[248px] min-w-[248px] h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[18px] h-[18px]"
          >
            <path d="M4 4v9a5 5 0 0 0 10 0V4" />
            <path d="M4 4h4M16 4h4M14 20h6" />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-[16px] font-bold tracking-tight text-gray-900">UMANG</div>
          <div className="text-[10.5px] font-semibold tracking-wider text-gray-500 mt-0.5">
            ADMIN PANEL
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3.5 pt-1.5">
        <div className="mb-1.5">
          <div className="text-[11px] font-semibold tracking-wider text-gray-500 px-2.5 pb-2">
            MAIN
          </div>
          {mainItems.map((item) => (
            <NavItem key={item.key} item={item} />
          ))}
        </div>

        <div className="mt-3.5 pt-4 border-t border-gray-200">
          <div className="text-[11px] font-semibold tracking-wider text-gray-500 px-2.5 pb-2">
            MANAGEMENT
          </div>
          {managementItems.map((item) => (
            <NavItem key={item.key} item={item} />
          ))}
        </div>

        <div className="mt-3.5 pt-4 border-t border-gray-200">
          <div className="text-[11px] font-semibold tracking-wider text-gray-500 px-2.5 pb-2">
            SYSTEM
          </div>
          {systemItems.map((item) => (
            <NavItem key={item.key} item={item} />
          ))}
          <button
            onClick={() => onNavigate("logout")}
            className="w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl text-sm font-medium text-gray-800 hover:bg-emerald-50/60 transition-colors"
          >
            <LogOut size={18} className="text-gray-400 shrink-0" />
            <span className="flex-1 text-left">Logout</span>
          </button>
        </div>
      </nav>

      {/* Profile footer */}
      <div className="p-3.5 border-t border-gray-200">
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-emerald-50/60 transition-colors cursor-pointer">
          <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="text-[13.5px] font-semibold text-gray-900">Admin</div>
            <div className="text-[11.5px] text-gray-500">Administrator</div>
          </div>
          <button
            onClick={() => onNavigate("settings")}
            className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center text-gray-400 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}