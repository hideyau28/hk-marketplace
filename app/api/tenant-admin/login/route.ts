import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/api/route-helpers";

const LOGIN_RATE_LIMIT = {
  interval: 60 * 1000, // 1 minute
  maxRequests: 5,
};

export async function POST(req: Request) {
  try {
    // Rate limit: 5 requests per minute per IP
    const ip = getClientIp(req);
    const rl = rateLimit(`tenant-admin-login:${ip}`, LOGIN_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many login attempts, please try again later" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await req.json();
    const { email, password } = body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "email and password are required" },
        { status: 400 }
      );
    }

    // Find admin by email with tenant info
    const admin = await prisma.tenantAdmin.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // OAuth 用戶冇密碼，唔可以用 email/password login
    if (!admin.passwordHash) {
      return NextResponse.json(
        { ok: false, error: "此帳號使用 Google 登入，請使用 Google 登入" },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { ok: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify tenant is active
    if (admin.tenant.status !== "active") {
      return NextResponse.json(
        { ok: false, error: "Tenant is not active" },
        { status: 403 }
      );
    }

    // Sign JWT
    const token = signToken({
      tenantId: admin.tenantId,
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    // Build response with cookie
    const response = NextResponse.json({
      ok: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });

    response.cookies.set("tenant-admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
