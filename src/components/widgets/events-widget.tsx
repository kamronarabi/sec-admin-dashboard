"use client";

import { useEffect, useState } from "react";
import type { Event } from "@/lib/types";

export function EventsWidget() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

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
          Events
        </h3>
        <span
          className="text-[10px] font-mono ml-auto"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          {events.length} total
        </span>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full">
          <thead>
            <tr
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <th
                className="text-left text-[10px] font-semibold uppercase tracking-wider py-1.5 pr-3"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Title
              </th>
              <th
                className="text-left text-[10px] font-semibold uppercase tracking-wider py-1.5 pr-3 w-24"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Date
              </th>
              <th
                className="text-left text-[10px] font-semibold uppercase tracking-wider py-1.5 pr-3 w-20"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Type
              </th>
              <th
                className="text-center text-[10px] font-semibold uppercase tracking-wider py-1.5 w-16"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Attended
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-[10px] py-6"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Loading...
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-[10px] py-6"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  No events yet.
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr
                  key={e.id}
                  className="transition-colors duration-150"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  onMouseEnter={(ev) => {
                    ev.currentTarget.style.background = "rgba(33,150,243,0.04)";
                  }}
                  onMouseLeave={(ev) => {
                    ev.currentTarget.style.background = "transparent";
                  }}
                >
                  <td
                    className="text-xs py-1.5 pr-3 font-medium"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {e.title}
                  </td>
                  <td
                    className="text-[11px] py-1.5 pr-3 font-mono"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {e.date || "—"}
                  </td>
                  <td className="py-1.5 pr-3">
                    <span
                      className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{
                        color: "rgba(33,150,243,0.7)",
                        background: "rgba(33,150,243,0.08)",
                        border: "1px solid rgba(33,150,243,0.12)",
                      }}
                    >
                      {e.type}
                    </span>
                  </td>
                  <td
                    className="text-xs text-center py-1.5 font-mono"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {e.attendance_count}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
