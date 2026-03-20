"use client";

import { useCallback, useEffect, useState } from "react";

interface PipelineStatus {
  source: string;
  latest: {
    status: string;
    records_processed: number;
    duration_ms: number | null;
    error_message: string | null;
    started_at: string;
    completed_at: string | null;
  } | null;
  lastSuccessAt: string | null;
}

const LABELS: Record<string, string> = {
  google_sheets: "Google Sheets",
  github: "GitHub",
  gmail: "Gmail",
};

function timeAgo(utc: string | null): string {
  if (!utc) return "Never";
  const iso = utc.replace(" ", "T") + "Z";
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return "Never";
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor(ms / 1000);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m ${secs % 60}s ago`;
  if (mins > 0) return `${mins}m ${secs % 60}s ago`;
  if (secs > 0) return `${secs}s ago`;
  return "Just now";
}

export function PipelineWidget() {
  const [pipelines, setPipelines] = useState<PipelineStatus[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);

  const fetchPipelines = useCallback(async () => {
    const res = await fetch("/api/pipelines", { cache: "no-store" });
    if (res.ok) {
      const data: PipelineStatus[] = await res.json();
      const filtered = data.filter((p) => p.source !== "discord");
      // Ensure Gmail pipeline always appears
      if (!filtered.find((p) => p.source === "gmail")) {
        filtered.push({ source: "gmail", latest: null, lastSuccessAt: null });
      }
      setPipelines(filtered);
    }
  }, []);

  // Force re-render every second so the seconds counter updates
  const [, setTick] = useState(0);
  useEffect(() => {
    fetchPipelines();
    const dataInterval = setInterval(fetchPipelines, 30000);
    const tickInterval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => { clearInterval(dataInterval); clearInterval(tickInterval); };
  }, [fetchPipelines]);

  const handleSync = useCallback(
    async (source: string) => {
      setSyncing(source);
      try {
        const res = await fetch("/api/pipelines/sync", { method: "POST" });
        if (res.ok) await fetchPipelines();
      } finally {
        setSyncing(null);
      }
    },
    [fetchPipelines]
  );

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#2196F3", boxShadow: "0 0 8px #2196F3" }}
        />
        <h3
          className="text-[11px] font-semibold uppercase tracking-[0.15em]"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Pipelines
        </h3>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {pipelines.map((p) => {
          const healthy = p.latest?.status === "success";
          const hasError = p.latest?.status === "failed";
          const dotColor = healthy
            ? "#4CAF50"
            : hasError
              ? "#ef5350"
              : "rgba(255,255,255,0.25)";
          const dotGlow = healthy
            ? "0 0 8px rgba(76,175,80,0.6)"
            : hasError
              ? "0 0 8px rgba(239,83,80,0.6)"
              : "none";

          return (
            <div
              key={p.source}
              className="flex items-center justify-between gap-2 rounded-md px-3 py-2.5"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0"
                  style={{ background: dotColor, boxShadow: dotGlow }}
                />
                <span
                  className="text-xs font-medium truncate"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {LABELS[p.source] || p.source}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="text-[10px] font-mono"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {syncing === p.source ? "Syncing..." : timeAgo(p.lastSuccessAt)}
                </span>
                {p.source === "google_sheets" && (
                  <button
                    className="text-[10px] px-2 py-0.5 rounded transition-all duration-200 cursor-pointer"
                    style={{
                      color: "rgba(33,150,243,0.8)",
                      border: "1px solid rgba(33,150,243,0.2)",
                      background: "rgba(33,150,243,0.06)",
                    }}
                    disabled={syncing === p.source}
                    onClick={() => handleSync(p.source)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(33,150,243,0.15)";
                      e.currentTarget.style.borderColor = "rgba(33,150,243,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(33,150,243,0.06)";
                      e.currentTarget.style.borderColor = "rgba(33,150,243,0.2)";
                    }}
                  >
                    Sync
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {pipelines.length === 0 && (
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            No pipeline data yet.
          </p>
        )}

        {/* Decorative stats summary */}
        {pipelines.length > 0 && (
          <div
            className="mt-auto pt-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div className="flex justify-between text-[10px]">
              <span style={{ color: "rgba(255,255,255,0.3)" }}>Total Sources</span>
              <span className="font-mono" style={{ color: "rgba(33,150,243,0.7)" }}>
                {pipelines.length}
              </span>
            </div>
            <div className="flex justify-between text-[10px] mt-1">
              <span style={{ color: "rgba(255,255,255,0.3)" }}>Healthy</span>
              <span className="font-mono" style={{ color: "rgba(76,175,80,0.8)" }}>
                {pipelines.filter((p) => p.latest?.status === "success").length}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
