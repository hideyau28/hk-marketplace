import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie, validateAdminSecret } from "@/lib/admin/session";

export const runtime = "nodejs";

/**
 * GET /api/admin/tenants
 * Returns all active tenants. Requires super admin auth (admin_session cookie or x-admin-secret header).
 */
export async function GET(req: Request) {
  try {
    // Check x-admin-secret header or admin_session cookie
    const headerSecret = req.headers.get("x-admin-secret");
    const isSecretValid = headerSecret ? validateAdminSecret(headerSecret) : false;
    const isSessionValid = !isSecretValid ? await getSessionFromCookie() : false;

    if (!isSecretValid && !isSessionValid) {
      return NextResponse.json(
        { ok: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const tenants = await prisma.tenant.findMany({
      where: { status: "active" },
      select: {
        id: true,
        name: true,
        slug: true,
        mode: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ ok: true, tenants });
  } catch (error) {
    console.error("List tenants error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to list tenants" },
      { status: 500 }
    );
  }
}
