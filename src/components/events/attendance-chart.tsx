"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { Event } from "@/lib/types";

interface AttendanceChartProps {
  events: Event[];
}

export function AttendanceChart({ events }: AttendanceChartProps) {
  // Only show past events with attendance data, sorted chronologically
  const chartData = events
    .filter((e) => e.attendance_count > 0)
    .map((e) => ({
      name: e.title.length > 20 ? e.title.slice(0, 18) + "..." : e.title,
      fullTitle: e.title,
      attendance: e.attendance_count,
      date: e.date || "",
    }));

  if (chartData.length === 0) {
    return (
      <div
        className="h-full flex items-center justify-center text-xs"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        No attendance data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
          axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
          tickLine={false}
          angle={-30}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
          axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
          tickLine={false}
          width={30}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(15, 15, 26, 0.95)",
            border: "1px solid rgba(33,150,243,0.3)",
            borderRadius: "6px",
            fontSize: "12px",
            color: "rgba(255,255,255,0.8)",
            boxShadow: "0 0 20px rgba(33,150,243,0.15)",
          }}
          labelFormatter={(_, payload) =>
            payload?.[0]?.payload?.fullTitle || ""
          }
          formatter={(value) => [`${value} attended`, "Attendance"]}
        />
        <Line
          type="monotone"
          dataKey="attendance"
          stroke="#2196F3"
          strokeWidth={2}
          dot={{ fill: "#2196F3", strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: "#2196F3", stroke: "rgba(33,150,243,0.4)", strokeWidth: 3 }}
          style={{ filter: "drop-shadow(0 0 6px rgba(33,150,243,0.4))" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
