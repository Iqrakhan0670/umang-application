import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { History, PhoneCall, FileText } from "lucide-react";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!error) setLogs(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-emerald-50 animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {logs.length === 0 ? (
        <div className="py-16 text-center">
          <History size={22} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">No activity recorded yet.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {logs.map((log) => (
            <li key={log.id} className="flex items-center gap-3 px-5 py-4">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                {log.entity_type === "call_request" ? (
                  <PhoneCall size={14} className="text-emerald-600" />
                ) : (
                  <FileText size={14} className="text-emerald-600" />
                )}
              </span>
              <span className="flex-1 text-sm text-gray-700">{log.action}</span>
              <span className="text-xs text-gray-400 shrink-0">{timeAgo(log.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}