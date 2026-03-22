"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import type { Event } from "@/lib/types";

interface UpcomingEventsProps {
  events: Event[];
}

function parseEventDate(dateStr: string): Date | null {
  const match = dateStr.match(/(\d+)\/(\d+)\/(\d+)$/);
  if (!match) return null;
  const [, month, day, year] = match.map(Number);
  return new Date(2000 + year, month - 1, day);
}

function getCountdown(target: Date): string {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "Today";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Tomorrow";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  const weeks = Math.floor(days / 7);
  const remainDays = days % 7;
  if (remainDays === 0) return `${weeks}w`;
  return `${weeks}w ${remainDays}d`;
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const [, setTick] = useState(0);

  // Re-render every minute to keep countdowns fresh
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const upcoming = events
    .filter((e) => {
      if (!e.date) return false;
      const d = parseEventDate(e.date);
      return d && d >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
    })
    .sort((a, b) => {
      const da = parseEventDate(a.date!)!;
      const db = parseEventDate(b.date!)!;
      return da.getTime() - db.getTime();
    })
    .slice(0, 5);

  if (upcoming.length === 0) {
    return (
      <div
        className="text-xs text-center py-3"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        No upcoming events.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {upcoming.map((e) => {
        const eventDate = parseEventDate(e.date!)!;
        const countdown = getCountdown(eventDate);
        const isThisWeek = (eventDate.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000;

        return (
          <div
            key={e.id}
            className="flex items-center gap-2 py-1.5 px-2 rounded transition-all duration-150"
            style={{
              background: isThisWeek ? "rgba(33,150,243,0.06)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${isThisWeek ? "rgba(33,150,243,0.15)" : "rgba(255,255,255,0.04)"}`,
            }}
          >
            <Clock
              size={11}
              style={{
                color: isThisWeek ? "#2196F3" : "rgba(255,255,255,0.3)",
                filter: isThisWeek ? "drop-shadow(0 0 4px #2196F3)" : "none",
              }}
            />
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium truncate"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {e.title}
              </p>
              <p
                className="text-[10px] font-mono"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {e.date}
              </p>
            </div>
            <span
              className="text-[10px] font-mono font-semibold shrink-0 px-1.5 py-0.5 rounded"
              style={{
                color: isThisWeek ? "#2196F3" : "rgba(255,255,255,0.5)",
                background: isThisWeek ? "rgba(33,150,243,0.1)" : "transparent",
              }}
            >
              {countdown}
            </span>
          </div>
        );
      })}
    </div>
  );
}
