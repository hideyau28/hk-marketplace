// Wowlix transactional email sender — Resend with console.log fallback.
//
// In production, set RESEND_API_KEY + EMAIL_FROM in env. Without an API key
// the message is logged to stdout so the dev / staging environment never
// actually sends but the routes that depend on email delivery still work.

import { Resend } from "resend";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "WoWlix <hello@wowlix.com>";

const client = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export type SendEmailInput = {
  to: string;
  subject: string;
  template: ReactElement;
  /** Optional plain-text fallback. If omitted, derived from template. */
  text?: string;
  /** Optional reply-to (e.g., per-tenant support address). */
  replyTo?: string;
};

export async function sendEmail({
  to,
  subject,
  template,
  text,
  replyTo,
}: SendEmailInput): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const html = await render(template);
  const plain = text ?? (await render(template, { plainText: true }));

  if (!client) {
    // Dev / staging fallback: log so the calling code still resolves.
    console.log(
      `[email/dev] RESEND_API_KEY not configured. Would send to ${to}:\n` +
        `  Subject: ${subject}\n` +
        `  Plain text:\n${plain}`,
    );
    return { ok: true };
  }

  try {
    const result = await client.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text: plain,
      ...(replyTo ? { replyTo } : {}),
    });
    if (result.error) {
      console.error("[email] Resend error:", result.error);
      return { ok: false, error: result.error.message };
    }
    return { ok: true, id: result.data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "send failed";
    console.error("[email] send failed:", msg);
    return { ok: false, error: msg };
  }
}
