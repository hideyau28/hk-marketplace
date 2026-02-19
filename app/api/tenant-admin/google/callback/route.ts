import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/admin/session";

export const runtime = "nodejs";

/**
 * GET /api/tenant-admin/google/callback
 * Handles the OAuth 2.0 callback from Google.
 * Verifies CSRF state cookie, exchanges the authorization code for tokens,
 * verifies the user, creates an admin session, and redirects to the admin dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const stateParam = searchParams.get("state");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_URL is required");

  // Parse state to check if this is an onboarding flow + locale + CSRF
  let isOnboarding = false;
  let locale = "en";
  let csrfFromState: string | undefined;
  if (stateParam) {
    try {
      const stateObj = JSON.parse(Buffer.from(stateParam, "base64url").toString());
      isOnboarding = stateObj.onboarding === true;
      if (stateObj.locale && typeof stateObj.locale === "string") {
        locale = stateObj.locale;
      }
      if (stateObj.csrf && typeof stateObj.csrf === "string") {
        csrfFromState = stateObj.csrf;
      }
    } catch {
      // Invalid state, ignore
    }
  }

  const errorRedirect = isOnboarding ? `${baseUrl}/${locale}/start` : `${baseUrl}/${locale}/admin/login`;

  // CSRF state verification (same pattern as Facebook OAuth)
  const storedState = request.cookies.get("google_oauth_state")?.value;
  if (!csrfFromState || !storedState || csrfFromState !== storedState) {
    console.error("[Google OAuth] State mismatch (CSRF check failed)");
    return NextResponse.redirect(`${errorRedirect}?error=state_mismatch`);
  }

  if (error) {
    console.error("[Google OAuth] Error from Google:", error);
    return NextResponse.redirect(`${errorRedirect}?error=google_denied`);
  }

  if (!code) {
    console.error("[Google OAuth] No authorization code in callback");
    return NextResponse.redirect(`${errorRedirect}?error=no_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/tenant-admin/google/callback`;

  if (!clientId || !clientSecret) {
    console.error("[Google OAuth] Google OAuth credentials not configured");
    return NextResponse.redirect(`${errorRedirect}?error=config`);
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const tokenError = await tokenRes.text();
      console.error("[Google OAuth] Token exchange failed:", tokenError);
      return NextResponse.redirect(`${errorRedirect}?error=token_exchange`);
    }

    const tokens = await tokenRes.json();

    // Fetch user info from Google
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      console.error("[Google OAuth] Failed to fetch user info");
      return NextResponse.redirect(`${errorRedirect}?error=user_info`);
    }

    const userInfo = await userInfoRes.json();

    // Onboarding flow: redirect back to /start with email, no session needed yet
    if (isOnboarding) {
      const email = encodeURIComponent(userInfo.email || "");
      const redirectUrl = `${baseUrl}/${locale}/start?google_email=${email}`;
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.delete("google_oauth_state");
      return response;
    }

    // Create admin session JWT
    const token = await createSession();

    // BUG FIX: Must set cookie directly on the redirect response.
    // Previously used setSessionCookie() which calls cookies() from next/headers,
    // but cookies set that way are NOT carried over to NextResponse.redirect().
    const redirectUrl = `${baseUrl}/${locale}/admin/products`;
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // "lax" required for OAuth flows (navigation from Google)
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    // Delete the CSRF state cookie
    response.cookies.delete("google_oauth_state");

    return response;
  } catch (err) {
    console.error("[Google OAuth] Callback error:", err);
    return NextResponse.redirect(`${errorRedirect}?error=callback_failed`);
  }
}
