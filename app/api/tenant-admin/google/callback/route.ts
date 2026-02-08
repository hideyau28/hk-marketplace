import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth/jwt";
import { exchangeCodeForToken, fetchGoogleUser } from "@/lib/auth/google-oauth";

/** 用 Google name 生成 unique slug（英文小寫 + 數字後綴） */
function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "store"}-${suffix}`;
}

export async function GET(req: NextRequest) {
  const errorRedirect = (msg: string) => {
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const url = new URL("/en/tenant-admin/login", base);
    url.searchParams.set("error", msg);
    return NextResponse.redirect(url.toString());
  };

  try {
    const code = req.nextUrl.searchParams.get("code");
    if (!code) {
      return errorRedirect("missing_code");
    }

    // Exchange code → token → user info
    const { access_token } = await exchangeCodeForToken(code);
    const gUser = await fetchGoogleUser(access_token);

    if (!gUser.email || !gUser.verified_email) {
      return errorRedirect("email_not_verified");
    }

    // 1) Try find by googleId
    let admin = await prisma.tenantAdmin.findUnique({
      where: { googleId: gUser.id },
      include: { tenant: true },
    });

    // 2) Try find by email (link Google to existing account)
    if (!admin) {
      admin = await prisma.tenantAdmin.findUnique({
        where: { email: gUser.email },
        include: { tenant: true },
      });

      if (admin) {
        // 已有 email/password 帳戶 — 連結 Google
        await prisma.tenantAdmin.update({
          where: { id: admin.id },
          data: {
            googleId: gUser.id,
            avatarUrl: gUser.picture || undefined,
          },
        });
      }
    }

    // 3) New user — auto-create Tenant + TenantAdmin
    if (!admin) {
      const slug = generateSlug(gUser.name || gUser.email);

      const tenant = await prisma.tenant.create({
        data: {
          name: gUser.name || gUser.email.split("@")[0],
          slug,
        },
      });

      admin = await prisma.tenantAdmin.create({
        data: {
          tenantId: tenant.id,
          email: gUser.email,
          passwordHash: "", // Google-only 帳戶無 password
          googleId: gUser.id,
          avatarUrl: gUser.picture || undefined,
        },
        include: { tenant: true },
      });
    }

    // Verify tenant is active
    if (admin.tenant.status !== "active") {
      return errorRedirect("tenant_inactive");
    }

    // Sign JWT — 同 email/password login 一樣
    const token = signToken({
      tenantId: admin.tenantId,
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    // Set cookie and redirect to admin dashboard
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = NextResponse.redirect(
      new URL("/en/tenant-admin", base).toString()
    );

    response.cookies.set("tenant-admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return errorRedirect("oauth_error");
  }
}
