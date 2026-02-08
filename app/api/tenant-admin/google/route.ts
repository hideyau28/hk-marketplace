import { NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * GET /api/tenant-admin/google
 * Redirects to Google OAuth 2.0 consent screen.
 * Requires GOOGLE_CLIENT_ID and APP_URL env vars.
 */
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { ok: false, error: "Google OAuth is not configured" },
      { status: 500 }
    );
  }

  const appUrl = process.env.APP_URL || "http://localhost:3012";
  const redirectUri = `${appUrl}/api/tenant-admin/google/callback`;

  // CSRF protection: generate state and store in cookie
  const state = crypto.randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set("google-oauth-state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
