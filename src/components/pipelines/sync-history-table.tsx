"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, RotateCcw, UserPlus, CalendarPlus, Users } from "lucide-react";
import { RollbackDialog } from "./rollback-dialog";

interface SyncDiff {
  members_added: { email: string; name: string }[];
  members_updated: { email: string; changes: Record<string, [string, string]> }[];
  events_added: string[];
  events_updated: string[];
  attendance_added: number;
  summary: {
    before: { members: number; events: number; attendance: number };
    after: { members: number; events: number; attendance: number };
  };
}

interface SyncLogEntry {
  id: number;
  source: string;
  status: string;
  records_processed: number;
  records_created: number;
  records_updated: number;
  duration_ms: number | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  diff_json: SyncDiff | null;
  has_snapshot: boolean;
}

function formatDate(utc: string): string {
  const iso = utc.replace(" ", "T") + "Z";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return utc;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const SOURCE_LABELS: Record<string, string> = {
  google_sheets: "Google Sheets",
  github: "GitHub",
  gmail: "Gmail",
  rollback: "Rollback",
};

export function SyncHistoryTable({ refreshKey }: { refreshKey: number }) {
  const [logs, setLogs] = useState<SyncLogEntry[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<SyncLogEntry | null>(null);

  const fetchLogs = useCallback(async () => {
    const res = await fetch("/api/pipelines/history?limit=10", { cache: "no-store" });
    if (res.ok) setLogs(await res.json());
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshKey]);

  // Only the most recent successful google_sheets sync can be rolled back
  const latestSuccessId = logs.find(
    (l) => l.source === "google_sheets" && l.status === "success" && l.has_snapshot
  )?.id;

  return (
    <>
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h3
            className="text-[11px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Sync History
          </h3>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              No sync history yet. Run a sync to see results here.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {logs.map((log) => {
              const isExpanded = expandedId === log.id;
              const isSuccess = log.status === "success";
              const isFailed = log.status === "failed";
              const isRollback = log.source === "rollback";
              const canRollback = log.id === latestSuccessId;

              return (
                <div key={log.id}>
                  {/* Row */}
                  <div
                    role="button"
                    tabIndex={0}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 cursor-pointer"
                    style={{
                      background: isExpanded ? "rgba(255,255,255,0.03)" : "transparent",
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setExpandedId(isExpanded ? null : log.id);
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Expand icon */}
                    <span style={{ color: "rgba(255,255,255,0.3)" }}>
                      {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </span>

                    {/* Status dot */}
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        background: isSuccess
                          ? "#4CAF50"
                          : isFailed
                            ? "#ef5350"
                            : isRollback
                              ? "#ff9800"
                              : "rgba(255,255,255,0.25)",
                        boxShadow: isSuccess
                          ? "0 0 6px rgba(76,175,80,0.5)"
                          : isFailed
                            ? "0 0 6px rgba(239,83,80,0.5)"
                            : "none",
                      }}
                    />

                    {/* Source */}
                    <span
                      className="text-[12px] font-medium w-28 truncate"
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      {SOURCE_LABELS[log.source] || log.source}
                    </span>

                    {/* Date */}
                    <span
                      className="text-[11px] font-mono flex-1"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {formatDate(log.started_at)}
                    </span>

                    {/* Duration */}
                    <span
                      className="text-[11px] font-mono w-16 text-right"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(1)}s` : "—"}
                    </span>

                    {/* Records */}
                    <span
                      className="text-[11px] font-mono w-12 text-right"
                      style={{ color: "rgba(33,150,243,0.6)" }}
                    >
                      {log.records_processed}
                    </span>

                    {/* Rollback button */}
                    <div className="w-20 text-right">
                      {canRollback && (
                        <button
                          className="text-[10px] px-2 py-0.5 rounded transition-all duration-200 cursor-pointer inline-flex items-center gap-1"
                          style={{
                            color: "rgba(239,83,80,0.7)",
                            border: "1px solid rgba(239,83,80,0.15)",
                            background: "rgba(239,83,80,0.05)",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRollbackTarget(log);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(239,83,80,0.12)";
                            e.currentTarget.style.borderColor = "rgba(239,83,80,0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(239,83,80,0.05)";
                            e.currentTarget.style.borderColor = "rgba(239,83,80,0.15)";
                          }}
                        >
                          <RotateCcw size={9} />
                          Rollback
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div
                      className="px-4 pb-4 pt-1 ml-8 space-y-3"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
                    >
                      {/* Error message */}
                      {log.error_message && (
                        <div
                          className="rounded-md p-3 text-[12px] font-mono"
                          style={{
                            background: "rgba(239,83,80,0.08)",
                            border: "1px solid rgba(239,83,80,0.15)",
                            color: "rgba(239,83,80,0.85)",
                          }}
                        >
                          {log.error_message}
                        </div>
                      )}

                      {/* Stats row */}
                      <div className="flex gap-4 text-[11px]">
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>
                          Created: <span className="font-mono" style={{ color: "rgba(76,175,80,0.7)" }}>{log.records_created}</span>
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>
                          Updated: <span className="font-mono" style={{ color: "rgba(33,150,243,0.7)" }}>{log.records_updated}</span>
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>
                          Processed: <span className="font-mono" style={{ color: "rgba(255,255,255,0.6)" }}>{log.records_processed}</span>
                        </span>
                      </div>

                      {/* Diff/Changelog */}
                      {log.diff_json && (
                        <div className="space-y-2">
                          <div
                            className="text-[10px] uppercase tracking-[0.15em] font-semibold"
                            style={{ color: "rgba(33,150,243,0.6)" }}
                          >
                            Changelog
                          </div>

                          {/* Summary counts */}
                          {log.diff_json.summary && (
                            <div
                              className="flex gap-4 text-[11px] p-2.5 rounded-md"
                              style={{
                                background: "rgba(33,150,243,0.04)",
                                border: "1px solid rgba(33,150,243,0.08)",
                              }}
                            >
                              <span style={{ color: "rgba(255,255,255,0.5)" }}>
                                Members: {log.diff_json.summary.before.members} → <span style={{ color: "rgba(33,150,243,0.8)" }}>{log.diff_json.summary.after.members}</span>
                              </span>
                              <span style={{ color: "rgba(255,255,255,0.5)" }}>
                                Events: {log.diff_json.summary.before.events} → <span style={{ color: "rgba(33,150,243,0.8)" }}>{log.diff_json.summary.after.events}</span>
                              </span>
                              <span style={{ color: "rgba(255,255,255,0.5)" }}>
                                Attendance: {log.diff_json.summary.before.attendance} → <span style={{ color: "rgba(33,150,243,0.8)" }}>{log.diff_json.summary.after.attendance}</span>
                              </span>
                            </div>
                          )}

                          {/* Members added */}
                          {log.diff_json.members_added.length > 0 && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(76,175,80,0.7)" }}>
                                <UserPlus size={11} />
                                {log.diff_json.members_added.length} new member{log.diff_json.members_added.length !== 1 ? "s" : ""}
                              </div>
                              <div className="flex flex-wrap gap-1.5 ml-4">
                                {log.diff_json.members_added.map((m) => (
                                  <span
                                    key={m.email}
                                    className="text-[10px] px-1.5 py-0.5 rounded"
                                    style={{
                                      background: "rgba(76,175,80,0.08)",
                                      border: "1px solid rgba(76,175,80,0.15)",
                                      color: "rgba(76,175,80,0.8)",
                                    }}
                                  >
                                    {m.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Events added */}
                          {log.diff_json.events_added.length > 0 && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(76,175,80,0.7)" }}>
                                <CalendarPlus size={11} />
                                {log.diff_json.events_added.length} new event{log.diff_json.events_added.length !== 1 ? "s" : ""}
                              </div>
                              <div className="flex flex-wrap gap-1.5 ml-4">
                                {log.diff_json.events_added.map((title) => (
                                  <span
                                    key={title}
                                    className="text-[10px] px-1.5 py-0.5 rounded"
                                    style={{
                                      background: "rgba(76,175,80,0.08)",
                                      border: "1px solid rgba(76,175,80,0.15)",
                                      color: "rgba(76,175,80,0.8)",
                                    }}
                                  >
                                    {title}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Members updated */}
                          {log.diff_json.members_updated.length > 0 && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(33,150,243,0.7)" }}>
                                <Users size={11} />
                                {log.diff_json.members_updated.length} member{log.diff_json.members_updated.length !== 1 ? "s" : ""} updated
                              </div>
                              <div className="space-y-1 ml-4">
                                {log.diff_json.members_updated.slice(0, 10).map((m) => (
                                  <div key={m.email} className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                                    <span className="font-mono">{m.email}</span>
                                    {Object.entries(m.changes).map(([field, [from, to]]) => (
                                      <span key={field} className="ml-2">
                                        {field}: <span style={{ color: "rgba(239,83,80,0.6)" }}>{from}</span> → <span style={{ color: "rgba(76,175,80,0.7)" }}>{to}</span>
                                      </span>
                                    ))}
                                  </div>
                                ))}
                                {log.diff_json.members_updated.length > 10 && (
                                  <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                                    ...and {log.diff_json.members_updated.length - 10} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Attendance */}
                          {log.diff_json.attendance_added > 0 && (
                            <div className="text-[11px]" style={{ color: "rgba(33,150,243,0.6)" }}>
                              +{log.diff_json.attendance_added} attendance record{log.diff_json.attendance_added !== 1 ? "s" : ""}
                            </div>
                          )}

                          {/* No changes */}
                          {log.diff_json.members_added.length === 0 &&
                            log.diff_json.members_updated.length === 0 &&
                            log.diff_json.events_added.length === 0 &&
                            log.diff_json.events_updated.length === 0 &&
                            log.diff_json.attendance_added === 0 && (
                              <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                                No data changes detected
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rollback dialog */}
      {rollbackTarget && (
        <RollbackDialog
          open={!!rollbackTarget}
          onClose={() => setRollbackTarget(null)}
          syncLogId={rollbackTarget.id}
          syncDate={formatDate(rollbackTarget.started_at)}
          recordsProcessed={rollbackTarget.records_processed}
          onRollbackComplete={fetchLogs}
        />
      )}
    </>
  );
}
