#!/usr/bin/env python3
"""
Seeds the database with demo data so you can test the dashboard
before connecting to real Google Sheets.
"""

import sqlite3
import os
import random
from pathlib import Path
from datetime import datetime, timedelta

DATABASE_PATH = os.getenv(
    "DATABASE_PATH",
    str(Path(__file__).parent.parent / "data" / "sec-dashboard.db"),
)

NAMES = [
    "Alex Johnson", "Maria Garcia", "James Chen", "Sarah Williams",
    "David Kim", "Emily Brown", "Michael Lee", "Jessica Martinez",
    "Daniel Taylor", "Sophia Anderson", "Matthew Thomas", "Olivia Jackson",
    "Andrew White", "Emma Harris", "Ryan Clark", "Isabella Lewis",
    "Tyler Robinson", "Ava Walker", "Nathan Young", "Mia Allen",
    "Christopher King", "Abigail Wright", "Joshua Scott", "Charlotte Green",
    "Ethan Adams", "Amelia Baker", "Jacob Nelson", "Harper Hill",
    "Brandon Campbell", "Ella Mitchell",
]

EVENTS = [
    ("Intro to Web Dev", "2025-09-10", "workshop", "Room 101"),
    ("First GBM", "2025-09-17", "meeting", "Auditorium"),
    ("Python Workshop", "2025-09-24", "workshop", "Lab 204"),
    ("Resume Review", "2025-10-01", "workshop", "Room 101"),
    ("October GBM", "2025-10-15", "meeting", "Auditorium"),
    ("Hackathon Kickoff", "2025-10-22", "social", "Atrium"),
    ("Mock Interviews", "2025-11-05", "workshop", "Room 302"),
    ("November GBM", "2025-11-12", "meeting", "Auditorium"),
    ("Industry Panel", "2025-11-19", "meeting", "Auditorium"),
    ("End of Semester Social", "2025-12-03", "social", "Student Union"),
    ("Spring Kickoff GBM", "2026-01-21", "meeting", "Auditorium"),
    ("Cloud Computing Workshop", "2026-02-04", "workshop", "Lab 204"),
    ("February GBM", "2026-02-18", "meeting", "Auditorium"),
    ("Career Fair Prep", "2026-03-04", "workshop", "Room 101"),
    ("March GBM", "2026-03-11", "meeting", "Auditorium"),
]


def seed():
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")

    from init_db import init_schema
    init_schema(conn)

    # Create events
    event_ids = []
    for title, date, etype, location in EVENTS:
        cursor = conn.execute(
            """INSERT OR IGNORE INTO events (title, date, type, location, source_sheet)
               VALUES (?, ?, ?, ?, ?)""",
            (title, date, etype, location, title),
        )
        if cursor.lastrowid:
            event_ids.append(cursor.lastrowid)
        else:
            row = conn.execute("SELECT id FROM events WHERE title = ?", (title,)).fetchone()
            event_ids.append(row[0])

    # Create members
    member_ids = []
    roles = ["member"] * 24 + ["officer"] * 4 + ["lead"] * 2
    random.shuffle(roles)

    for i, name in enumerate(NAMES):
        email = name.lower().replace(" ", ".") + "@ufl.edu"
        join_date = (datetime(2025, 8, 15) + timedelta(days=random.randint(0, 60))).strftime("%Y-%m-%d")
        role = roles[i] if i < len(roles) else "member"

        cursor = conn.execute(
            """INSERT OR IGNORE INTO members (email, name, role, join_date, last_active)
               VALUES (?, ?, ?, ?, ?)""",
            (email, name, role, join_date, join_date),
        )
        if cursor.lastrowid:
            member_ids.append(cursor.lastrowid)
        else:
            row = conn.execute("SELECT id FROM members WHERE email = ?", (email,)).fetchone()
            member_ids.append(row[0])

    # Create attendance records
    for event_id in event_ids:
        # Each event gets 40-90% of members
        attendee_count = random.randint(int(len(member_ids) * 0.4), int(len(member_ids) * 0.9))
        attendees = random.sample(member_ids, attendee_count)
        for mid in attendees:
            try:
                conn.execute(
                    "INSERT INTO attendance (member_id, event_id) VALUES (?, ?)",
                    (mid, event_id),
                )
            except sqlite3.IntegrityError:
                pass

        # Update attendance count
        count = conn.execute(
            "SELECT COUNT(*) FROM attendance WHERE event_id = ?", (event_id,)
        ).fetchone()[0]
        conn.execute(
            "UPDATE events SET attendance_count = ? WHERE id = ?", (count, event_id)
        )

    # Update member stats
    conn.execute("""
        UPDATE members SET
            events_attended = (SELECT COUNT(*) FROM attendance WHERE member_id = members.id),
            last_active = COALESCE(
                (SELECT MAX(e.date) FROM attendance a JOIN events e ON e.id = a.event_id WHERE a.member_id = members.id),
                members.last_active
            ),
            updated_at = datetime('now')
    """)

    # Add sample sync logs
    conn.execute("""
        INSERT INTO sync_logs (source, status, records_processed, records_created, records_updated, duration_ms, completed_at)
        VALUES ('google_sheets', 'success', 150, 5, 30, 2340, datetime('now'))
    """)

    # Add sample action items
    actions = [
        "Book room for next GBM",
        "Follow up with sponsor about Spring event",
        "Review new member applications",
        "Update club website with new event photos",
        "Send reminder email for hackathon registration",
    ]
    for action in actions:
        conn.execute("INSERT INTO action_items (title) VALUES (?)", (action,))

    conn.commit()
    conn.close()
    print(f"Seeded database at {DATABASE_PATH}")
    print(f"  {len(NAMES)} members, {len(EVENTS)} events, {len(actions)} action items")


if __name__ == "__main__":
    seed()
