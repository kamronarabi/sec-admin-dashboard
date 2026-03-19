import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const url = new URL(req.url);
  const search = url.searchParams.get("search") || "";
  const role = url.searchParams.get("role") || "";
  const status = url.searchParams.get("status") || "";
  const sortBy = url.searchParams.get("sortBy") || "name";
  const sortDir = url.searchParams.get("sortDir") === "desc" ? "DESC" : "ASC";

  const allowedSorts = ["name", "email", "events_attended", "role", "join_date", "last_active", "status"];
  const sortColumn = allowedSorts.includes(sortBy) ? sortBy : "name";

  let query = "SELECT * FROM members WHERE 1=1";
  const params: string[] = [];

  if (search) {
    query += " AND (name LIKE ? OR email LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  if (role) {
    query += " AND role = ?";
    params.push(role);
  }
  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  query += ` ORDER BY ${sortColumn} ${sortDir}`;

  const members = db.prepare(query).all(...params);
  return NextResponse.json(members);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...fields } = body;

  if (!id) return NextResponse.json({ error: "Missing member id" }, { status: 400 });

  const db = getDb();
  const allowedFields = ["name", "email", "role", "status", "discord_username", "github_username"];
  const updates: string[] = [];
  const values: (string | number)[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (allowedFields.includes(key)) {
      updates.push(`${key} = ?`);
      values.push(value as string | number);
    }
  }

  if (updates.length === 0) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  updates.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE members SET ${updates.join(", ")} WHERE id = ?`).run(...values);

  const updated = db.prepare("SELECT * FROM members WHERE id = ?").get(id);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = getDb();
  db.prepare("DELETE FROM members WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
