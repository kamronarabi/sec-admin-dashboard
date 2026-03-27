"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";

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

const ICONS: Record<string, string> = {
  google_sheets: "📊",
  github: "🔗",
  gmail: "📧",
};

function timeAgo(utc: string | null): string {
  if (!utc) return "Never";
  const iso = utc.replace(" ", "T") + "Z";
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return "Never";
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ${hrs % 24}h ago`;
  if (hrs > 0) return `${hrs}h ${mins % 60}m ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

export function PipelineStatusCards({ onSyncComplete }: { onSyncComplete?: () => void }) {
  const [pipelines, setPipelines] = useState<PipelineStatus[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const fetchPipelines = useCallback(async () => {
    const res = await fetch("/api/pipelines", { cache: "no-store" });
    if (res.ok) {
      const data: PipelineStatus[] = await res.json();
      const filtered = data.filter((p) => p.source !== "discord");
      setPipelines(filtered);
    }
  }, []);

  useEffect(() => {
    fetchPipelines();
    const dataInterval = setInterval(fetchPipelines, 30000);
    const tickInterval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(tickInterval);
    };
  }, [fetchPipelines]);

  const handleSync = useCallback(
    async (source: string) => {
      setSyncing(source);
      try {
        const endpoint =
          source === "gmail"
            ? "/api/pipelines/sync-gmail"
            : "/api/pipelines/sync";
        const res = await fetch(endpoint, { method: "POST" });
        if (res.ok) {
          await fetchPipelines();
          onSyncComplete?.();
        }
      } finally {
        setSyncing(null);
      }
    },
    [fetchPipelines, onSyncComplete]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {pipelines.map((p) => {
        const healthy = p.latest?.status === "success";
        const hasError = p.latest?.status === "failed";
        const isActive = p.source === "google_sheets" || p.source === "gmail";

        return (
          <div
            key={p.source}
            className="relative rounded-lg overflow-hidden transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              border: `1px solid ${healthy ? "rgba(76,175,80,0.2)" : hasError ? "rgba(239,83,80,0.2)" : "rgba(255,255,255,0.06)"}`,
            }}
          >
            {/* Top glow line */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{
                background: healthy
                  ? "linear-gradient(90deg, transparent 0%, rgba(76,175,80,0.5) 50%, transparent 100%)"
                  : hasError
                    ? "linear-gradient(90deg, transparent 0%, rgba(239,83,80,0.5) 50%, transparent 100%)"
                    : "linear-gradient(90deg, transparent 0%, rgba(33,150,243,0.3) 50%, transparent 100%)",
              }}
            />

            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{ICONS[p.source]}</span>
                  <span
                    className="text-[13px] font-semibold tracking-wide"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    {LABELS[p.source] || p.source}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{
                      background: healthy ? "#4CAF50" : hasError ? "#ef5350" : "rgba(255,255,255,0.25)",
                      boxShadow: healthy
                        ? "0 0 8px rgba(76,175,80,0.6)"
                        : hasError
                          ? "0 0 8px rgba(239,83,80,0.6)"
                          : "none",
                    }}
                  />
                  <span
                    className="text-[10px] font-medium uppercase tracking-wider"
                    style={{
                      color: healthy ? "rgba(76,175,80,0.8)" : hasError ? "rgba(239,83,80,0.8)" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {healthy ? "Healthy" : hasError ? "Error" : isActive ? "Idle" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span style={{ color: "rgba(255,255,255,0.4)" }}>Last sync</span>
                  <span className="font-mono" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {timeAgo(p.lastSuccessAt)}
                  </span>
                </div>
                {p.latest && (
                  <>
                    <div className="flex justify-between text-[11px]">
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>Duration</span>
                      <span className="font-mono" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {p.latest.duration_ms ? `${(p.latest.duration_ms / 1000).toFixed(1)}s` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>Records</span>
                      <span className="font-mono" style={{ color: "rgba(33,150,243,0.7)" }}>
                        {p.latest.records_processed}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {(p.source === "google_sheets" || p.source === "gmail") && (
                <button
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-[11px] font-medium py-1.5 rounded-md transition-all duration-200 cursor-pointer"
                  style={{
                    color: syncing === p.source ? "rgba(33,150,243,0.5)" : "rgba(33,150,243,0.9)",
                    border: "1px solid rgba(33,150,243,0.2)",
                    background: "rgba(33,150,243,0.06)",
                  }}
                  disabled={syncing === p.source}
                  onClick={() => handleSync(p.source)}
                  onMouseEnter={(e) => {
                    if (syncing !== p.source) {
                      e.currentTarget.style.background = "rgba(33,150,243,0.15)";
                      e.currentTarget.style.borderColor = "rgba(33,150,243,0.4)";
                      e.currentTarget.style.boxShadow = "0 0 20px rgba(33,150,243,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(33,150,243,0.06)";
                    e.currentTarget.style.borderColor = "rgba(33,150,243,0.2)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {syncing === p.source ? (
                    <>
                      <RefreshCw size={11} className="animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Activity size={11} />
                      Sync Now
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
