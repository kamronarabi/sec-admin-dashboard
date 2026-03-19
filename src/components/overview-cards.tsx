"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalMembers: number;
  totalEvents: number;
  eventsThisMonth: number;
  newMembersThisMonth: number;
  avgAttendance: number;
}

export function OverviewCards({ stats }: { stats: Stats }) {
  const cards = [
    { title: "Active Members", value: stats.totalMembers },
    { title: "Total Events", value: stats.totalEvents },
    { title: "Events This Month", value: stats.eventsThisMonth },
    { title: "New Members This Month", value: stats.newMembersThisMonth },
    { title: "Avg Attendance", value: stats.avgAttendance },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
