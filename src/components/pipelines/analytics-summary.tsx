"use client";

import { useEffect, useState } from "react";

interface SourceAnalytics {
  total_syncs: number;
  success_count: number;
  success_rate: number;
  avg_duration_ms: number;
  total_records_synced: number;
}

export function AnalyticsSummary() {
  const [analytics, setAnalytics] = useState<Record<string, SourceAnalytics> | null>(null);

  useEffect(() => {
    fetch("/api/pipelines/analytics", { cache: "no-store" })
      .then((r) => r.json())
      .then(setAnalytics);
  }, []);

  // Focus on google_sheets since that's the active pipeline
  const gs = analytics?.google_sheets;

  const stats = [
    {
      label: "Success Rate",
      value: gs ? `${gs.success_rate}%` : "—",
      color: gs && gs.success_rate >= 90 ? "rgba(76,175,80,0.8)" : gs && gs.success_rate >= 70 ? "rgba(255,193,7,0.8)" : "rgba(239,83,80,0.8)",
    },
    {
      label: "Avg Duration",
      value: gs?.avg_duration_ms ? `${(gs.avg_duration_ms / 1000).toFixed(1)}s` : "—",
      color: "rgba(33,150,243,0.8)",
    },
    {
      label: "Total Records",
      value: gs ? gs.total_records_synced.toLocaleString() : "—",
      color: "rgba(33,150,243,0.8)",
    },
    {
      label: "Total Syncs",
      value: gs ? gs.total_syncs.toString() : "—",
      color: "rgba(255,255,255,0.7)",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-lg p-3"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            className="text-[10px] uppercase tracking-[0.15em] mb-1"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {s.label}
          </div>
          <div
            className="text-lg font-mono font-semibold"
            style={{ color: s.color }}
          >
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
