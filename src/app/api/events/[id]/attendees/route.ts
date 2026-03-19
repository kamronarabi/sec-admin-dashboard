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

  const attendees = db
    .prepare(
      `SELECT m.name, m.email, a.checked_in_at
       FROM attendance a
       JOIN members m ON m.id = a.member_id
       WHERE a.event_id = ?
       ORDER BY m.name`
    )
    .all(id);

  return NextResponse.json(attendees);
}
