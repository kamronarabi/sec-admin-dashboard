import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

  const db = getDb();

  let query = `SELECT * FROM sync_logs`;
  const params: (string | number)[] = [];

  if (source) {
    query += ` WHERE source = ?`;
    params.push(source);
  }

  query += ` ORDER BY started_at DESC LIMIT ?`;
  params.push(limit);

  const logs = db.prepare(query).all(...params) as Record<string, unknown>[];

  // Check which logs have snapshots (for rollback eligibility)
  const logIds = logs.map((l) => l.id as number);
  const snapshotCounts = new Map<number, number>();
  if (logIds.length > 0) {
    const placeholders = logIds.map(() => "?").join(",");
    const counts = db
      .prepare(
        `SELECT sync_log_id, COUNT(*) as cnt FROM sync_snapshots WHERE sync_log_id IN (${placeholders}) GROUP BY sync_log_id`
      )
      .all(...logIds) as { sync_log_id: number; cnt: number }[];
    for (const c of counts) {
      snapshotCounts.set(c.sync_log_id, c.cnt);
    }
  }

  const enriched = logs.map((log) => ({
    ...log,
    diff_json: log.diff_json ? JSON.parse(log.diff_json as string) : null,
    has_snapshot: (snapshotCounts.get(log.id as number) || 0) > 0,
  }));

  return NextResponse.json(enriched);
}
