import { getDb } from "@/lib/db";
import { OverviewCards } from "@/components/overview-cards";

function getStats() {
  const db = getDb();
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const totalMembers = db.prepare("SELECT COUNT(*) as count FROM members WHERE status = 'active'").get() as { count: number };
  const totalEvents = db.prepare("SELECT COUNT(*) as count FROM events").get() as { count: number };
  const eventsThisMonth = db.prepare("SELECT COUNT(*) as count FROM events WHERE date >= ?").get(monthStart) as { count: number };
  const newMembersThisMonth = db.prepare("SELECT COUNT(*) as count FROM members WHERE join_date >= ?").get(monthStart) as { count: number };
  const avgAttendance = db.prepare("SELECT COALESCE(AVG(attendance_count), 0) as avg FROM events WHERE attendance_count > 0").get() as { avg: number };

  return {
    totalMembers: totalMembers.count,
    totalEvents: totalEvents.count,
    eventsThisMonth: eventsThisMonth.count,
    newMembersThisMonth: newMembersThisMonth.count,
    avgAttendance: Math.round(avgAttendance.avg),
  };
}

export default function OverviewPage() {
  const stats = getStats();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      <OverviewCards stats={stats} />
    </div>
  );
}
