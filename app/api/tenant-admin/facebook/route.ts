import { NextResponse } from "next/server";
import crypto from "crypto";
import { getFacebookAuthURL } from "@/lib/auth/facebook";

export const runtime = "nodejs";

/**
 * GET /api/tenant-admin/facebook
 * Redirects the user to the Facebook OAuth consent screen.
 * Sets a CSRF state cookie for verification in the callback.
 */
export async function GET() {
  const appId = process.env.FACEBOOK_APP_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!appId) {
    return NextResponse.json(
      { error: "FACEBOOK_APP_ID is not configured" },
      { status: 500 }
    );
  }

  const state = crypto.randomBytes(32).toString("hex");
  const redirectUri = `${baseUrl}/api/tenant-admin/facebook/callback`;
  const facebookAuthUrl = getFacebookAuthURL(redirectUri, state);

  const response = NextResponse.redirect(facebookAuthUrl);
  response.cookies.set("fb_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
