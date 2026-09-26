import React from "react";
import { Search, Bell, ChevronDown, RefreshCw } from "lucide-react";

export default function TopHeader({ onRefresh, refreshing }) {
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full pl-9 pr-14 py-2 text-sm bg-emerald-50/60 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-white">
          Ctrl+K
        </span>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-3 pl-4">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:border-emerald-400 hover:text-emerald-700 transition disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>

        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 transition">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </button>

        <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-emerald-50 transition">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-semibold text-xs">
            A
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">Admin</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
}