import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { execFile } from "child_process";
import path from "path";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pipelineDir = path.join(process.cwd(), "pipeline");
  const scriptPath = path.join(pipelineDir, "sync_sheets.py");
  const pythonPath = path.join(pipelineDir, ".venv", "bin", "python3");

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
              // Resolve DATABASE_PATH to absolute so it's correct regardless of cwd
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

    const db = getDb();
    const latest = db
      .prepare(
        `SELECT * FROM sync_logs WHERE source = 'google_sheets' ORDER BY started_at DESC LIMIT 1`
      )
      .get() as Record<string, unknown> | undefined;

    return NextResponse.json({
      success: true,
      output: result.stdout.trim(),
      latest: latest || null,
    });
  } catch (err: unknown) {
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
