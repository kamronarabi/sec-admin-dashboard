"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, RefreshCw, X, ExternalLink } from "lucide-react";
import type { Email } from "@/lib/types";

function timeAgo(utc: string): string {
  const iso = utc.includes("T") ? utc : utc.replace(" ", "T") + "Z";
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return "Just now";
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
}

function extractSenderName(from: string): string {
  const match = from.match(/^"?([^"<]+)"?\s*</);
  return match ? match[1].trim() : from.split("@")[0];
}

export function InboxWidget() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchEmails = useCallback(async () => {
    const res = await fetch("/api/emails?limit=10");
    if (res.ok) setEmails(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch("/api/pipelines/sync-gmail", { method: "POST" });
      await fetchEmails();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mail size={14} color="#2196F3" style={{ filter: "drop-shadow(0 0 6px #2196F3)" }} />
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Inbox
          </span>
          {emails.length > 0 && (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
              style={{
                background: "rgba(33,150,243,0.15)",
                color: "rgba(33,150,243,0.9)",
                border: "1px solid rgba(33,150,243,0.2)",
              }}
            >
              {emails.length}
            </span>
          )}
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1 text-[10px] font-medium py-1 px-2 rounded-md transition-all duration-200 cursor-pointer"
          style={{
            color: syncing ? "rgba(33,150,243,0.5)" : "rgba(33,150,243,0.8)",
            border: "1px solid rgba(33,150,243,0.15)",
            background: "rgba(33,150,243,0.05)",
          }}
          onMouseEnter={(e) => {
            if (!syncing) {
              e.currentTarget.style.background = "rgba(33,150,243,0.12)";
              e.currentTarget.style.borderColor = "rgba(33,150,243,0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(33,150,243,0.05)";
            e.currentTarget.style.borderColor = "rgba(33,150,243,0.15)";
          }}
        >
          <RefreshCw size={10} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing..." : "Sync"}
        </button>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              Loading...
            </span>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Mail size={20} color="rgba(255,255,255,0.15)" />
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              No emails synced yet
            </span>
          </div>
        ) : (
          emails.map((email) => (
            <div key={email.id}>
              <button
                onClick={() => setExpanded(expanded === email.id ? null : email.id)}
                className="w-full text-left p-2.5 rounded-md transition-all duration-150 cursor-pointer"
                style={{
                  background:
                    expanded === email.id
                      ? "rgba(33,150,243,0.08)"
                      : "rgba(255,255,255,0.02)",
                  border: `1px solid ${expanded === email.id ? "rgba(33,150,243,0.15)" : "rgba(255,255,255,0.03)"}`,
                }}
                onMouseEnter={(e) => {
                  if (expanded !== email.id) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (expanded !== email.id) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.03)";
                  }
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[11px] font-medium truncate"
                    style={{ color: email.is_read ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.85)" }}
                  >
                    {extractSenderName(email.from_address)}
                  </span>
                  <span className="text-[9px] font-mono shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {timeAgo(email.received_at)}
                  </span>
                </div>
                <div
                  className="text-[11px] truncate mt-0.5"
                  style={{ color: email.is_read ? "rgba(255,255,255,0.35)" : "rgba(33,150,243,0.7)" }}
                >
                  {email.subject || "(no subject)"}
                </div>
                {!expanded && email.snippet && (
                  <div
                    className="text-[10px] truncate mt-0.5"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    {email.snippet}
                  </div>
                )}
              </button>

              {/* Expanded view */}
              {expanded === email.id && (
                <div
                  className="mx-1 mt-1 p-3 rounded-md"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(33,150,243,0.1)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                      From: {email.from_address}
                    </span>
                    <button
                      onClick={() => setExpanded(null)}
                      className="cursor-pointer"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                  {email.body_html ? (
                    <div
                      className="text-[11px] leading-relaxed max-h-[200px] overflow-y-auto"
                      style={{ color: "rgba(255,255,255,0.6)", scrollbarWidth: "thin" }}
                      dangerouslySetInnerHTML={{ __html: email.body_html }}
                    />
                  ) : (
                    <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {email.snippet || "No content"}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
