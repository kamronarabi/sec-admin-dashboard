#!/usr/bin/env python3
"""
Google Sheets → SQLite pipeline.

Reads a Google Sheets workbook where:
  - The first sheet ("Events") lists event metadata (title per row).
  - Each subsequent sheet is an event's attendance form responses (Name, Email columns).

Creates/updates events, auto-creates members on first email sight,
records attendance, and logs the sync run.
"""

import sqlite3
import time
import traceback
from datetime import datetime, timezone

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

from config import DATABASE_PATH, EVENTS_SHEET_NAME, SERVICE_ACCOUNT_FILE, SPREADSHEET_ID

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]


def get_sheets_service():
    creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build("sheets", "v4", credentials=creds)


def get_db():
    import os
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.row_factory = sqlite3.Row
    from init_db import init_schema
    init_schema(conn)
    return conn


def log_sync(db, source, status, processed, created, updated, duration_ms, error=None):
    db.execute(
        """INSERT INTO sync_logs
           (source, status, records_processed, records_created, records_updated,
            duration_ms, error_message, completed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))""",
        (source, status, processed, created, updated, duration_ms, error),
    )
    db.commit()


def sync():
    start = time.time()
    db = get_db()
    processed = 0
    created = 0
    updated = 0

    try:
        service = get_sheets_service()
        spreadsheet = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
        sheets = spreadsheet.get("sheets", [])

        if not sheets:
            log_sync(db, "google_sheets", "failed", 0, 0, 0, 0, "No sheets found")
            return

        sheet_names = [s["properties"]["title"] for s in sheets]

        # --- Read events sheet ---
        events_sheet = sheet_names[0]  # First sheet is always the events list
        events_result = (
            service.spreadsheets()
            .values()
            .get(spreadsheetId=SPREADSHEET_ID, range=f"'{events_sheet}'!A:Z")
            .execute()
        )
        events_rows = events_result.get("values", [])

        # Build event title → sheet name mapping
        # Events sheet: each row is an event. Column A = title, B = date (optional),
        # C = type (optional), D = location (optional)
        event_map = {}  # sheet_name -> event db id
        if len(events_rows) > 1:  # skip header
            for row in events_rows[1:]:
                if not row:
                    continue
                title = row[0].strip() if len(row) > 0 else ""
                date = row[1].strip() if len(row) > 1 else None
                etype = row[2].strip() if len(row) > 2 else "meeting"
                location = row[3].strip() if len(row) > 3 else None

                if not title:
                    continue

                # Upsert event
                existing = db.execute(
                    "SELECT id FROM events WHERE title = ?", (title,)
                ).fetchone()

                if existing:
                    db.execute(
                        """UPDATE events SET date=?, type=?, location=?,
                           updated_at=datetime('now') WHERE id=?""",
                        (date, etype, location, existing["id"]),
                    )
                    event_map[title] = existing["id"]
                    updated += 1
                else:
                    cursor = db.execute(
                        """INSERT INTO events (title, date, type, location, source_sheet)
                           VALUES (?, ?, ?, ?, ?)""",
                        (title, date, etype, location, title),
                    )
                    event_map[title] = cursor.lastrowid
                    created += 1
                processed += 1

        db.commit()

        # --- Process attendance sheets ---
        # Each non-events sheet that matches an event title is treated as attendance data
        for sheet_name in sheet_names[1:]:
            # Try to match sheet name to an event title
            event_id = event_map.get(sheet_name)
            if event_id is None:
                # Try case-insensitive match
                for title, eid in event_map.items():
                    if title.lower() == sheet_name.lower():
                        event_id = eid
                        break
            if event_id is None:
                # Sheet doesn't correspond to a known event, create one
                cursor = db.execute(
                    """INSERT OR IGNORE INTO events (title, source_sheet)
                       VALUES (?, ?)""",
                    (sheet_name, sheet_name),
                )
                if cursor.lastrowid:
                    event_id = cursor.lastrowid
                    created += 1
                else:
                    event_id = db.execute(
                        "SELECT id FROM events WHERE title = ?", (sheet_name,)
                    ).fetchone()["id"]
                db.commit()

            # Read attendance data
            att_result = (
                service.spreadsheets()
                .values()
                .get(spreadsheetId=SPREADSHEET_ID, range=f"'{sheet_name}'!A:Z")
                .execute()
            )
            att_rows = att_result.get("values", [])

            if len(att_rows) < 2:
                continue

            # Find Name and Email columns from header
            header = [h.strip().lower() for h in att_rows[0]]
            name_col = None
            email_col = None
            for i, h in enumerate(header):
                if "name" in h and name_col is None:
                    name_col = i
                if "email" in h or "e-mail" in h:
                    email_col = i

            if email_col is None:
                continue  # Can't process without email

            attendance_count = 0
            for row in att_rows[1:]:
                if len(row) <= email_col:
                    continue

                email = row[email_col].strip().lower()
                if not email or "@" not in email:
                    continue

                name = row[name_col].strip() if name_col is not None and len(row) > name_col else email.split("@")[0]

                # Upsert member
                existing_member = db.execute(
                    "SELECT id FROM members WHERE email = ?", (email,)
                ).fetchone()

                if existing_member:
                    member_id = existing_member["id"]
                    # Update name if it changed (sheets-managed)
                    db.execute(
                        "UPDATE members SET name=?, updated_at=datetime('now') WHERE id=?",
                        (name, member_id),
                    )
                else:
                    cursor = db.execute(
                        """INSERT INTO members (email, name, join_date, last_active)
                           VALUES (?, ?, date('now'), date('now'))""",
                        (email, name),
                    )
                    member_id = cursor.lastrowid
                    created += 1

                # Record attendance (idempotent via UNIQUE constraint)
                try:
                    db.execute(
                        "INSERT INTO attendance (member_id, event_id) VALUES (?, ?)",
                        (member_id, event_id),
                    )
                    attendance_count += 1
                except sqlite3.IntegrityError:
                    pass  # Already recorded

                processed += 1

            # Update attendance count on event
            actual_count = db.execute(
                "SELECT COUNT(*) as c FROM attendance WHERE event_id = ?", (event_id,)
            ).fetchone()["c"]
            db.execute(
                "UPDATE events SET attendance_count = ?, updated_at = datetime('now') WHERE id = ?",
                (actual_count, event_id),
            )
            db.commit()

        # --- Update member stats ---
        db.execute("""
            UPDATE members SET
                events_attended = (SELECT COUNT(*) FROM attendance WHERE member_id = members.id),
                last_active = COALESCE(
                    (SELECT MAX(e.date) FROM attendance a JOIN events e ON e.id = a.event_id WHERE a.member_id = members.id),
                    members.last_active
                ),
                updated_at = datetime('now')
        """)
        db.commit()

        duration_ms = int((time.time() - start) * 1000)
        log_sync(db, "google_sheets", "success", processed, created, updated, duration_ms)
        print(f"Sync complete: {processed} processed, {created} created, {updated} updated ({duration_ms}ms)")

    except Exception as e:
        duration_ms = int((time.time() - start) * 1000)
        error_msg = f"{type(e).__name__}: {e}"
        log_sync(db, "google_sheets", "failed", processed, created, updated, duration_ms, error_msg)
        print(f"Sync failed: {error_msg}")
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    if not SPREADSHEET_ID:
        print("ERROR: Set SPREADSHEET_ID environment variable")
        print("  export SPREADSHEET_ID='your-spreadsheet-id-from-url'")
        exit(1)
    sync()
