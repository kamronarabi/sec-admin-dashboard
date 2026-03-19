"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { ActionItem } from "@/lib/types";

export function ActionItemsList() {
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

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex gap-2">
        <Input
          placeholder="Add a new action item..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
        />
        <Button onClick={addItem}>Add</Button>
      </div>

      <div className="space-y-1">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">No action items yet.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-muted/50 group"
            >
              <Checkbox
                checked={item.status === "done"}
                onCheckedChange={() => toggleItem(item)}
              />
              <span
                className={`flex-1 text-sm ${
                  item.status === "done" ? "line-through text-muted-foreground" : ""
                }`}
              >
                {item.title}
              </span>
              {item.due_date && (
                <span className="text-xs text-muted-foreground">{item.due_date}</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                onClick={() => deleteItem(item.id)}
              >
                x
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
