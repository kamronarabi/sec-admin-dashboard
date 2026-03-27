import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const members = db
    .prepare(
      `SELECT id, email, name FROM members WHERE mailing_list = 1 AND status = 'active'`
    )
    .all();

  return NextResponse.json(members);
}
