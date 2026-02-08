import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth/jwt";

type GoogleTokenResponse = {
  access_token: string;
  id_token: string;
  token_type: string;
};

type GoogleUserInfo = {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
};

/**
 * GET /api/tenant-admin/google/callback
 * Handles Google OAuth callback — exchanges code for token,
 * looks up admin by googleId or email, issues JWT.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const appUrl = process.env.APP_URL || "http://localhost:3012";
  const loginUrl = `${appUrl}/en/admin/login`;

  // User denied consent
  if (error) {
    return NextResponse.redirect(`${loginUrl}?error=google_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${loginUrl}?error=missing_params`);
  }

  // Verify CSRF state
  const cookieStore = await cookies();
  const savedState = cookieStore.get("google-oauth-state")?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${loginUrl}?error=invalid_state`);
  }
  // Clean up state cookie
  cookieStore.delete("google-oauth-state");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/tenant-admin/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${loginUrl}?error=oauth_not_configured`);
  }

  try {
    // Exchange code for tokens
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
      console.error("Google token exchange failed:", await tokenRes.text());
      return NextResponse.redirect(`${loginUrl}?error=token_exchange_failed`);
    }

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;

    // Get user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      console.error("Google userinfo failed:", await userRes.text());
      return NextResponse.redirect(`${loginUrl}?error=userinfo_failed`);
    }

    const googleUser = (await userRes.json()) as GoogleUserInfo;

    if (!googleUser.email || !googleUser.email_verified) {
      return NextResponse.redirect(`${loginUrl}?error=email_not_verified`);
    }

    // Look up admin: first by googleId, then by email
    let admin = await prisma.tenantAdmin.findUnique({
      where: { googleId: googleUser.sub },
      include: { tenant: true },
    });

    if (!admin) {
      // Try matching by email (link Google account to existing admin)
      admin = await prisma.tenantAdmin.findUnique({
        where: { email: googleUser.email },
        include: { tenant: true },
      });

      if (admin) {
        // Link Google account to existing admin
        await prisma.tenantAdmin.update({
          where: { id: admin.id },
          data: {
            googleId: googleUser.sub,
            avatarUrl: googleUser.picture || undefined,
          },
        });
      }
    }

    if (!admin) {
      return NextResponse.redirect(`${loginUrl}?error=no_account`);
    }

    // Verify tenant is active
    if (admin.tenant.status !== "active") {
      return NextResponse.redirect(`${loginUrl}?error=tenant_inactive`);
    }

    // Update avatar if changed
    if (googleUser.picture && googleUser.picture !== admin.avatarUrl) {
      await prisma.tenantAdmin.update({
        where: { id: admin.id },
        data: { avatarUrl: googleUser.picture },
      });
    }

    // Issue JWT — same flow as email/password login
    const token = signToken({
      tenantId: admin.tenantId,
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    const response = NextResponse.redirect(`${appUrl}/en/admin/products`);

    response.cookies.set("tenant-admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${loginUrl}?error=internal`);
  }
}
