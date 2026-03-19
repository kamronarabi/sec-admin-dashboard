import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();

  const attendance = db
    .prepare(
      `SELECT e.title, e.date, e.type, a.checked_in_at
       FROM attendance a
       JOIN events e ON e.id = a.event_id
       WHERE a.member_id = ?
       ORDER BY e.date DESC`
    )
    .all(id);

  return NextResponse.json(attendance);
}
