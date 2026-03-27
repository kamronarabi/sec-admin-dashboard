import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { google } from "googleapis";
import { renderEmailHtml } from "@/lib/email-template";

function buildRawEmail(to: string, subject: string, bodyHtml: string): string {
  const boundary = "sec_boundary_" + Date.now();
  const lines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    Buffer.from(bodyHtml).toString("base64"),
    ``,
    `--${boundary}--`,
  ];
  return lines.join("\r\n");
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to, subject, body_html } = (await req.json()) as {
    to: string[];
    subject: string;
    body_html: string;
  };

  if (!to?.length || !subject || !body_html) {
    return NextResponse.json(
      { error: "Missing required fields: to, subject, body_html" },
      { status: 400 }
    );
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json(
      { error: "Gmail OAuth credentials not configured" },
      { status: 500 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Wrap body in branded template
  const brandedHtml = await renderEmailHtml(body_html);

  const toAddresses = to.join(", ");
  const raw = buildRawEmail(toAddresses, subject, brandedHtml);
  const encodedMessage = Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    const db = getDb();
    db.prepare(
      `INSERT INTO sent_emails (to_addresses, subject, body_html, gmail_message_id, sent_by, recipient_count)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      toAddresses,
      subject,
      body_html,
      result.data.id || null,
      session.user?.email || "unknown",
      to.length
    );

    return NextResponse.json({
      success: true,
      messageId: result.data.id,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
