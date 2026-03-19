import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const items = db
    .prepare("SELECT * FROM action_items ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'done' THEN 1 ELSE 2 END, created_at DESC")
    .all();

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, due_date } = await req.json();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const db = getDb();
  const result = db
    .prepare("INSERT INTO action_items (title, description, due_date) VALUES (?, ?, ?)")
    .run(title, description || null, due_date || null);

  const item = db.prepare("SELECT * FROM action_items WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const db = getDb();
  db.prepare("UPDATE action_items SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);

  const item = db.prepare("SELECT * FROM action_items WHERE id = ?").get(id);
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = getDb();
  db.prepare("DELETE FROM action_items WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
