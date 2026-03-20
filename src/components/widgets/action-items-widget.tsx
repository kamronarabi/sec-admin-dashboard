"use client";

import { useCallback, useEffect, useState } from "react";
import type { ActionItem } from "@/lib/types";

const PRIORITY_STYLES: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  high: {
    color: "rgba(239,83,80,0.9)",
    bg: "rgba(239,83,80,0.08)",
    border: "rgba(239,83,80,0.2)",
    glow: "0 0 8px rgba(239,83,80,0.15)",
  },
  medium: {
    color: "rgba(255,183,77,0.9)",
    bg: "rgba(255,183,77,0.08)",
    border: "rgba(255,183,77,0.2)",
    glow: "0 0 8px rgba(255,183,77,0.15)",
  },
  low: {
    color: "rgba(76,175,80,0.9)",
    bg: "rgba(76,175,80,0.08)",
    border: "rgba(76,175,80,0.2)",
    glow: "0 0 8px rgba(76,175,80,0.15)",
  },
};

export function ActionItemsWidget() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/actions");
    if (res.ok) {
      const data = await res.json();
      setItems(data.filter((i: ActionItem) => i.status === "pending"));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async () => {
    if (!newTitle.trim()) return;
    await fetch("/api/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), priority }),
    });
    setNewTitle("");
    setPriority("medium");
    fetchItems();
  };

  const completeItem = async (id: number) => {
    await fetch("/api/actions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "done" }),
    });
    fetchItems();
    if (currentIndex > 0 && currentIndex >= items.length - 1) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const dismissItem = async (id: number) => {
    await fetch("/api/actions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "dismissed" }),
    });
    fetchItems();
    if (currentIndex > 0 && currentIndex >= items.length - 1) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(items.length - 1, i + 1));

  const current = items[currentIndex];
  const pStyle = current
    ? PRIORITY_STYLES[current.priority] || PRIORITY_STYLES.medium
    : PRIORITY_STYLES.medium;

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#2196F3", boxShadow: "0 0 8px #2196F3" }}
        />
        <h3
          className="text-[11px] font-semibold uppercase tracking-[0.15em]"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Action Items
        </h3>
        <span
          className="text-[10px] font-mono ml-auto"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          {items.length} pending
        </span>
      </div>

      {/* Carousel */}
      <div className="flex-1 min-h-0 flex flex-col">
        {loading ? (
          <div
            className="flex-1 flex items-center justify-center text-[10px]"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div
            className="flex-1 flex items-center justify-center text-[11px]"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            No pending items
          </div>
        ) : (
          <>
            <div
              className="flex-1 flex flex-col justify-center rounded-md p-3 min-h-0 transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: `1px solid ${pStyle.border}`,
                boxShadow: pStyle.glow,
              }}
            >
              {current && (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm font-medium leading-tight"
                      style={{ color: "rgba(255,255,255,0.85)" }}
                    >
                      {current.title}
                    </p>
                    <span
                      className="shrink-0 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold"
                      style={{
                        color: pStyle.color,
                        background: pStyle.bg,
                        border: `1px solid ${pStyle.border}`,
                      }}
                    >
                      {current.priority}
                    </span>
                  </div>
                  {current.due_date && (
                    <p
                      className="text-[10px] font-mono"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      Due: {current.due_date}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      className="text-[10px] px-2.5 py-1 rounded transition-all duration-200 cursor-pointer"
                      style={{
                        color: "rgba(76,175,80,0.8)",
                        border: "1px solid rgba(76,175,80,0.2)",
                        background: "rgba(76,175,80,0.06)",
                      }}
                      onClick={() => completeItem(current.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(76,175,80,0.15)";
                        e.currentTarget.style.borderColor =
                          "rgba(76,175,80,0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(76,175,80,0.06)";
                        e.currentTarget.style.borderColor =
                          "rgba(76,175,80,0.2)";
                      }}
                    >
                      Done
                    </button>
                    <button
                      className="text-[10px] px-2.5 py-1 rounded transition-all duration-200 cursor-pointer"
                      style={{
                        color: "rgba(255,255,255,0.35)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        background: "transparent",
                      }}
                      onClick={() => dismissItem(current.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.04)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation dots */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                className="text-sm leading-none cursor-pointer transition-colors"
                style={{
                  color:
                    currentIndex === 0
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.4)",
                }}
                disabled={currentIndex === 0}
                onClick={prev}
              >
                ‹
              </button>
              <div className="flex gap-1">
                {items.map((_, i) => (
                  <button
                    key={i}
                    className="w-1 h-1 rounded-full cursor-pointer transition-all duration-200"
                    style={{
                      background:
                        i === currentIndex
                          ? "#2196F3"
                          : "rgba(255,255,255,0.15)",
                      boxShadow:
                        i === currentIndex ? "0 0 6px #2196F3" : "none",
                    }}
                    onClick={() => setCurrentIndex(i)}
                  />
                ))}
              </div>
              <button
                className="text-sm leading-none cursor-pointer transition-colors"
                style={{
                  color:
                    currentIndex >= items.length - 1
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(255,255,255,0.4)",
                }}
                disabled={currentIndex >= items.length - 1}
                onClick={next}
              >
                ›
              </button>
            </div>
          </>
        )}
      </div>

      {/* Input + Priority selector */}
      <div
        className="space-y-2 pt-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <input
          type="text"
          placeholder="New action item..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          className="w-full h-7 text-[11px] rounded-md px-2.5 outline-none transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.8)",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(33,150,243,0.3)";
            e.currentTarget.style.boxShadow =
              "0 0 12px rgba(33,150,243,0.08)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <div className="flex items-center gap-1">
          {(["high", "medium", "low"] as const).map((p) => {
            const s = PRIORITY_STYLES[p];
            const isActive = priority === p;
            return (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className="flex-1 text-[10px] font-semibold py-1 rounded-md transition-all duration-200 uppercase tracking-wider cursor-pointer"
                style={{
                  color: isActive ? s.color : "rgba(255,255,255,0.25)",
                  background: isActive ? s.bg : "transparent",
                  border: `1px solid ${isActive ? s.border : "rgba(255,255,255,0.04)"}`,
                  boxShadow: isActive ? s.glow : "none",
                }}
              >
                {p}
              </button>
            );
          })}
          <button
            className="text-[10px] font-semibold px-3 py-1 rounded-md transition-all duration-200 cursor-pointer ml-1"
            style={{
              color: "rgba(33,150,243,0.9)",
              background: "rgba(33,150,243,0.1)",
              border: "1px solid rgba(33,150,243,0.2)",
            }}
            onClick={addItem}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(33,150,243,0.2)";
              e.currentTarget.style.borderColor = "rgba(33,150,243,0.4)";
              e.currentTarget.style.boxShadow =
                "0 0 12px rgba(33,150,243,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(33,150,243,0.1)";
              e.currentTarget.style.borderColor = "rgba(33,150,243,0.2)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
