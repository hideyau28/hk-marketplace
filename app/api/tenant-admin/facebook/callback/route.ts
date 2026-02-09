import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForToken, getFacebookUser } from "@/lib/auth/facebook";

export const runtime = "nodejs";

/**
 * GET /api/tenant-admin/facebook/callback
 * Handles the OAuth 2.0 callback from Facebook.
 * Verifies CSRF state, exchanges code for token, checks email whitelist,
 * creates an admin session, and redirects to the admin dashboard.
 */
export async function GET(request: NextRequest) {
  console.log("[Facebook OAuth] Callback hit");

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // User cancelled the Facebook login
  if (error) {
    console.error("[Facebook OAuth] Error from Facebook:", error);
    return NextResponse.redirect(`${baseUrl}/en/admin/login?error=facebook_denied`);
  }

  if (!code) {
    console.error("[Facebook OAuth] No authorization code in callback");
    return NextResponse.redirect(`${baseUrl}/en/admin/login?error=no_code`);
  }

  // CSRF state verification
  const storedState = request.cookies.get("fb_oauth_state")?.value;
  if (!state || !storedState || state !== storedState) {
    console.error("[Facebook OAuth] State mismatch (CSRF check failed)");
    return NextResponse.redirect(`${baseUrl}/en/admin/login?error=state_mismatch`);
  }

  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    console.error("[Facebook OAuth] Facebook OAuth credentials not configured");
    return NextResponse.redirect(`${baseUrl}/en/admin/login?error=config`);
  }

  const callbackUrl = `${baseUrl}/api/tenant-admin/facebook/callback`;

  try {
    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code, callbackUrl);
    console.log("[Facebook OAuth] Token exchange successful");

    // Fetch user info from Facebook
    const fbUser = await getFacebookUser(tokenData.access_token);
    console.log("[Facebook OAuth] Facebook user email:", fbUser.email);

    if (!fbUser.email) {
      console.error("[Facebook OAuth] No email returned from Facebook");
      return NextResponse.redirect(`${baseUrl}/en/admin/login?error=no_email`);
    }

    // Check if email is in the TenantAdmin whitelist
    const admin = await prisma.tenantAdmin.findFirst({
      where: { email: fbUser.email },
    });

    if (!admin) {
      console.error("[Facebook OAuth] Email not in TenantAdmin whitelist:", fbUser.email);
      return NextResponse.redirect(`${baseUrl}/en/admin/login?error=unauthorized`);
    }

    // Create admin session JWT with tenantId from TenantAdmin record
    const token = await createSession(admin.tenantId);

    // Set cookie directly on the redirect response (same pattern as Google OAuth)
    const redirectUrl = `${baseUrl}/en/admin/products`;
    console.log("[Facebook OAuth] Redirecting to:", redirectUrl);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // "lax" required for OAuth flows (navigation from Facebook)
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    // Delete the CSRF state cookie
    response.cookies.delete("fb_oauth_state");

    console.log("[Facebook OAuth] admin_session cookie set, redirect ready");
    return response;
  } catch (err) {
    console.error("[Facebook OAuth] Callback error:", err);
    return NextResponse.redirect(`${baseUrl}/en/admin/login?error=callback_failed`);
  }
}
