"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Event } from "@/lib/types";

interface Attendee {
  name: string;
  email: string;
  checked_in_at: string;
}

export function EventsWidget() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  const viewEvent = async (event: Event) => {
    setSelectedEvent(event);
    setAttendeesLoading(true);
    const res = await fetch(`/api/events/${event.id}/attendees`);
    if (res.ok) setAttendees(await res.json());
    setAttendeesLoading(false);
  };

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data: Event[]) => {
        // Parse "Day, M/D/YY" into comparable parts
        const parseDate = (d: string) => {
          const match = d.match(/(\d+)\/(\d+)\/(\d+)$/);
          if (!match) return null;
          const [, month, day, year] = match.map(Number);
          return { year, month, day };
        };

        // Sort by month, then day (earliest first)
        data.sort((a, b) => {
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          const da = parseDate(a.date);
          const db = parseDate(b.date);
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          if (da.month !== db.month) return da.month - db.month;
          return da.day - db.day;
        });
        setEvents(data);
      })
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
              events.map((e) => {
                const now = new Date();
                const isFuture = (() => {
                  if (!e.date) return false;
                  const match = e.date.match(/(\d+)\/(\d+)\/(\d+)$/);
                  if (!match) return false;
                  const [, month, day, year] = match.map(Number);
                  const eventDate = new Date(2000 + year, month - 1, day);
                  return eventDate > now;
                })();
                const opacity = isFuture ? 0.35 : 1;
                return (
                  <tr
                    key={e.id}
                    className="cursor-pointer transition-colors duration-150"
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      opacity,
                    }}
                    onClick={() => viewEvent(e)}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Event detail dialog */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent
          className="max-w-lg"
          style={{
            background:
              "linear-gradient(135deg, #16213e 0%, #0f0f1a 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 0 60px rgba(33,150,243,0.1), 0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "rgba(255,255,255,0.9)" }}>
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Date</span>
                <span
                  className="font-mono text-xs"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {selectedEvent.date || "—"}
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Type</span>
                <span>
                  <span
                    className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      color: "rgba(33,150,243,0.8)",
                      background: "rgba(33,150,243,0.1)",
                      border: "1px solid rgba(33,150,243,0.15)",
                    }}
                  >
                    {selectedEvent.type}
                  </span>
                </span>
                {selectedEvent.location && (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>Location</span>
                    <span style={{ color: "rgba(255,255,255,0.8)" }}>
                      {selectedEvent.location}
                    </span>
                  </>
                )}
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Attendance</span>
                <span
                  className="font-mono"
                  style={{ color: "rgba(33,150,243,0.8)" }}
                >
                  {selectedEvent.attendance_count}
                </span>
              </div>
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  paddingTop: "12px",
                }}
              >
                <h4
                  className="font-semibold mb-2 text-sm"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Attendees
                </h4>
                {attendeesLoading ? (
                  <p
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    Loading...
                  </p>
                ) : attendees.length === 0 ? (
                  <p
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    No attendees recorded.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-auto">
                    {attendees.map((a, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-xs py-1"
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <span style={{ color: "rgba(255,255,255,0.7)" }}>
                          {a.name}
                        </span>
                        <span
                          className="font-mono"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          {a.email}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
