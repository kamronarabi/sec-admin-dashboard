"use client";

import type { Event } from "@/lib/types";

interface EventsTableProps {
  events: Event[];
  selectedEventId: number | null;
  onSelectEvent: (event: Event) => void;
}

function parseEventDate(dateStr: string): Date | null {
  const match = dateStr.match(/(\d+)\/(\d+)\/(\d+)$/);
  if (!match) return null;
  const [, month, day, year] = match.map(Number);
  return new Date(2000 + year, month - 1, day);
}

export function EventsTable({ events, selectedEventId, onSelectEvent }: EventsTableProps) {
  const now = new Date();

  return (
    <div className="overflow-auto h-full">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {["Title", "Date", "Type", "Attended"].map((h, i) => (
              <th
                key={h}
                className={`text-[11px] font-semibold uppercase tracking-wider py-2 pr-3 ${
                  i === 3 ? "text-center w-20" : "text-left"
                } ${i === 1 ? "w-28" : ""} ${i === 2 ? "w-24" : ""}`}
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="text-center text-xs py-8"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                No events yet.
              </td>
            </tr>
          ) : (
            events.map((e) => {
              const isSelected = e.id === selectedEventId;
              const isFuture = (() => {
                if (!e.date) return false;
                const d = parseEventDate(e.date);
                return d ? d > now : false;
              })();

              return (
                <tr
                  key={e.id}
                  className="cursor-pointer transition-all duration-150"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    opacity: isFuture ? 0.45 : 1,
                    background: isSelected
                      ? "rgba(33,150,243,0.08)"
                      : "transparent",
                    borderLeft: isSelected
                      ? "2px solid #2196F3"
                      : "2px solid transparent",
                  }}
                  onClick={() => onSelectEvent(e)}
                  onMouseEnter={(ev) => {
                    if (!isSelected) ev.currentTarget.style.background = "rgba(33,150,243,0.04)";
                  }}
                  onMouseLeave={(ev) => {
                    if (!isSelected) ev.currentTarget.style.background = "transparent";
                  }}
                >
                  <td
                    className="text-xs py-2 pr-3 font-medium"
                    style={{ color: isSelected ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)" }}
                  >
                    {e.title}
                  </td>
                  <td
                    className="text-[11px] py-2 pr-3 font-mono"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {e.date || "\u2014"}
                  </td>
                  <td className="py-2 pr-3">
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
                    className="text-xs text-center py-2 font-mono"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {e.attendance_count}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
