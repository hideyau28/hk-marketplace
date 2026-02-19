import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyOTP,
  validateHKPhone,
  normalizePhone,
  createToken,
} from "@/lib/auth";
import { getTenantId } from "@/lib/tenant";
import { withRateLimit } from "@/lib/api/rate-limit-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";

const COOKIE_NAME = "hk_session";
const rateLimiter = withRateLimit(RATE_LIMITS.AUTH, { keyPrefix: "verify-otp" });

export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_FIELDS", message: "電話號碼同驗證碼為必填" } },
        { status: 400 }
      );
    }

    // Validate HK phone format
    if (!validateHKPhone(phone)) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_PHONE", message: "請輸入有效嘅香港電話號碼" } },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);

    // Verify OTP
    if (!verifyOTP(normalizedPhone, otp)) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_OTP", message: "驗證碼不正確或已過期" } },
        { status: 400 }
      );
    }

    const tenantId = await getTenantId(request);

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { phone: normalizedPhone, tenantId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { phone: normalizedPhone, tenantId },
      });
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      phone: user.phone,
    });

    // Create response with cookie
    const response = NextResponse.json({
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

    // Set httpOnly cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[verify-otp] Error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "伺服器錯誤" } },
      { status: 500 }
    );
  }
}
