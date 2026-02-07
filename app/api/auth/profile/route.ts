import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getTenantId } from "@/lib/tenant";

export async function PUT(request: Request) {
  try {
    const session = await getSessionUser(request);

    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "未登入" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, address } = body;

    // Validate email format if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { ok: false, error: { code: "INVALID_EMAIL", message: "電郵格式不正確" } },
          { status: 400 }
        );
      }
    }

    const tenantId = await getTenantId(request);

    // Verify user belongs to tenant
    const existingUser = await prisma.user.findFirst({ where: { id: session.userId, tenantId } });
    if (!existingUser) {
      return NextResponse.json(
        { ok: false, error: { code: "USER_NOT_FOUND", message: "用戶不存在" } },
        { status: 404 }
      );
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: name?.trim() || null,
        email: email?.trim() || null,
        address: address?.trim() || null, // Store as JSON string
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          address: user.address,
        },
      },
    });
  } catch (error) {
    console.error("[auth/profile] Error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "伺服器錯誤" } },
      { status: 500 }
    );
  }
}
