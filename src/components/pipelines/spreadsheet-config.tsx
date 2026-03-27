"use client";

import { useEffect, useState } from "react";
import { Save, Pencil, X, ExternalLink, Trash2 } from "lucide-react";

export function SpreadsheetConfig() {
  const [config, setConfig] = useState<Record<string, Record<string, string | null>>>({});
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchConfig = async () => {
    const res = await fetch("/api/pipelines/config", { cache: "no-store" });
    if (res.ok) setConfig(await res.json());
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const currentId = config.google_sheets?.spreadsheet_id || "";

  const startEdit = () => {
    setEditValue(currentId);
    setEditing(true);
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditing(false);
    setMessage(null);
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pipelines/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "google_sheets",
          config_key: "spreadsheet_id",
          config_value: editValue.trim(),
        }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Saved. Changes take effect on next sync." });
        setEditing(false);
        await fetchConfig();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const sheetsUrl = currentId ? `https://docs.google.com/spreadsheets/d/${currentId}` : null;

  return (
    <div className="space-y-6">
      {/* Google Sheets config */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Header */}
        <div
          className="relative px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(33,150,243,0.3) 50%, transparent 100%)",
            }}
          />
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h3
              className="text-[13px] font-semibold tracking-wide"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              Google Sheets Source
            </h3>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Spreadsheet ID */}
          <div>
            <label
              className="text-[10px] uppercase tracking-[0.15em] block mb-2"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Spreadsheet ID
            </label>

            {editing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full text-[12px] font-mono px-3 py-2 rounded-md outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(33,150,243,0.3)",
                    color: "rgba(255,255,255,0.8)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(33,150,243,0.5)";
                    e.currentTarget.style.boxShadow = "0 0 12px rgba(33,150,243,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(33,150,243,0.3)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="Enter Google Sheets spreadsheet ID..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveConfig}
                    disabled={saving || !editValue.trim()}
                    className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer"
                    style={{
                      color: saving ? "rgba(33,150,243,0.4)" : "rgba(33,150,243,0.9)",
                      border: "1px solid rgba(33,150,243,0.25)",
                      background: "rgba(33,150,243,0.08)",
                    }}
                    onMouseEnter={(e) => {
                      if (!saving) {
                        e.currentTarget.style.background = "rgba(33,150,243,0.15)";
                        e.currentTarget.style.borderColor = "rgba(33,150,243,0.4)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(33,150,243,0.08)";
                      e.currentTarget.style.borderColor = "rgba(33,150,243,0.25)";
                    }}
                  >
                    <Save size={11} />
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer"
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }}
                  >
                    <X size={11} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 text-[12px] font-mono px-3 py-2 rounded-md truncate"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: currentId ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)",
                  }}
                >
                  {currentId || "Not configured"}
                </div>
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-2 rounded-md transition-all duration-200 cursor-pointer shrink-0"
                  style={{
                    color: "rgba(33,150,243,0.8)",
                    border: "1px solid rgba(33,150,243,0.2)",
                    background: "rgba(33,150,243,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(33,150,243,0.12)";
                    e.currentTarget.style.borderColor = "rgba(33,150,243,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(33,150,243,0.06)";
                    e.currentTarget.style.borderColor = "rgba(33,150,243,0.2)";
                  }}
                >
                  <Pencil size={11} />
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Link to sheet */}
          {sheetsUrl && !editing && (
            <a
              href={sheetsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] transition-all duration-200"
              style={{ color: "rgba(33,150,243,0.6)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgba(33,150,243,0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(33,150,243,0.6)";
              }}
            >
              <ExternalLink size={10} />
              Open in Google Sheets
            </a>
          )}

          {/* Status message */}
          {message && (
            <div
              className="rounded-md p-2.5 text-[12px]"
              style={{
                background: message.type === "success" ? "rgba(76,175,80,0.08)" : "rgba(239,83,80,0.08)",
                border: `1px solid ${message.type === "success" ? "rgba(76,175,80,0.15)" : "rgba(239,83,80,0.15)"}`,
                color: message.type === "success" ? "rgba(76,175,80,0.85)" : "rgba(239,83,80,0.85)",
              }}
            >
              {message.text}
            </div>
          )}

          {/* Note */}
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            Changes take effect on the next sync. No redeployment required.
          </p>
        </div>
      </div>

      {/* Gmail config */}
      <GmailConfig />

      {/* GitHub placeholder */}
      <div
        className="rounded-lg p-4 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🔗</span>
          <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
            GitHub
          </span>
        </div>
        <span
          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
          style={{
            color: "rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          Coming Soon
        </span>
      </div>
    </div>
  );
}

function GmailConfig() {
  const [totalEmails, setTotalEmails] = useState<number | null>(null);
  const [oldestEmail, setOldestEmail] = useState<string | null>(null);
  const [purging, setPurging] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchStats = async () => {
    const res = await fetch("/api/emails/purge", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setTotalEmails(data.totalEmails);
      setOldestEmail(data.oldestEmail);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handlePurge = async () => {
    setPurging(true);
    setResult(null);
    try {
      const res = await fetch("/api/emails/purge", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ olderThanDays: 30 }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult({ type: "success", text: `Deleted ${data.deleted} email${data.deleted === 1 ? "" : "s"} older than 30 days.` });
        await fetchStats();
      } else {
        const data = await res.json();
        setResult({ type: "error", text: data.error || "Purge failed" });
      }
    } catch {
      setResult({ type: "error", text: "Network error" });
    } finally {
      setPurging(false);
      setConfirmOpen(false);
    }
  };

  const oldestFormatted = oldestEmail
    ? new Date(oldestEmail.replace(" ", "T") + "Z").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="relative px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(33,150,243,0.3) 50%, transparent 100%)",
          }}
        />
        <div className="flex items-center gap-2">
          <span className="text-lg">📧</span>
          <h3
            className="text-[13px] font-semibold tracking-wide"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            Gmail
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="flex gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Stored Emails
            </div>
            <div className="text-sm font-mono font-semibold" style={{ color: "rgba(33,150,243,0.8)" }}>
              {totalEmails !== null ? totalEmails.toLocaleString() : "—"}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Oldest Email
            </div>
            <div className="text-sm font-mono font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
              {oldestFormatted || "—"}
            </div>
          </div>
        </div>

        {/* Purge button / confirm */}
        {!confirmOpen ? (
          <button
            onClick={() => { setConfirmOpen(true); setResult(null); }}
            disabled={totalEmails === 0}
            className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer"
            style={{
              color: totalEmails === 0 ? "rgba(239,83,80,0.3)" : "rgba(239,83,80,0.85)",
              border: "1px solid rgba(239,83,80,0.2)",
              background: "rgba(239,83,80,0.06)",
            }}
            onMouseEnter={(e) => {
              if (totalEmails !== 0) {
                e.currentTarget.style.background = "rgba(239,83,80,0.12)";
                e.currentTarget.style.borderColor = "rgba(239,83,80,0.35)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239,83,80,0.06)";
              e.currentTarget.style.borderColor = "rgba(239,83,80,0.2)";
            }}
          >
            <Trash2 size={11} />
            Purge Old Emails
          </button>
        ) : (
          <div
            className="rounded-md p-3 space-y-2"
            style={{
              background: "rgba(239,83,80,0.06)",
              border: "1px solid rgba(239,83,80,0.15)",
            }}
          >
            <p className="text-[11px]" style={{ color: "rgba(239,83,80,0.85)" }}>
              Delete all emails older than 30 days? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handlePurge}
                disabled={purging}
                className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer"
                style={{
                  color: purging ? "rgba(239,83,80,0.4)" : "#fff",
                  background: purging ? "rgba(239,83,80,0.15)" : "rgba(239,83,80,0.7)",
                  border: "1px solid rgba(239,83,80,0.4)",
                }}
              >
                <Trash2 size={11} />
                {purging ? "Purging..." : "Confirm Delete"}
              </button>
              <button
                onClick={() => setConfirmOpen(false)}
                className="text-[11px] px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Result message */}
        {result && (
          <div
            className="rounded-md p-2.5 text-[12px]"
            style={{
              background: result.type === "success" ? "rgba(76,175,80,0.08)" : "rgba(239,83,80,0.08)",
              border: `1px solid ${result.type === "success" ? "rgba(76,175,80,0.15)" : "rgba(239,83,80,0.15)"}`,
              color: result.type === "success" ? "rgba(76,175,80,0.85)" : "rgba(239,83,80,0.85)",
            }}
          >
            {result.text}
          </div>
        )}

        <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          Purges emails older than 30 days. Purged emails will be re-synced on the next Gmail sync if they are still in your inbox.
        </p>
      </div>
    </div>
  );
}
