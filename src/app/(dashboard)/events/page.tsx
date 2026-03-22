"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, TrendingUp, Clock } from "lucide-react";
import { EventsTable } from "@/components/events/events-table";
import { EventDetailPanel } from "@/components/events/event-detail-panel";
import { AttendanceChart } from "@/components/events/attendance-chart";
import { UpcomingEvents } from "@/components/events/upcoming-events";
import type { Event } from "@/lib/types";

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
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow:
          "0 0 30px rgba(33,150,243,0.03), 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 10%, rgba(33,150,243,0.25) 50%, transparent 90%)",
        }}
      />
      <div className="p-3 h-full">{children}</div>
    </div>
  );
}

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon size={11} color="#2196F3" style={{ filter: "drop-shadow(0 0 4px #2196F3)" }} />
      <h3
        className="text-[10px] font-semibold uppercase tracking-[0.15em]"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {label}
      </h3>
    </div>
  );
}

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data: Event[]) => {
        // Sort chronologically using M/D/YY date format
        const parseDate = (d: string) => {
          const match = d.match(/(\d+)\/(\d+)\/(\d+)$/);
          if (!match) return null;
          const [, month, day, year] = match.map(Number);
          return new Date(2000 + year, month - 1, day);
        };
        data.sort((a, b) => {
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          const da = parseDate(a.date);
          const db = parseDate(b.date);
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          return da.getTime() - db.getTime();
        });
        setEvents(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Page header */}
      <div className="flex items-center gap-3 shrink-0">
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
        <Calendar size={16} color="#2196F3" style={{ filter: "drop-shadow(0 0 6px #2196F3)" }} />
        <h1
          className="text-sm font-semibold uppercase tracking-[0.12em]"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Events
        </h1>
        <span
          className="text-[10px] font-mono ml-auto"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          {events.length} total
        </span>
      </div>

      {/* Top row: Chart + Upcoming */}
      <div className="grid grid-cols-[1fr_240px] gap-3 shrink-0" style={{ height: "200px" }}>
        <GlassPanel>
          <SectionHeader icon={TrendingUp} label="Attendance Trend" />
          <div style={{ height: "calc(100% - 24px)" }}>
            {loading ? (
              <div
                className="h-full flex items-center justify-center text-xs"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Loading...
              </div>
            ) : (
              <AttendanceChart events={events} />
            )}
          </div>
        </GlassPanel>

        <GlassPanel>
          <SectionHeader icon={Clock} label="Upcoming" />
          {loading ? (
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              Loading...
            </p>
          ) : (
            <UpcomingEvents events={events} />
          )}
        </GlassPanel>
      </div>

      {/* Bottom row: Events Table + Detail Panel */}
      <div className="flex-1 grid grid-cols-[1fr_360px] gap-3 min-h-0">
        <GlassPanel>
          <SectionHeader icon={Calendar} label="All Events" />
          <div style={{ height: "calc(100% - 24px)" }}>
            {loading ? (
              <div
                className="h-full flex items-center justify-center text-xs"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Loading...
              </div>
            ) : (
              <EventsTable
                events={events}
                selectedEventId={selectedEvent?.id ?? null}
                onSelectEvent={setSelectedEvent}
              />
            )}
          </div>
        </GlassPanel>

        <GlassPanel>
          {selectedEvent ? (
            <EventDetailPanel event={selectedEvent} />
          ) : (
            <div
              className="h-full flex flex-col items-center justify-center gap-2"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              <Calendar size={24} style={{ opacity: 0.3 }} />
              <p className="text-xs">Select an event to view details</p>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
