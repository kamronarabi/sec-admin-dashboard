"use client";

import { useEffect, useState } from "react";
import { MapPin, Users, Tag } from "lucide-react";
import { EventNotes } from "./event-notes";
import type { Event } from "@/lib/types";

interface Attendee {
  name: string;
  email: string;
  checked_in_at: string;
}

interface EventDetailPanelProps {
  event: Event;
}

export function EventDetailPanel({ event }: EventDetailPanelProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/events/${event.id}/attendees`)
      .then((r) => r.json())
      .then((data) => setAttendees(data))
      .finally(() => setLoading(false));
  }, [event.id]);

  return (
    <div className="h-full flex flex-col gap-3 overflow-auto">
      {/* Header */}
      <div>
        <h2
          className="text-sm font-semibold"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          {event.title}
        </h2>
        <p
          className="text-[11px] font-mono mt-0.5"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {event.date || "No date"}
        </p>
      </div>

      {/* Metadata badges */}
      <div className="flex flex-wrap gap-2">
        {event.type && (
          <span
            className="flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
            style={{
              color: "rgba(33,150,243,0.8)",
              background: "rgba(33,150,243,0.1)",
              border: "1px solid rgba(33,150,243,0.15)",
            }}
          >
            <Tag size={9} />
            {event.type}
          </span>
        )}
        {event.location && (
          <span
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded"
            style={{
              color: "rgba(255,255,255,0.5)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <MapPin size={9} />
            {event.location}
          </span>
        )}
        <span
          className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded"
          style={{
            color: "rgba(33,150,243,0.8)",
            background: "rgba(33,150,243,0.06)",
            border: "1px solid rgba(33,150,243,0.1)",
          }}
        >
          <Users size={9} />
          {event.attendance_count} attended
        </span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

      {/* Attendees */}
      <div>
        <h3
          className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Attendees
        </h3>
        {loading ? (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            Loading...
          </p>
        ) : attendees.length === 0 ? (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            No attendees recorded.
          </p>
        ) : (
          <div className="space-y-0.5 max-h-40 overflow-auto">
            {attendees.map((a, i) => (
              <div
                key={i}
                className="flex justify-between text-xs py-1 px-1 rounded"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
              >
                <span style={{ color: "rgba(255,255,255,0.7)" }}>{a.name}</span>
                <span
                  className="font-mono text-[10px]"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {a.email}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

      {/* Notes */}
      <div>
        <h3
          className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Admin Notes
        </h3>
        <EventNotes eventId={event.id} />
      </div>
    </div>
  );
}
