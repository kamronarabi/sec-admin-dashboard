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
  const note = db
    .prepare("SELECT * FROM event_notes WHERE event_id = ?")
    .get(id);

  return NextResponse.json(note || { went_well: "", went_wrong: "" });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { went_well, went_wrong } = await req.json();
  const db = getDb();

  db.prepare(`
    INSERT INTO event_notes (event_id, went_well, went_wrong, admin_email)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(event_id) DO UPDATE SET
      went_well = excluded.went_well,
      went_wrong = excluded.went_wrong,
      updated_at = datetime('now')
  `).run(id, went_well || null, went_wrong || null, session.user?.email || "unknown");

  return NextResponse.json({ success: true });
}
