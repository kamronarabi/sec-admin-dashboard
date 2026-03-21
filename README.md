<div align="center">

# SEC Admin Dashboard

**The Software Engineering Club @ UF's internal operations portal**

A futuristic, real-time admin dashboard that automatically syncs club data from Google Sheets into an interactive command center — built for the SEC president to manage members, events, attendance, and pipeline health from a single screen.

[Tech Stack](#tech-stack) · [Architecture](#architecture) · [Features](#features) · [Setup](#getting-started) · [Data Pipeline](#data-pipeline) · [Roadmap](#roadmap) · [Built with Claude](#built-with-claude)

</div>

---

## Tech Stack

| Layer         | Technology                                                      |
| ------------- | --------------------------------------------------------------- |
| **Framework** | Next.js 16 (App Router) · React 19 · TypeScript                 |
| **Styling**   | Tailwind CSS v4 · shadcn/ui · Claude Code frontend-design skill |
| **Database**  | SQLite via `better-sqlite3` (WAL mode)                          |
| **Auth**      | NextAuth.js · Google OAuth · Email whitelist                    |
| **Pipeline**  | Python 3 · Google Sheets API · Service account auth             |
| **Icons**     | Lucide React                                                    |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Google Forms                          │
│              (members fill out per event)                │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Google Sheets                           │
│   Sheet 1: Event metadata (title, date, type, location) │
│   Sheet 2+: One per event (name + email responses)      │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Python Sync Pipeline                        │
│   • Reads events + attendance from Sheets API            │
│   • Normalizes emails to @ufl.edu                        │
│   • Auto-creates members on first appearance             │
│   • Upserts into SQLite (fully idempotent)               │
│   • Logs every run with metrics to sync_logs             │
└──────────────────────┬──────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────┐
│            SQLite Database (WAL mode)                    │
│   members · events · attendance · action_items           │
│   sync_logs · admin_audit_log                            │
└──────────────┬──────────────────┬───────────────────────┘
               ▼                  ▼
┌──────────────────┐  ┌──────────────────────────────────┐
│  Server Components│  │         API Routes               │
│  (direct DB read) │  │  /api/members · /api/events      │
└──────────────────┘  │  /api/actions · /api/pipelines    │
                      │  /api/pipelines/sync              │
                      └──────────────┬────────────────────┘
                                     ▼
                      ┌──────────────────────────────────┐
                      │     Client Widget Components      │
                      │  Members · Events · Actions ·     │
                      │  Pipelines (auto-refresh 30s)     │
                      └──────────────────────────────────┘
```

## Features

### Dashboard Grid

The main interface is a single-screen widget grid — everything the club president needs at a glance:

**Members Widget** — Searchable, sortable member directory with inline editing. Double-click a name to edit it. Click any row to open a detail modal with full profile and attendance history. Filter by role (member/officer/lead) or status.

**Events Widget** — Chronological event table showing title, date, type, and attendance count. Click any event to see the full attendee list. Future events are visually distinguished from past ones.

**Action Items Widget** — Priority-based task tracker (high/medium/low) with color-coded indicators. Add items with a keyboard shortcut, mark done, or dismiss. Priorities glow red, amber, or green.

**Pipelines Widget** — Real-time sync health monitor. Shows status for Google Sheets, Discord, and GitHub pipelines with color-coded health dots, last sync timestamps, and a manual "Sync Now" button. Auto-refreshes every 30 seconds.

### Authentication

Google OAuth login with an email whitelist (`ADMIN_EMAILS` env var). All routes — pages and API — are protected.

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- A Google Cloud project with OAuth credentials and a service account

### 1. Install dependencies

```bash
npm install

cd pipeline
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
# Google OAuth (NextAuth)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret

# Access control
ADMIN_EMAILS=secatuf@gmail.com

# Database
DATABASE_PATH=./data/sec-dashboard.db

# Google Sheets sync
SPREADSHEET_ID=your-spreadsheet-id
```

Place your Google Cloud service account JSON at `pipeline/service-account.json`.

### 3. Seed demo data (optional)

```bash
python3 pipeline/seed_demo.py
```

This creates 30 members, 15 events, attendance records, and sample action items.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with a whitelisted Google account.

## Data Pipeline

The sync pipeline is the backbone of the dashboard. It pulls data from a Google Sheets workbook where:

- **Sheet 1 ("Events")** contains event metadata — title, date, type, location
- **Remaining sheets** are individual event attendance forms (Google Form responses with Name + Email columns)

### How sync works

1. Admin clicks **Sync Now** in the dashboard (or a cron job fires)
2. `POST /api/pipelines/sync` spawns `pipeline/sync_sheets.py` as a child process
3. The script reads the Sheets API, upserts events, auto-creates members on first appearance, records attendance
4. All emails are normalized to lowercase `@ufl.edu`
5. The run is logged to `sync_logs` with metrics (records processed/created/updated, duration, errors)
6. The frontend polls `/api/pipelines` every 30s to reflect the latest status

The pipeline is **fully idempotent** — safe to re-run at any time without duplicating data.

### Database schema

| Table             | Purpose                                                                     |
| ----------------- | --------------------------------------------------------------------------- |
| `members`         | Email (unique), name, role, status, events attended, join/last active dates |
| `events`          | Title, date, type, location, attendance count                               |
| `attendance`      | Member ↔ Event join table (unique constraint)                               |
| `action_items`    | Manual tasks with priority and status                                       |
| `sync_logs`       | Audit trail for every pipeline run                                          |
| `admin_audit_log` | Tracks admin actions                                                        |

## Roadmap

| Phase       | Status  | Description                                                                                  |
| ----------- | ------- | -------------------------------------------------------------------------------------------- |
| **Phase 1** | Active  | Google Sheets pipeline, member/event/attendance dashboard, action items, pipeline monitoring |
| **Phase 2** | Planned | Email integration + AI-powered summarization                                                 |
| **Phase 3** | Planned | GitHub activity tracking for club repos                                                      |
| **Phase 4** | Planned | Analytics charts, attendance trends, data exports                                            |

Additional goals: SQLite backups to Oracle Cloud object storage, cron-based auto-sync (every 15 min).

## Built with Claude

This project was built collaboratively with [Claude Code](https://claude.com/claude-code) (Anthropic's AI coding agent) using a structured, multi-phase development workflow. It wasn't just "generate code" — the entire process leveraged Claude techniques like skills/plugins, subagents, and context engineering to move from idea to production.


---

<div align="center">

**SEC @ University of Florida**

</div>
