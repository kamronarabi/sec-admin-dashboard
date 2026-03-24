import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { sync_log_id } = body as { sync_log_id: number };

  if (!sync_log_id) {
    return NextResponse.json({ error: "sync_log_id is required" }, { status: 400 });
  }

  const db = getDb();

  // Validate the sync log exists and was successful
  const syncLog = db
    .prepare("SELECT * FROM sync_logs WHERE id = ?")
    .get(sync_log_id) as { id: number; source: string; status: string } | undefined;

  if (!syncLog) {
    return NextResponse.json({ error: "Sync log not found" }, { status: 404 });
  }

  if (syncLog.status !== "success") {
    return NextResponse.json({ error: "Can only rollback successful syncs" }, { status: 400 });
  }

  // Check snapshots exist
  const snapshots = db
    .prepare("SELECT table_name, data FROM sync_snapshots WHERE sync_log_id = ?")
    .all(sync_log_id) as { table_name: string; data: string }[];

  if (snapshots.length === 0) {
    return NextResponse.json({ error: "No snapshots found for this sync" }, { status: 404 });
  }

  const snapshotMap = new Map(snapshots.map((s) => [s.table_name, s.data]));

  try {
    const rollback = db.transaction(() => {
      // Delete in FK-safe order
      db.exec("DELETE FROM attendance");
      db.exec("DELETE FROM events");
      db.exec("DELETE FROM members");

      // Restore members
      const membersData = JSON.parse(snapshotMap.get("members") || "[]");
      const insertMember = db.prepare(
        `INSERT INTO members (id, email, name, discord_id, discord_username, github_username, role, events_attended, join_date, last_active, status, heard_about, major, year, interests, created_at, updated_at)
         VALUES (@id, @email, @name, @discord_id, @discord_username, @github_username, @role, @events_attended, @join_date, @last_active, @status, @heard_about, @major, @year, @interests, @created_at, @updated_at)`
      );
      for (const m of membersData) {
        insertMember.run(m);
      }

      // Restore events
      const eventsData = JSON.parse(snapshotMap.get("events") || "[]");
      const insertEvent = db.prepare(
        `INSERT INTO events (id, title, date, type, location, attendance_count, source_sheet, created_at, updated_at)
         VALUES (@id, @title, @date, @type, @location, @attendance_count, @source_sheet, @created_at, @updated_at)`
      );
      for (const e of eventsData) {
        insertEvent.run(e);
      }

      // Restore attendance
      const attendanceData = JSON.parse(snapshotMap.get("attendance") || "[]");
      const insertAttendance = db.prepare(
        `INSERT INTO attendance (id, member_id, event_id, checked_in_at)
         VALUES (@id, @member_id, @event_id, @checked_in_at)`
      );
      for (const a of attendanceData) {
        insertAttendance.run(a);
      }

      // Log the rollback as a sync event
      db.prepare(
        `INSERT INTO sync_logs (source, status, records_processed, records_created, records_updated, duration_ms, error_message, completed_at)
         VALUES ('rollback', 'success', 0, 0, 0, 0, ?, datetime('now'))`
      ).run(`Rolled back sync #${sync_log_id}`);
    });

    rollback();

    // Audit log
    db.prepare(
      `INSERT INTO admin_audit_log (action, entity_type, entity_id, details, admin_email)
       VALUES (?, ?, ?, ?, ?)`
    ).run(
      "rollback_sync",
      "sync_logs",
      sync_log_id,
      JSON.stringify({
        rolled_back_sync_id: sync_log_id,
        members_restored: JSON.parse(snapshotMap.get("members") || "[]").length,
        events_restored: JSON.parse(snapshotMap.get("events") || "[]").length,
        attendance_restored: JSON.parse(snapshotMap.get("attendance") || "[]").length,
      }),
      session.user?.email || "unknown"
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Rollback failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
