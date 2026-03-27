"use client";

import { useCallback, useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { RecipientPicker } from "./recipient-picker";
import { RichTextEditor } from "./rich-text-editor";
import { SentHistory } from "./sent-history";

export function EmailComposer() {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecipientsChange = useCallback((emails: string[]) => {
    setRecipients(emails);
  }, []);

  const handleSend = async () => {
    if (!recipients.length || !subject.trim() || !bodyHtml.trim()) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipients,
          subject: subject.trim(),
          body_html: bodyHtml,
        }),
      });

      if (res.ok) {
        setSent(true);
        setTimeout(() => {
          setSent(false);
          setSubject("");
          setBodyHtml("");
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send email");
      }
    } catch {
      setError("Network error — could not send email");
    } finally {
      setSending(false);
    }
  };

  const canSend = recipients.length > 0 && subject.trim() && bodyHtml.trim() && !sending;

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Recipient picker */}
      <RecipientPicker onChange={handleRecipientsChange} />

      {/* Subject */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
          Subject:
        </span>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter subject..."
          className="flex-1 bg-transparent text-[12px] outline-none px-2 py-1.5 rounded-md"
          style={{
            color: "rgba(255,255,255,0.85)",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(33,150,243,0.3)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
          }}
        />
      </div>

      {/* Rich text editor */}
      <div className="flex-1 min-h-0">
        <RichTextEditor onChange={setBodyHtml} placeholder="Compose your email..." />
      </div>

      {/* Error message */}
      {error && (
        <div
          className="text-[11px] px-3 py-2 rounded-md"
          style={{
            background: "rgba(239,83,80,0.08)",
            border: "1px solid rgba(239,83,80,0.2)",
            color: "rgba(239,83,80,0.9)",
          }}
        >
          {error}
        </div>
      )}

      {/* Send button + sent history */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex items-center gap-2 text-[11px] font-semibold py-2 px-5 rounded-lg transition-all duration-200 cursor-pointer"
          style={{
            background: canSend
              ? "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)"
              : "rgba(255,255,255,0.04)",
            color: canSend ? "#fff" : "rgba(255,255,255,0.2)",
            border: canSend
              ? "1px solid rgba(33,150,243,0.5)"
              : "1px solid rgba(255,255,255,0.06)",
            boxShadow: canSend ? "0 0 20px rgba(33,150,243,0.25)" : "none",
            opacity: sending ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (canSend) {
              e.currentTarget.style.boxShadow = "0 0 30px rgba(33,150,243,0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (canSend) {
              e.currentTarget.style.boxShadow = "0 0 20px rgba(33,150,243,0.25)";
            }
          }}
        >
          {sending ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Sending...
            </>
          ) : sent ? (
            <>
              <CheckCircle size={13} />
              Sent!
            </>
          ) : (
            <>
              <Send size={13} />
              Send Email
            </>
          )}
        </button>

        <SentHistory />
      </div>
    </div>
  );
}
