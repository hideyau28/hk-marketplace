import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, email, password } = body as {
      tenantId?: string;
      email?: string;
      password?: string;
    };

    if (!tenantId || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "tenantId, email, and password are required" },
        { status: 400 }
      );
    }

    // Verify tenant exists and is active
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json(
        { ok: false, error: "Tenant not found" },
        { status: 404 }
      );
    }

    if (tenant.status !== "active") {
      return NextResponse.json(
        { ok: false, error: "Tenant is not active" },
        { status: 403 }
      );
    }

    // Verify email is not already used
    const existing = await prisma.tenantAdmin.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password and create admin
    const passwordHash = await hashPassword(password);
    const admin = await prisma.tenantAdmin.create({
      data: {
        tenantId,
        email,
        passwordHash,
      },
    });

    return NextResponse.json({
      ok: true,
      admin: { id: admin.id, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
