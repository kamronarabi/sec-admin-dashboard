"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PipelineStatus {
  source: string;
  latest: {
    status: string;
    records_processed: number;
    records_created: number;
    records_updated: number;
    duration_ms: number | null;
    error_message: string | null;
    started_at: string;
    completed_at: string | null;
  } | null;
  lastSuccessAt: string | null;
}

const LABELS: Record<string, string> = {
  google_sheets: "Google Sheets",
  discord: "Discord",
  github: "GitHub",
};

function useElapsedTime(sinceMs: number | null) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!sinceMs) {
      setElapsed("Never synced");
      return;
    }

    const update = () => {
      const seconds = Math.max(0, Math.floor((Date.now() - sinceMs) / 1000));
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) setElapsed(`${hours}h ${minutes % 60}m ago`);
      else if (minutes > 0) setElapsed(`${minutes}m ${seconds % 60}s ago`);
      else setElapsed(`${seconds}s ago`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [sinceMs]);

  return elapsed;
}

function parseUtcToMs(utc: string | null): number | null {
  if (!utc) return null;
  return new Date(utc + "Z").getTime();
}

function PipelineCard({
  pipeline,
  onSync,
  syncing,
  syncedAtMs,
}: {
  pipeline: PipelineStatus;
  onSync?: () => void;
  syncing?: boolean;
  syncedAtMs?: number | null;
}) {
  const apiMs = parseUtcToMs(pipeline.lastSuccessAt);
  const sinceMs = syncedAtMs ?? apiMs;
  const elapsed = useElapsedTime(sinceMs);

  const getHealthStatus = () => {
    if (!pipeline.latest) return { label: "No Data", color: "bg-gray-400" };
    if (pipeline.latest.status === "success") return { label: "Healthy", color: "bg-green-500" };
    if (pipeline.latest.status === "partial") return { label: "Warning", color: "bg-yellow-500" };
    return { label: "Error", color: "bg-red-500" };
  };

  const health = getHealthStatus();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{LABELS[pipeline.source] || pipeline.source}</CardTitle>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${health.color}`} />
            <Badge variant={health.label === "Healthy" ? "default" : health.label === "Error" ? "destructive" : "secondary"}>
              {health.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Last Sync</span>
          <span className="font-mono tabular-nums">
            {syncing ? "Syncing..." : elapsed}
          </span>
        </div>
        {pipeline.latest && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Records Processed</span>
              <span>{pipeline.latest.records_processed}</span>
            </div>
            {pipeline.latest.duration_ms && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span>{(pipeline.latest.duration_ms / 1000).toFixed(1)}s</span>
              </div>
            )}
            {pipeline.latest.error_message && (
              <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                {pipeline.latest.error_message}
              </div>
            )}
          </>
        )}
        {onSync && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            disabled={syncing}
            onClick={onSync}
          >
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

const SYNCABLE_SOURCES = new Set(["google_sheets"]);

export function PipelineMonitor() {
  const [pipelines, setPipelines] = useState<PipelineStatus[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncedAt, setSyncedAt] = useState<Record<string, number>>({});

  const fetchPipelines = useCallback(async () => {
    const res = await fetch("/api/pipelines");
    if (res.ok) setPipelines(await res.json());
  }, []);

  useEffect(() => {
    fetchPipelines();
    const interval = setInterval(fetchPipelines, 30000);
    return () => clearInterval(interval);
  }, [fetchPipelines]);

  const handleSync = useCallback(
    async (source: string) => {
      setSyncing(source);
      try {
        const res = await fetch("/api/pipelines/sync", { method: "POST" });
        const now = Date.now();
        setSyncedAt((prev) => ({ ...prev, [source]: now }));

        if (res.ok) {
          const data = await res.json();
          if (data.latest) {
            setPipelines((prev) =>
              prev.map((p) =>
                p.source === source
                  ? { ...p, latest: data.latest, lastSuccessAt: data.latest.completed_at }
                  : p
              )
            );
          }
        }
      } finally {
        setSyncing(null);
      }
    },
    []
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {pipelines.map((p) => (
        <PipelineCard
          key={p.source}
          pipeline={p}
          onSync={
            SYNCABLE_SOURCES.has(p.source)
              ? () => handleSync(p.source)
              : undefined
          }
          syncing={syncing === p.source}
          syncedAtMs={syncedAt[p.source]}
        />
      ))}
    </div>
  );
}
