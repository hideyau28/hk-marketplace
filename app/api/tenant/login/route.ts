import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/admin/session";
import { signToken } from "@/lib/auth/jwt";
import { withApi, ok, ApiError } from "@/lib/api/route-helpers";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST = withApi(async (req: Request) => {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  const { email, password } = body;

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    throw new ApiError(400, "BAD_REQUEST", "請輸入有效嘅 email");
  }

  if (!password || typeof password !== "string") {
    throw new ApiError(400, "BAD_REQUEST", "請輸入密碼");
  }

  const cleanEmail = email.trim().toLowerCase();

  const admin = await prisma.tenantAdmin.findUnique({
    where: { email: cleanEmail },
    include: { tenant: { select: { id: true, status: true } } },
  });

  if (!admin || !admin.passwordHash) {
    throw new ApiError(401, "UNAUTHORIZED", "帳號不存在或未設定密碼");
  }

  if (admin.tenant.status !== "active") {
    throw new ApiError(403, "FORBIDDEN", "商店已停用");
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    throw new ApiError(401, "UNAUTHORIZED", "密碼錯誤");
  }

  // Set admin_session cookie (middleware guard)
  const sessionToken = await createSession();
  const cookieStore = await cookies();
  cookieStore.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24h
    path: "/",
  });

  // Set tenant-admin-token cookie (API auth)
  const adminToken = signToken({
    tenantId: admin.tenant.id,
    adminId: admin.id,
    email: admin.email,
    role: admin.role,
  });
  cookieStore.set("tenant-admin-token", adminToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return ok(req, { ok: true, tenantId: admin.tenant.id });
});
