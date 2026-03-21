"use client";

import { useEffect, useState } from "react";
import { Save, Pencil, X, ExternalLink } from "lucide-react";

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

      {/* Future pipelines placeholder */}
      {["GitHub", "Gmail"].map((name) => (
        <div
          key={name}
          className="rounded-lg p-4 flex items-center justify-between"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{name === "GitHub" ? "🔗" : "📧"}</span>
            <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
              {name}
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
      ))}
    </div>
  );
}
