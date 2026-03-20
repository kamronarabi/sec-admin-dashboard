"""Shared schema initialization for Python scripts."""

SCHEMA = """
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    discord_id TEXT,
    discord_username TEXT,
    github_username TEXT,
    role TEXT DEFAULT 'member',
    events_attended INTEGER DEFAULT 0,
    join_date TEXT NOT NULL DEFAULT (date('now')),
    last_active TEXT NOT NULL DEFAULT (date('now')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'alumni')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT,
    type TEXT DEFAULT 'meeting',
    location TEXT,
    attendance_count INTEGER DEFAULT 0,
    source_sheet TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    checked_in_at TEXT DEFAULT (datetime('now')),
    UNIQUE(member_id, event_id)
);

CREATE TABLE IF NOT EXISTS sync_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('success', 'partial', 'failed')),
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    duration_ms INTEGER,
    error_message TEXT,
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
);

CREATE TABLE IF NOT EXISTS action_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    source TEXT DEFAULT 'manual' CHECK(source IN ('manual', 'ai')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'done', 'dismissed')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('high', 'medium', 'low')),
    due_date TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    details TEXT,
    admin_email TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_source ON sync_logs(source);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
"""


def init_schema(conn):
    conn.executescript(SCHEMA)
