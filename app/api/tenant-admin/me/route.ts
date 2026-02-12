import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth/jwt";

export async function GET(req: Request) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Super admin 用 select-tenant 設嘅 JWT（adminId = "super-admin"）
    if (payload.adminId === "super-admin" && payload.role === "super") {
      const tenant = await prisma.tenant.findUnique({
        where: { id: payload.tenantId },
        select: { id: true, name: true, slug: true, status: true },
      });

      if (!tenant) {
        return NextResponse.json(
          { ok: false, error: "Tenant not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ok: true,
        admin: {
          id: "super-admin",
          email: payload.email,
          role: "super",
          createdAt: null,
        },
        tenant,
      });
    }

    // Find tenant admin with tenant info
    const admin = await prisma.tenantAdmin.findUnique({
      where: { id: payload.adminId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!admin) {
      return NextResponse.json(
        { ok: false, error: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
      tenant: admin.tenant,
    });
  } catch (error) {
    console.error("Me error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
