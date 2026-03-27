"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Clock, Users } from "lucide-react";
import type { SentEmail } from "@/lib/types";

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

export function SentHistory() {
  const [open, setOpen] = useState(false);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);

  useEffect(() => {
    if (open && sentEmails.length === 0) {
      fetch("/api/emails/sent")
        .then((r) => r.json())
        .then(setSentEmails);
    }
  }, [open, sentEmails.length]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[10px] font-medium py-1.5 px-3 rounded-md transition-all duration-150 cursor-pointer"
        style={{
          color: "rgba(255,255,255,0.4)",
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          e.currentTarget.style.color = "rgba(255,255,255,0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
          e.currentTarget.style.color = "rgba(255,255,255,0.4)";
        }}
      >
        <Clock size={10} />
        Sent History
        <ChevronDown
          size={10}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 150ms",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute bottom-full right-0 mb-2 w-[320px] max-h-[250px] overflow-y-auto rounded-lg z-30"
          style={{
            background: "#1a1a2e",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 -8px 24px rgba(0,0,0,0.5)",
            scrollbarWidth: "thin",
          }}
        >
          <div
            className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest sticky top-0"
            style={{
              color: "rgba(255,255,255,0.4)",
              background: "#1a1a2e",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            Recent Sends
          </div>

          {sentEmails.length === 0 ? (
            <div className="px-3 py-4 text-center text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
              No emails sent yet
            </div>
          ) : (
            sentEmails.map((email) => (
              <div
                key={email.id}
                className="px-3 py-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] font-medium truncate flex-1"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {email.subject}
                  </span>
                  <span className="text-[9px] font-mono ml-2 shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {timeAgo(email.sent_at)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Users size={9} style={{ color: "rgba(33,150,243,0.5)" }} />
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {email.recipient_count} recipient{email.recipient_count !== 1 ? "s" : ""}
                  </span>
                  <span className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.2)" }}>
                    — {email.sent_by}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
