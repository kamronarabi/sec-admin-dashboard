"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, CheckCircle } from "lucide-react";

interface EventNotesProps {
  eventId: number;
}

export function EventNotes({ eventId }: EventNotesProps) {
  const [wentWell, setWentWell] = useState("");
  const [wentWrong, setWentWrong] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setSaved(false);
    fetch(`/api/events/${eventId}/notes`)
      .then((r) => r.json())
      .then((data) => {
        setWentWell(data.went_well || "");
        setWentWrong(data.went_wrong || "");
        setLoaded(true);
      });
  }, [eventId]);

  const save = useCallback(async () => {
    setSaving(true);
    await fetch(`/api/events/${eventId}/notes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ went_well: wentWell, went_wrong: wentWrong }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [eventId, wentWell, wentWrong]);

  if (!loaded) {
    return (
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
        Loading notes...
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label
          className="text-[10px] font-semibold uppercase tracking-wider block mb-1"
          style={{ color: "rgba(34,197,94,0.7)" }}
        >
          What went well
        </label>
        <textarea
          value={wentWell}
          onChange={(e) => setWentWell(e.target.value)}
          rows={3}
          className="w-full text-xs rounded px-2 py-1.5 resize-none outline-none transition-colors"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.8)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(33,150,243,0.3)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          }}
          placeholder="Notes on what went well..."
        />
      </div>
      <div>
        <label
          className="text-[10px] font-semibold uppercase tracking-wider block mb-1"
          style={{ color: "rgba(239,68,68,0.7)" }}
        >
          What went wrong
        </label>
        <textarea
          value={wentWrong}
          onChange={(e) => setWentWrong(e.target.value)}
          rows={3}
          className="w-full text-xs rounded px-2 py-1.5 resize-none outline-none transition-colors"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.8)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(33,150,243,0.3)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          }}
          placeholder="Notes on what could improve..."
        />
      </div>
      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded cursor-pointer transition-all duration-200"
        style={{
          background: saved ? "rgba(34,197,94,0.15)" : "rgba(33,150,243,0.12)",
          border: `1px solid ${saved ? "rgba(34,197,94,0.3)" : "rgba(33,150,243,0.2)"}`,
          color: saved ? "rgba(34,197,94,0.9)" : "rgba(33,150,243,0.9)",
        }}
        onMouseEnter={(e) => {
          if (!saved) e.currentTarget.style.background = "rgba(33,150,243,0.2)";
        }}
        onMouseLeave={(e) => {
          if (!saved) e.currentTarget.style.background = "rgba(33,150,243,0.12)";
        }}
      >
        {saved ? <CheckCircle size={12} /> : <Save size={12} />}
        {saving ? "Saving..." : saved ? "Saved" : "Save Notes"}
      </button>
    </div>
  );
}
