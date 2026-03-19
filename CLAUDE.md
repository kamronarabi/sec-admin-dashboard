# CLAUDE.md — SEC Admin Dashboard

## What This Is
A standalone admin dashboard for the SEC student club at UFL. The club president logs in via Google OAuth and gets a single portal to see members, events, attendance, pipeline health, and action items — pulled from Google Sheets (and later Discord/GitHub).

## Tech Stack
- **Frontend/API**: Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui
- **Database**: SQLite via `better-sqlite3` in WAL mode — stored at `data/sec-dashboard.db`
- **Pipelines**: Python scripts in `pipeline/` — run via cron, write to SQLite
- **Auth**: NextAuth.js with Google OAuth — whitelist in `ADMIN_EMAILS` env var

## Project Structure
```
src/
  app/
    (dashboard)/          # Auth-gated dashboard pages (layout wraps all)
      page.tsx            # Overview with stat cards
      members/page.tsx    # Member spreadsheet
      events/page.tsx     # Events list
      pipelines/page.tsx  # Pipeline health monitor
      actions/page.tsx    # Action items todo list
    api/                  # API routes (all auth-checked)
      auth/[...nextauth]/ # NextAuth handler
      members/            # CRUD + attendance sub-route
      events/             # List + attendees sub-route
      pipelines/          # Pipeline status
      actions/            # CRUD for action items
    login/page.tsx        # Login page (only public page)
  components/             # React components (client + server)
  lib/
    auth.ts               # NextAuth config
    db.ts                 # SQLite connection + schema init
    types.ts              # TypeScript interfaces
    utils.ts              # shadcn utility
pipeline/
  sync_sheets.py          # Google Sheets → SQLite pipeline
  seed_demo.py            # Seeds demo data for testing
  init_db.py              # Shared schema initialization
  config.py               # Pipeline configuration
  requirements.txt        # Python dependencies
```

## Key Commands
```bash
npm run dev              # Start dev server
npm run build            # Production build
python3 pipeline/seed_demo.py    # Seed demo data
python3 pipeline/sync_sheets.py  # Run Google Sheets sync (needs SPREADSHEET_ID)
```

## Field Ownership
- **Sheets-managed**: name, email (pipeline overwrites these)
- **Discord-managed** (Phase 2): role
- **Derived**: events_attended, last_active (computed from attendance records)
- **Dashboard-managed**: status, github_username, manual action items

## Auth
Single Google account (`secatuf@gmail.com`) whitelisted via `ADMIN_EMAILS` env var. No public pages except login.

## Database
SQLite with WAL mode. Schema auto-initializes on first access from either Next.js or Python. Tables: members, events, attendance, sync_logs, action_items, admin_audit_log.

## Current Phase: Phase 1
Google Sheets pipeline + core dashboard (members, events, stats, pipeline health, action items).

## Conventions
- All member emails normalized to lowercase `@ufl.edu`
- Pipeline scripts are idempotent — safe to re-run
- API routes always check auth via `getServerSession`
- Client components fetch from `/api/*` routes
- Server components query SQLite directly via `getDb()`
