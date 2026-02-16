import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/tenant-admin/google
 * Redirects the user to the Google OAuth 2.0 consent screen.
 * Accepts ?onboarding=true to pass state through the OAuth flow.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!clientId) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID is not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${baseUrl}/api/tenant-admin/google/callback`;

  // Pass onboarding flag through OAuth state param
  const isOnboarding = request.nextUrl.searchParams.get("onboarding") === "true";
  const stateObj = isOnboarding ? { onboarding: true } : {};
  const stateStr = Object.keys(stateObj).length > 0
    ? Buffer.from(JSON.stringify(stateObj)).toString("base64url")
    : undefined;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  if (stateStr) {
    params.set("state", stateStr);
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.redirect(googleAuthUrl);
}
