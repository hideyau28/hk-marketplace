import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/admin/session";
import { signToken } from "@/lib/auth/jwt";

export const runtime = "nodejs";

/**
 * POST /api/admin/select-tenant
 * Super admin selects a tenant to manage. Sets tenant-admin-token JWT cookie.
 * Requires valid admin_session cookie (from ADMIN_SECRET login).
 */
export async function POST(req: Request) {
  try {
    // Verify super admin session
    const isSessionValid = await getSessionFromCookie();
    if (!isSessionValid) {
      return NextResponse.json(
        { ok: false, error: "Admin session required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { tenantId } = body;

    if (!tenantId || typeof tenantId !== "string") {
      return NextResponse.json(
        { ok: false, error: "tenantId is required" },
        { status: 400 }
      );
    }

    // Verify tenant exists and is active
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, slug: true, status: true },
    });

    if (!tenant || tenant.status !== "active") {
      return NextResponse.json(
        { ok: false, error: "Tenant not found or inactive" },
        { status: 404 }
      );
    }

    // Sign JWT with super admin context
    const token = signToken({
      tenantId: tenant.id,
      adminId: "super-admin",
      email: "admin@system",
      role: "super",
    });

    // Set tenant-admin-token cookie
    const response = NextResponse.json({
      ok: true,
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
    });

    response.cookies.set("tenant-admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days (match JWT expiry)
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Select tenant error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to select tenant" },
      { status: 500 }
    );
  }
}
