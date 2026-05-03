import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getFacebookAuthURL } from "@/lib/auth/facebook";

export const runtime = "nodejs";

const ALLOWED_LOCALES = new Set(["en", "zh-HK"]);

/**
 * GET /api/tenant-admin/facebook
 * Redirects the user to the Facebook OAuth consent screen.
 * Embeds the user's locale + a CSRF nonce inside the OAuth state so the
 * callback can redirect back to the correct locale and verify the request.
 */
export async function GET(request: NextRequest) {
  const appId = process.env.FACEBOOK_APP_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_URL is required");

  if (!appId) {
    return NextResponse.json(
      { error: "FACEBOOK_APP_ID is not configured" },
      { status: 500 }
    );
  }

  // CSRF nonce — stored in httpOnly cookie, embedded in OAuth state for verification
  const nonce = crypto.randomBytes(32).toString("hex");

  // Locale carried through the round-trip so the callback redirects to the
  // user's language (defaults to en for unrecognised values).
  const localeParam = request.nextUrl.searchParams.get("locale") || "en";
  const locale = ALLOWED_LOCALES.has(localeParam) ? localeParam : "en";

  const stateStr = Buffer.from(
    JSON.stringify({ nonce, locale }),
  ).toString("base64url");

  const redirectUri = `${baseUrl}/api/tenant-admin/facebook/callback`;
  const facebookAuthUrl = getFacebookAuthURL(redirectUri, stateStr);

  const response = NextResponse.redirect(facebookAuthUrl);
  response.cookies.set("fb_oauth_state", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
