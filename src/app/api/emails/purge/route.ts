import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { olderThanDays } = await req.json();

  if (typeof olderThanDays !== "number" || olderThanDays < 1) {
    return NextResponse.json({ error: "Invalid olderThanDays" }, { status: 400 });
  }

  const db = getDb();

  const cutoff = new Date(Date.now() - olderThanDays * 86400000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);

  const result = db
    .prepare("DELETE FROM emails WHERE received_at < ?")
    .run(cutoff);

  return NextResponse.json({
    deleted: result.changes,
    cutoff,
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();

  const total = db.prepare("SELECT COUNT(*) as cnt FROM emails").get() as { cnt: number };
  const oldest = db
    .prepare("SELECT MIN(received_at) as oldest FROM emails")
    .get() as { oldest: string | null };

  return NextResponse.json({
    totalEmails: total.cnt,
    oldestEmail: oldest.oldest,
  });
}
