"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface CountRow {
  label: string;
  count: number;
}

interface DemographicsData {
  heardAbout: CountRow[];
  majors: CountRow[];
  years: CountRow[];
  interests: CountRow[];
}

const BAR_COLORS = [
  "#2196F3",
  "#1E88E5",
  "#1976D2",
  "#1565C0",
  "#0D47A1",
  "#42A5F5",
  "#64B5F6",
  "#90CAF9",
  "#BBDEFB",
  "#E3F2FD",
  "#0277BD",
  "#0288D1",
  "#039BE5",
  "#03A9F4",
  "#29B6F6",
];

function ChartPanel({
  title,
  data,
}: {
  title: string;
  data: CountRow[];
}) {
  if (data.length === 0) {
    return (
      <div
        className="relative rounded-lg overflow-hidden h-full"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="p-3 h-full flex flex-col">
          <h3
            className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {title}
          </h3>
          <div
            className="flex-1 flex items-center justify-center text-xs"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            No data yet
          </div>
        </div>
      </div>
    );
  }

  // Truncate labels for display
  const chartData = data.map((d) => ({
    ...d,
    shortLabel: d.label.length > 14 ? d.label.slice(0, 12) + "..." : d.label,
  }));

  return (
    <div
      className="relative rounded-lg overflow-hidden h-full"
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
      {/* Top edge glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 10%, rgba(33,150,243,0.25) 50%, transparent 90%)",
        }}
      />
      <div className="p-3 h-full flex flex-col">
        <h3
          className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2 shrink-0"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {title}
        </h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 12, bottom: 4, left: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 9, fill: "rgba(255,255,255,0.35)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="shortLabel"
                tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip
                cursor={{ fill: "rgba(33,150,243,0.06)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const { label, count } = payload[0].payload;
                  return (
                    <div
                      style={{
                        background: "rgba(15, 15, 26, 0.95)",
                        border: "1px solid rgba(33,150,243,0.3)",
                        borderRadius: "6px",
                        fontSize: "11px",
                        padding: "6px 10px",
                        boxShadow: "0 0 20px rgba(33,150,243,0.15)",
                        color: "rgba(255,255,255,0.8)",
                      }}
                    >
                      <span style={{ color: "#2196F3" }}>{label}</span>
                      {" — "}
                      <span style={{ fontWeight: 600 }}>{count}</span>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={18}>
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                    style={{
                      filter: `drop-shadow(0 0 4px ${BAR_COLORS[index % BAR_COLORS.length]}55)`,
                    }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function DemographicsCharts() {
  const [data, setData] = useState<DemographicsData | null>(null);

  useEffect(() => {
    fetch("/api/members/demographics")
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div
        className="grid grid-cols-2 gap-3"
        style={{ height: "420px" }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg animate-pulse"
            style={{ background: "rgba(255,255,255,0.03)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3" style={{ height: "420px" }}>
      <ChartPanel title="How Did You Hear About Us?" data={data.heardAbout} />
      <ChartPanel title="Major" data={data.majors} />
      <ChartPanel title="Year" data={data.years} />
      <ChartPanel title="Topic Interests" data={data.interests} />
    </div>
  );
}
