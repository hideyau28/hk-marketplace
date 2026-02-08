/**
 * Facebook OAuth 2.0 helpers for admin SSO login.
 * Mirrors the Google OAuth flow pattern.
 */

const FB_API_VERSION = "v19.0";

/**
 * Build the Facebook OAuth 2.0 authorization URL.
 */
export function getFacebookAuthURL(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID || "",
    redirect_uri: redirectUri,
    scope: "email,public_profile",
    response_type: "code",
    state,
  });

  return `https://www.facebook.com/${FB_API_VERSION}/dialog/oauth?${params.toString()}`;
}

/**
 * Exchange an authorization code for an access token.
 */
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<{ access_token: string; token_type: string; expires_in: number }> {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID || "",
    client_secret: process.env.FACEBOOK_APP_SECRET || "",
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch(
    `https://graph.facebook.com/${FB_API_VERSION}/oauth/access_token?${params.toString()}`
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Facebook token exchange failed: ${text}`);
  }

  return res.json();
}

/**
 * Fetch the authenticated user's profile from Facebook.
 */
export async function getFacebookUser(
  accessToken: string
): Promise<{ id: string; name: string; email?: string }> {
  const res = await fetch(
    `https://graph.facebook.com/${FB_API_VERSION}/me?fields=id,name,email&access_token=${accessToken}`
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Facebook user info fetch failed: ${text}`);
  }

  return res.json();
}
