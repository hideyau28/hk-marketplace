import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/tenant-admin/google
 * Redirects the user to the Google OAuth 2.0 consent screen.
 * Accepts ?onboarding=true to pass state through the OAuth flow.
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

  // Pass onboarding flag + locale through OAuth state param
  const isOnboarding = request.nextUrl.searchParams.get("onboarding") === "true";
  const locale = request.nextUrl.searchParams.get("locale") || "en";
  const stateObj: Record<string, unknown> = { locale };
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

  return NextResponse.redirect(googleAuthUrl);
}
