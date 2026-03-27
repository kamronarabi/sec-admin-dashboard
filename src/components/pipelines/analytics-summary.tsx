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

  // Aggregate metrics across all pipeline sources
  const agg = (() => {
    if (!analytics) return null;
    const sources = Object.values(analytics);
    if (sources.length === 0) return null;
    const totalSyncs = sources.reduce((s, a) => s + a.total_syncs, 0);
    const totalSuccess = sources.reduce((s, a) => s + a.success_count, 0);
    const successRate = totalSyncs > 0 ? Math.round((totalSuccess / totalSyncs) * 1000) / 10 : 0;
    const totalRecords = sources.reduce((s, a) => s + a.total_records_synced, 0);
    // Weighted average duration (only sources with data)
    const withDuration = sources.filter((a) => a.avg_duration_ms > 0 && a.success_count > 0);
    const avgDuration = withDuration.length > 0
      ? withDuration.reduce((s, a) => s + a.avg_duration_ms * a.success_count, 0) /
        withDuration.reduce((s, a) => s + a.success_count, 0)
      : 0;
    return { totalSyncs, successRate, totalRecords, avgDuration };
  })();

  const stats = [
    {
      label: "Success Rate",
      value: agg ? `${agg.successRate}%` : "—",
      color: agg && agg.successRate >= 90 ? "rgba(76,175,80,0.8)" : agg && agg.successRate >= 70 ? "rgba(255,193,7,0.8)" : "rgba(239,83,80,0.8)",
    },
    {
      label: "Avg Duration",
      value: agg?.avgDuration ? `${(agg.avgDuration / 1000).toFixed(1)}s` : "—",
      color: "rgba(33,150,243,0.8)",
    },
    {
      label: "Total Records",
      value: agg ? agg.totalRecords.toLocaleString() : "—",
      color: "rgba(33,150,243,0.8)",
    },
    {
      label: "Total Syncs",
      value: agg ? agg.totalSyncs.toString() : "—",
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
