/**
 * Google OAuth2 helpers for tenant admin login/registration.
 * Uses direct Google APIs — no next-auth dependency.
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

function getClientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new Error("GOOGLE_CLIENT_ID environment variable is not set");
  return id;
}

function getClientSecret(): string {
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!secret)
    throw new Error("GOOGLE_CLIENT_SECRET environment variable is not set");
  return secret;
}

function getRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return `${base}/api/tenant-admin/google/callback`;
}

/** Build the Google OAuth consent URL */
export function buildGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "email profile",
    access_type: "offline",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/** Exchange authorization code for access token */
export async function exchangeCodeForToken(
  code: string
): Promise<{ access_token: string }> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: getClientId(),
      client_secret: getClientSecret(),
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed: ${text}`);
  }

  return res.json();
}

export type GoogleUserInfo = {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
};

/** Fetch Google user profile using access token */
export async function fetchGoogleUser(
  accessToken: string
): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google userinfo fetch failed: ${text}`);
  }

  return res.json();
}
