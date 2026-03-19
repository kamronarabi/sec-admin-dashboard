import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const sources = ["google_sheets", "discord", "github"];

  const pipelines = sources.map((source) => {
    const latest = db
      .prepare(
        `SELECT * FROM sync_logs WHERE source = ? ORDER BY started_at DESC LIMIT 1`
      )
      .get(source) as Record<string, unknown> | undefined;

    const lastSuccess = db
      .prepare(
        `SELECT completed_at FROM sync_logs WHERE source = ? AND status = 'success' ORDER BY completed_at DESC LIMIT 1`
      )
      .get(source) as { completed_at: string } | undefined;

    return {
      source,
      latest: latest || null,
      lastSuccessAt: lastSuccess?.completed_at || null,
    };
  });

  return NextResponse.json(pipelines);
}
