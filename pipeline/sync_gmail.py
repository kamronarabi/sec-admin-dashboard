#!/usr/bin/env python3
"""
Gmail → SQLite pipeline.

Syncs recent emails from the connected Gmail account into the emails table.
Follows the same patterns as sync_sheets.py (idempotent, logs to sync_logs).
"""

import base64
import sqlite3
import time
import traceback
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

from googleapiclient.discovery import build

from config import DATABASE_PATH, get_gmail_credentials


def get_gmail_service():
    creds = get_gmail_credentials()
    return build("gmail", "v1", credentials=creds)


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


def parse_headers(headers):
    """Extract From, To, Subject, Date from message headers."""
    result = {}
    for h in headers:
        name = h["name"].lower()
        if name in ("from", "to", "subject", "date"):
            result[name] = h["value"]
    return result


def extract_body_html(payload):
    """Recursively extract HTML body from Gmail message payload."""
    mime_type = payload.get("mimeType", "")

    # Direct HTML body
    if mime_type == "text/html":
        data = payload.get("body", {}).get("data", "")
        if data:
            return base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")

    # Check parts recursively
    for part in payload.get("parts", []):
        html = extract_body_html(part)
        if html:
            return html

    # Fallback to plain text
    if mime_type == "text/plain":
        data = payload.get("body", {}).get("data", "")
        if data:
            text = base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")
            return f"<pre>{text}</pre>"

    return None


def sync():
    start = time.time()
    db = get_db()
    processed = 0
    created = 0
    updated = 0

    try:
        service = get_gmail_service()

        # Fetch the 50 most recent received (non-sent) messages
        results = service.users().messages().list(
            userId="me", q="category:primary", maxResults=50
        ).execute()
        messages = results.get("messages", [])

        for msg_meta in messages:
            msg_id = msg_meta["id"]

            # Check if already synced
            existing = db.execute(
                "SELECT id FROM emails WHERE gmail_id = ?", (msg_id,)
            ).fetchone()

            if existing:
                processed += 1
                continue

            # Fetch full message
            msg = service.users().messages().get(
                userId="me", id=msg_id, format="full"
            ).execute()

            payload = msg.get("payload", {})
            headers = parse_headers(payload.get("headers", []))
            body_html = extract_body_html(payload)

            # Parse date
            date_str = headers.get("date", "")
            try:
                received_dt = parsedate_to_datetime(date_str)
                received_at = received_dt.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                received_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

            labels = ",".join(msg.get("labelIds", []))

            db.execute(
                """INSERT OR IGNORE INTO emails
                   (gmail_id, thread_id, from_address, to_address, subject,
                    snippet, body_html, received_at, is_read, labels)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    msg_id,
                    msg.get("threadId"),
                    headers.get("from", ""),
                    headers.get("to", ""),
                    headers.get("subject", "(no subject)"),
                    msg.get("snippet", ""),
                    body_html,
                    received_at,
                    0 if "UNREAD" in msg.get("labelIds", []) else 1,
                    labels,
                ),
            )
            created += 1
            processed += 1

        db.commit()

        duration_ms = int((time.time() - start) * 1000)
        log_sync(db, "gmail", "success", processed, created, updated, duration_ms)
        print(f"Gmail sync complete: {processed} processed, {created} new ({duration_ms}ms)")

    except Exception as e:
        duration_ms = int((time.time() - start) * 1000)
        error_msg = f"{type(e).__name__}: {e}"
        log_sync(db, "gmail", "failed", processed, created, updated, duration_ms, error_msg)
        print(f"Gmail sync failed: {error_msg}")
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    sync()
