import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const sources = ["google_sheets", "github", "gmail"];

  const analytics: Record<string, unknown> = {};

  for (const source of sources) {
    const totalSyncs = db
      .prepare("SELECT COUNT(*) as cnt FROM sync_logs WHERE source = ?")
      .get(source) as { cnt: number };

    const successCount = db
      .prepare("SELECT COUNT(*) as cnt FROM sync_logs WHERE source = ? AND status = 'success'")
      .get(source) as { cnt: number };

    const avgDuration = db
      .prepare("SELECT AVG(duration_ms) as avg FROM sync_logs WHERE source = ? AND status = 'success'")
      .get(source) as { avg: number | null };

    const totalRecords = db
      .prepare("SELECT SUM(records_processed) as total FROM sync_logs WHERE source = ?")
      .get(source) as { total: number | null };

    const recent = db
      .prepare(
        `SELECT id, status, records_processed, records_created, records_updated, duration_ms, started_at, completed_at
         FROM sync_logs WHERE source = ? ORDER BY started_at DESC LIMIT 20`
      )
      .all(source) as Record<string, unknown>[];

    analytics[source] = {
      total_syncs: totalSyncs.cnt,
      success_count: successCount.cnt,
      success_rate: totalSyncs.cnt > 0 ? Math.round((successCount.cnt / totalSyncs.cnt) * 1000) / 10 : 0,
      avg_duration_ms: avgDuration.avg ? Math.round(avgDuration.avg) : 0,
      total_records_synced: totalRecords.total || 0,
      recent,
    };
  }

  return NextResponse.json(analytics);
}
