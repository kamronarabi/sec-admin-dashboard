import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  const rows = db
    .prepare("SELECT source, config_key, config_value, updated_at FROM pipeline_config")
    .all() as { source: string; config_key: string; config_value: string | null; updated_at: string }[];

  // Group by source
  const config: Record<string, Record<string, string | null>> = {};
  for (const row of rows) {
    if (!config[row.source]) config[row.source] = {};
    config[row.source][row.config_key] = row.config_value;
  }

  // Always include the env-var spreadsheet ID as fallback so the UI shows something
  if (!config.google_sheets?.spreadsheet_id) {
    if (!config.google_sheets) config.google_sheets = {};
    config.google_sheets.spreadsheet_id = process.env.SPREADSHEET_ID || "";
  }

  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { source, config_key, config_value } = body as {
    source: string;
    config_key: string;
    config_value: string;
  };

  if (!source || !config_key) {
    return NextResponse.json({ error: "source and config_key are required" }, { status: 400 });
  }

  const db = getDb();

  db.prepare(
    `INSERT INTO pipeline_config (source, config_key, config_value, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(source, config_key)
     DO UPDATE SET config_value = excluded.config_value, updated_at = datetime('now')`
  ).run(source, config_key, config_value);

  // Audit log
  db.prepare(
    `INSERT INTO admin_audit_log (action, entity_type, details, admin_email)
     VALUES (?, ?, ?, ?)`
  ).run(
    "update_pipeline_config",
    "pipeline_config",
    JSON.stringify({ source, config_key, config_value }),
    session.user?.email || "unknown"
  );

  return NextResponse.json({ success: true });
}
