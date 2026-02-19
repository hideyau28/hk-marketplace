import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

/**
 * GET /api/tenant-admin/google
 * Redirects the user to the Google OAuth 2.0 consent screen.
 * Accepts ?onboarding=true to pass state through the OAuth flow.
 * Sets a CSRF state cookie for verification in the callback.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_URL is required");

  if (!clientId) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID is not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${baseUrl}/api/tenant-admin/google/callback`;

  // CSRF state token
  const csrf = crypto.randomBytes(32).toString("hex");

  // Pass onboarding flag + locale + CSRF through OAuth state param
  const isOnboarding = request.nextUrl.searchParams.get("onboarding") === "true";
  const locale = request.nextUrl.searchParams.get("locale") || "en";
  const stateObj: Record<string, unknown> = { locale, csrf };
  if (isOnboarding) stateObj.onboarding = true;
  const stateStr = Buffer.from(JSON.stringify(stateObj)).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  params.set("state", stateStr);

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  const response = NextResponse.redirect(googleAuthUrl);
  response.cookies.set("google_oauth_state", csrf, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
