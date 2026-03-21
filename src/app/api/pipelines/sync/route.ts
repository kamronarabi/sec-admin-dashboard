import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { execFile } from "child_process";
import path from "path";

interface MemberRow {
  id: number;
  email: string;
  name: string;
  events_attended: number;
  role: string;
  status: string;
}

interface EventRow {
  id: number;
  title: string;
  date: string | null;
  type: string;
  location: string | null;
  attendance_count: number;
}

interface AttendanceRow {
  id: number;
  member_id: number;
  event_id: number;
}

function snapshotTables(db: ReturnType<typeof getDb>) {
  const members = db.prepare("SELECT * FROM members").all() as MemberRow[];
  const events = db.prepare("SELECT * FROM events").all() as EventRow[];
  const attendance = db.prepare("SELECT * FROM attendance").all() as AttendanceRow[];
  return { members, events, attendance };
}

function computeDiff(
  before: ReturnType<typeof snapshotTables>,
  after: ReturnType<typeof snapshotTables>
) {
  const beforeEmails = new Set(before.members.map((m) => m.email));
  const afterEmails = new Set(after.members.map((m) => m.email));

  const membersAdded = after.members
    .filter((m) => !beforeEmails.has(m.email))
    .map((m) => ({ email: m.email, name: m.name }));

  const beforeMemberMap = new Map(before.members.map((m) => [m.email, m]));
  const membersUpdated: { email: string; changes: Record<string, [string, string]> }[] = [];
  for (const m of after.members) {
    const prev = beforeMemberMap.get(m.email);
    if (!prev) continue;
    const changes: Record<string, [string, string]> = {};
    if (prev.name !== m.name) changes.name = [prev.name, m.name];
    if (prev.events_attended !== m.events_attended)
      changes.events_attended = [String(prev.events_attended), String(m.events_attended)];
    if (Object.keys(changes).length > 0) {
      membersUpdated.push({ email: m.email, changes });
    }
  }

  const beforeTitles = new Set(before.events.map((e) => e.title));
  const eventsAdded = after.events
    .filter((e) => !beforeTitles.has(e.title))
    .map((e) => e.title);

  const beforeEventMap = new Map(before.events.map((e) => [e.title, e]));
  const eventsUpdated: string[] = [];
  for (const e of after.events) {
    const prev = beforeEventMap.get(e.title);
    if (!prev) continue;
    if (
      prev.date !== e.date ||
      prev.type !== e.type ||
      prev.location !== e.location ||
      prev.attendance_count !== e.attendance_count
    ) {
      eventsUpdated.push(e.title);
    }
  }

  const attendanceAdded = after.attendance.length - before.attendance.length;

  return {
    members_added: membersAdded,
    members_updated: membersUpdated,
    events_added: eventsAdded,
    events_updated: eventsUpdated,
    attendance_added: attendanceAdded,
    summary: {
      before: {
        members: before.members.length,
        events: before.events.length,
        attendance: before.attendance.length,
      },
      after: {
        members: after.members.length,
        events: after.events.length,
        attendance: after.attendance.length,
      },
    },
  };
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const pipelineDir = path.join(process.cwd(), "pipeline");
  const scriptPath = path.join(pipelineDir, "sync_sheets.py");
  const pythonPath = path.join(pipelineDir, ".venv", "bin", "python3");

  // 1. Snapshot current state before sync
  const beforeSnapshot = snapshotTables(db);

  try {
    console.log("[sync] Running pipeline:", pythonPath, scriptPath);
    const result = await new Promise<{ stdout: string; stderr: string }>(
      (resolve, reject) => {
        execFile(
          pythonPath,
          [scriptPath],
          {
            cwd: path.join(process.cwd(), "pipeline"),
            timeout: 60_000,
            env: {
              ...process.env,
              DATABASE_PATH: path.resolve(process.env.DATABASE_PATH || "./data/sec-dashboard.db"),
            },
          },
          (error, stdout, stderr) => {
            if (error) {
              console.error("[sync] Script error:", error.message, stderr);
              reject({ error, stdout, stderr });
            } else {
              console.log("[sync] Script output:", stdout.trim());
              resolve({ stdout, stderr });
            }
          }
        );
      }
    );

    // 2. Read the sync_log entry that Python created
    const latest = db
      .prepare(
        `SELECT * FROM sync_logs WHERE source = 'google_sheets' ORDER BY started_at DESC LIMIT 1`
      )
      .get() as (Record<string, unknown> & { id: number }) | undefined;

    if (latest) {
      // 3. Store pre-sync snapshots for rollback
      const insertSnapshot = db.prepare(
        `INSERT INTO sync_snapshots (sync_log_id, table_name, data) VALUES (?, ?, ?)`
      );
      const saveSnapshots = db.transaction(() => {
        insertSnapshot.run(latest.id, "members", JSON.stringify(beforeSnapshot.members));
        insertSnapshot.run(latest.id, "events", JSON.stringify(beforeSnapshot.events));
        insertSnapshot.run(latest.id, "attendance", JSON.stringify(beforeSnapshot.attendance));
      });
      saveSnapshots();

      // 4. Compute diff
      const afterSnapshot = snapshotTables(db);
      const diff = computeDiff(beforeSnapshot, afterSnapshot);

      // 5. Store diff on the sync_log
      db.prepare("UPDATE sync_logs SET diff_json = ? WHERE id = ?").run(
        JSON.stringify(diff),
        latest.id
      );

      return NextResponse.json({
        success: true,
        output: result.stdout.trim(),
        latest: { ...latest, diff_json: JSON.stringify(diff) },
        diff,
      });
    }

    return NextResponse.json({
      success: true,
      output: result.stdout.trim(),
      latest: latest || null,
    });
  } catch (err: unknown) {
    // Even on failure, try to store snapshot + diff if a sync_log was created
    const failedLatest = db
      .prepare(
        `SELECT * FROM sync_logs WHERE source = 'google_sheets' ORDER BY started_at DESC LIMIT 1`
      )
      .get() as (Record<string, unknown> & { id: number }) | undefined;

    if (failedLatest) {
      try {
        const insertSnapshot = db.prepare(
          `INSERT INTO sync_snapshots (sync_log_id, table_name, data) VALUES (?, ?, ?)`
        );
        const saveSnapshots = db.transaction(() => {
          insertSnapshot.run(failedLatest.id, "members", JSON.stringify(beforeSnapshot.members));
          insertSnapshot.run(failedLatest.id, "events", JSON.stringify(beforeSnapshot.events));
          insertSnapshot.run(failedLatest.id, "attendance", JSON.stringify(beforeSnapshot.attendance));
        });
        saveSnapshots();
      } catch {
        // Don't fail the response if snapshot storage fails
      }
    }

    const execErr = err as {
      error?: Error;
      stdout?: string;
      stderr?: string;
    };
    return NextResponse.json(
      {
        success: false,
        error: execErr.error?.message || "Sync script failed",
        output: execErr.stdout?.trim() || "",
        stderr: execErr.stderr?.trim() || "",
      },
      { status: 500 }
    );
  }
}
