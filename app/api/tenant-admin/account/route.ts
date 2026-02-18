import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth/jwt";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PATCH(req: Request) {
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

    const body = await req.json();
    const { type } = body as { type?: string };

    if (type === "email") {
      const { newEmail } = body as { newEmail?: string };

      if (!newEmail || !EMAIL_REGEX.test(newEmail.trim())) {
        return NextResponse.json(
          { ok: false, error: "Invalid email format" },
          { status: 400 }
        );
      }

      const normalizedEmail = newEmail.trim().toLowerCase();

      // Check uniqueness
      const existing = await prisma.tenantAdmin.findUnique({
        where: { email: normalizedEmail },
      });
      if (existing && existing.id !== payload.adminId) {
        return NextResponse.json(
          { ok: false, error: "Email already in use" },
          { status: 409 }
        );
      }

      await prisma.tenantAdmin.update({
        where: { id: payload.adminId },
        data: { email: normalizedEmail },
      });

      return NextResponse.json({ ok: true, email: normalizedEmail });
    }

    if (type === "password") {
      const { currentPassword, newPassword } = body as {
        currentPassword?: string;
        newPassword?: string;
      };

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { ok: false, error: "Current password and new password are required" },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { ok: false, error: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }

      const admin = await prisma.tenantAdmin.findUnique({
        where: { id: payload.adminId },
      });

      if (!admin) {
        return NextResponse.json(
          { ok: false, error: "Admin not found" },
          { status: 404 }
        );
      }

      // OAuth 用戶冇密碼，唔可以用 password change flow
      if (!admin.passwordHash) {
        return NextResponse.json(
          { ok: false, error: "此帳號使用 Google 登入，無法更改密碼" },
          { status: 400 }
        );
      }

      const valid = await verifyPassword(currentPassword, admin.passwordHash);
      if (!valid) {
        return NextResponse.json(
          { ok: false, error: "Current password is incorrect" },
          { status: 401 }
        );
      }

      const newHash = await hashPassword(newPassword);
      await prisma.tenantAdmin.update({
        where: { id: payload.adminId },
        data: { passwordHash: newHash },
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: "Invalid type. Use 'email' or 'password'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Account update error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
