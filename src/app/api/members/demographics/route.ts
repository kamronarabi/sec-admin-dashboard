import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

interface CountRow {
  label: string;
  count: number;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();

  const heardAbout = db.prepare(
    `SELECT heard_about as label, COUNT(*) as count FROM members
     WHERE heard_about IS NOT NULL AND heard_about != ''
     GROUP BY heard_about ORDER BY count DESC`
  ).all() as CountRow[];

  const majors = db.prepare(
    `SELECT major as label, COUNT(*) as count FROM members
     WHERE major IS NOT NULL AND major != ''
     GROUP BY major ORDER BY count DESC`
  ).all() as CountRow[];

  const years = db.prepare(
    `SELECT year as label, COUNT(*) as count FROM members
     WHERE year IS NOT NULL AND year != ''
     GROUP BY year ORDER BY count DESC`
  ).all() as CountRow[];

  // Interests are comma-separated — split and count each individually
  const rawInterests = db.prepare(
    `SELECT interests FROM members WHERE interests IS NOT NULL AND interests != ''`
  ).all() as { interests: string }[];

  const interestCounts: Record<string, number> = {};
  for (const row of rawInterests) {
    for (const interest of row.interests.split(",")) {
      const trimmed = interest.trim();
      if (trimmed) {
        interestCounts[trimmed] = (interestCounts[trimmed] || 0) + 1;
      }
    }
  }

  const interests: CountRow[] = Object.entries(interestCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ heardAbout, majors, years, interests });
}
