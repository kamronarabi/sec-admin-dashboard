"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckSquare, Plus, Send, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { ActionItem } from "@/lib/types";
import { InboxWidget } from "@/components/email/inbox-widget";
import { EmailComposer } from "@/components/email/email-composer";

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-lg overflow-hidden ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(33,150,243,0.3) 50%, transparent 100%)",
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

export default function ActionItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/actions");
    if (res.ok) setItems(await res.json());
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
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    setNewTitle("");
    fetchItems();
  };

  const toggleItem = async (item: ActionItem) => {
    const newStatus = item.status === "done" ? "pending" : "done";
    await fetch("/api/actions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status: newStatus }),
    });
    fetchItems();
  };

  const deleteItem = async (id: number) => {
    await fetch(`/api/actions?id=${id}`, { method: "DELETE" });
    fetchItems();
  };

  const pendingItems = items.filter((i) => i.status === "pending");
  const doneItems = items.filter((i) => i.status === "done");

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(33,150,243,0.15)";
            e.currentTarget.style.borderColor = "rgba(33,150,243,0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <ArrowLeft size={14} color="rgba(255,255,255,0.6)" />
        </button>
        <CheckSquare
          size={16}
          color="#2196F3"
          style={{ filter: "drop-shadow(0 0 6px #2196F3)" }}
        />
        <h1
          className="text-sm font-semibold uppercase tracking-[0.12em]"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Action Items & Email
        </h1>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Left column: Action Items + Inbox */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* Action Items */}
          <GlassPanel className="flex-[1]">
            <div className="flex flex-col h-full p-4">
              {/* Action items header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare
                    size={13}
                    color="#2196F3"
                    style={{ filter: "drop-shadow(0 0 4px #2196F3)" }}
                  />
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    Action Items
                  </span>
                  {pendingItems.length > 0 && (
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "rgba(33,150,243,0.15)",
                        color: "rgba(33,150,243,0.9)",
                        border: "1px solid rgba(33,150,243,0.2)",
                      }}
                    >
                      {pendingItems.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Add item */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                  placeholder="Add a new action item..."
                  className="flex-1 bg-transparent text-[12px] outline-none px-2.5 py-1.5 rounded-md"
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
                <button
                  onClick={addItem}
                  className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded-md transition-all duration-150 cursor-pointer"
                  style={{
                    color: "#2196F3",
                    border: "1px solid rgba(33,150,243,0.2)",
                    background: "rgba(33,150,243,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(33,150,243,0.15)";
                    e.currentTarget.style.borderColor = "rgba(33,150,243,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(33,150,243,0.06)";
                    e.currentTarget.style.borderColor = "rgba(33,150,243,0.2)";
                  }}
                >
                  <Plus size={11} />
                  Add
                </button>
              </div>

              {/* Items list */}
              <div
                className="flex-1 overflow-y-auto space-y-1 min-h-0"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.1) transparent",
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                      Loading...
                    </span>
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex items-center justify-center py-6">
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                      No action items yet
                    </span>
                  </div>
                ) : (
                  <>
                    {pendingItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-md group transition-all duration-100"
                        style={{ background: "rgba(255,255,255,0.02)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                        }}
                      >
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => toggleItem(item)}
                        />
                        <span
                          className="flex-1 text-[12px]"
                          style={{ color: "rgba(255,255,255,0.75)" }}
                        >
                          {item.title}
                        </span>
                        {item.due_date && (
                          <span className="text-[9px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                            {item.due_date}
                          </span>
                        )}
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Trash2 size={11} color="rgba(239,83,80,0.6)" />
                        </button>
                      </div>
                    ))}
                    {doneItems.length > 0 && (
                      <>
                        <div
                          className="text-[9px] uppercase tracking-widest pt-2 pb-1 px-1"
                          style={{ color: "rgba(255,255,255,0.2)" }}
                        >
                          Completed
                        </div>
                        {doneItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md group"
                          >
                            <Checkbox
                              checked={true}
                              onCheckedChange={() => toggleItem(item)}
                            />
                            <span
                              className="flex-1 text-[11px] line-through"
                              style={{ color: "rgba(255,255,255,0.25)" }}
                            >
                              {item.title}
                            </span>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Trash2 size={11} color="rgba(239,83,80,0.4)" />
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </GlassPanel>

          {/* Inbox */}
          <GlassPanel className="flex-[2]">
            <div className="p-4 h-full">
              <InboxWidget />
            </div>
          </GlassPanel>
        </div>

        {/* Right column: Email Composer */}
        <GlassPanel className="min-h-0">
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Send
                size={13}
                color="#2196F3"
                style={{ filter: "drop-shadow(0 0 4px #2196F3)" }}
              />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Compose Email
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <EmailComposer />
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
