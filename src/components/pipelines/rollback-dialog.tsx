"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RollbackDialogProps {
  open: boolean;
  onClose: () => void;
  syncLogId: number;
  syncDate: string;
  recordsProcessed: number;
  onRollbackComplete: () => void;
}

export function RollbackDialog({
  open,
  onClose,
  syncLogId,
  syncDate,
  recordsProcessed,
  onRollbackComplete,
}: RollbackDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRollback = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pipelines/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sync_log_id: syncLogId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Rollback failed");
      } else {
        setSuccess(true);
        setTimeout(() => {
          onRollbackComplete();
          onClose();
          setSuccess(false);
        }, 1500);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          border: "1px solid rgba(239,83,80,0.2)",
          boxShadow: "0 0 40px rgba(239,83,80,0.1)",
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-sm font-semibold uppercase tracking-[0.1em]"
            style={{ color: "rgba(239,83,80,0.9)" }}
          >
            Rollback Sync
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.7)" }}>
            This will restore your data to the state <strong>before</strong> this sync ran. This action cannot be undone.
          </p>

          <div
            className="rounded-md p-3 space-y-1.5"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex justify-between text-[11px]">
              <span style={{ color: "rgba(255,255,255,0.4)" }}>Sync ID</span>
              <span className="font-mono" style={{ color: "rgba(255,255,255,0.6)" }}>
                #{syncLogId}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span style={{ color: "rgba(255,255,255,0.4)" }}>Date</span>
              <span className="font-mono" style={{ color: "rgba(255,255,255,0.6)" }}>
                {syncDate}
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span style={{ color: "rgba(255,255,255,0.4)" }}>Records processed</span>
              <span className="font-mono" style={{ color: "rgba(255,255,255,0.6)" }}>
                {recordsProcessed}
              </span>
            </div>
          </div>

          {error && (
            <div
              className="rounded-md p-2.5 text-[12px]"
              style={{
                background: "rgba(239,83,80,0.1)",
                border: "1px solid rgba(239,83,80,0.2)",
                color: "rgba(239,83,80,0.9)",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="rounded-md p-2.5 text-[12px]"
              style={{
                background: "rgba(76,175,80,0.1)",
                border: "1px solid rgba(76,175,80,0.2)",
                color: "rgba(76,175,80,0.9)",
              }}
            >
              Rollback complete. Data restored.
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 text-[12px] py-2 rounded-md transition-all duration-200 cursor-pointer"
              style={{
                color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.1)",
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
            <button
              onClick={handleRollback}
              disabled={loading || success}
              className="flex-1 text-[12px] py-2 rounded-md transition-all duration-200 cursor-pointer font-medium"
              style={{
                color: loading ? "rgba(239,83,80,0.4)" : "rgba(239,83,80,0.95)",
                border: "1px solid rgba(239,83,80,0.3)",
                background: "rgba(239,83,80,0.08)",
              }}
              onMouseEnter={(e) => {
                if (!loading && !success) {
                  e.currentTarget.style.background = "rgba(239,83,80,0.18)";
                  e.currentTarget.style.borderColor = "rgba(239,83,80,0.5)";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(239,83,80,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(239,83,80,0.08)";
                e.currentTarget.style.borderColor = "rgba(239,83,80,0.3)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {loading ? "Rolling back..." : "Confirm Rollback"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
