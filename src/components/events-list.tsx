"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/types";

interface Attendee {
  name: string;
  email: string;
  checked_in_at: string;
}

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (eventId: number) => {
    if (expandedId === eventId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(eventId);
    const res = await fetch(`/api/events/${eventId}/attendees`);
    if (res.ok) setAttendees(await res.json());
  };

  if (loading) return <p className="text-muted-foreground">Loading events...</p>;

  if (events.length === 0) {
    return (
      <p className="text-muted-foreground">
        No events yet. Data will appear after the first pipeline sync.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card
          key={event.id}
          className="cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => toggleExpand(event.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{event.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{event.type}</Badge>
                <span className="text-sm text-muted-foreground">
                  {event.attendance_count} attended
                </span>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              {event.date && <span>{event.date}</span>}
              {event.location && <span>{event.location}</span>}
            </div>
          </CardHeader>
          {expandedId === event.id && (
            <CardContent>
              <h4 className="text-sm font-semibold mb-2">Attendees</h4>
              {attendees.length === 0 ? (
                <p className="text-sm text-muted-foreground">No attendance records.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {attendees.map((a, i) => (
                    <div key={i} className="text-sm py-1">
                      <span>{a.name}</span>
                      <span className="text-muted-foreground ml-2">{a.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
