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

  const pipelineDir = [process.cwd(), "pipeline"].join(path.sep);
  const scriptPath = [pipelineDir, "sync_gmail.py"].join(path.sep);
  const pythonPath = [pipelineDir, ".venv", "bin", "python3"].join(path.sep);

  try {
    const result = await new Promise<{ stdout: string; stderr: string }>(
      (resolve, reject) => {
        execFile(
          pythonPath,
          [scriptPath],
          {
            cwd: pipelineDir,
            timeout: 60_000,
            env: {
              ...process.env,
              DATABASE_PATH: path.resolve(
                process.env.DATABASE_PATH || "./data/sec-dashboard.db"
              ),
            },
          },
          (error, stdout, stderr) => {
            if (error) {
              reject({ error, stdout, stderr });
            } else {
              resolve({ stdout, stderr });
            }
          }
        );
      }
    );

    const db = getDb();
    const latest = db
      .prepare(
        `SELECT * FROM sync_logs WHERE source = 'gmail' ORDER BY started_at DESC LIMIT 1`
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
        error: execErr.error?.message || "Gmail sync failed",
        output: execErr.stdout?.trim() || "",
        stderr: execErr.stderr?.trim() || "",
      },
      { status: 500 }
    );
  }
}
