import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/admin/session";

export const runtime = "nodejs";

/**
 * GET /api/tenant-admin/google/callback
 * Handles the OAuth 2.0 callback from Google.
 * Exchanges the authorization code for tokens, verifies the user,
 * creates an admin session, and redirects to the admin dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (error) {
    console.error("[Google OAuth] Error from Google:", error);
    return NextResponse.redirect(`${baseUrl}/en/admin/login?error=google_denied`);
  }

  if (!code) {
    console.error("[Google OAuth] No authorization code in callback");
    return NextResponse.redirect(`${baseUrl}/en/admin/login?error=no_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/tenant-admin/google/callback`;

  if (!clientId || !clientSecret) {
    console.error("[Google OAuth] Google OAuth credentials not configured");
    return NextResponse.redirect(`${baseUrl}/en/admin/login?error=config`);
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
      return NextResponse.redirect(`${baseUrl}/en/admin/login?error=token_exchange`);
    }

    const tokens = await tokenRes.json();

    // Fetch user info from Google
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      console.error("[Google OAuth] Failed to fetch user info");
      return NextResponse.redirect(`${baseUrl}/en/admin/login?error=user_info`);
    }

    const userInfo = await userInfoRes.json();

    // Create admin session JWT
    const token = await createSession();

    // BUG FIX: Must set cookie directly on the redirect response.
    // Previously used setSessionCookie() which calls cookies() from next/headers,
    // but cookies set that way are NOT carried over to NextResponse.redirect().
    const redirectUrl = `${baseUrl}/en/admin/products`;
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // "lax" required for OAuth flows (navigation from Google)
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[Google OAuth] Callback error:", err);
    return NextResponse.redirect(`${baseUrl}/en/admin/login?error=callback_failed`);
  }
}
