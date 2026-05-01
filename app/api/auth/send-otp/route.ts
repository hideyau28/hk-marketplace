import { NextRequest, NextResponse } from "next/server";
import {
  generateOTP,
  storeOTP,
  validateHKPhone,
  normalizePhone,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { withRateLimit } from "@/lib/api/rate-limit-middleware";

// Per-IP: 10 requests / 15 min (prevent bulk enumeration)
const ipLimiter = withRateLimit(
  { interval: 15 * 60 * 1000, maxRequests: 10 },
  { keyPrefix: "send-otp:ip" },
);

// Per-phone config: 3 requests / 15 min (prevent spamming one number)
const PHONE_LIMIT = { interval: 15 * 60 * 1000, maxRequests: 3 };

export async function POST(request: NextRequest) {
  // Check IP rate limit first (before parsing body)
  const ipBlock = await ipLimiter(request);
  if (ipBlock) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "RATE_LIMIT_EXCEEDED", message: "請稍後再試" },
      },
      { status: 429, headers: Object.fromEntries(ipBlock.headers.entries()) },
    );
  }

  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "MISSING_PHONE", message: "電話號碼為必填" },
        },
        { status: 400 },
      );
    }

    // Validate HK phone format
    if (!validateHKPhone(phone)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_PHONE",
            message: "請輸入有效嘅香港電話號碼（8位數字）",
          },
        },
        { status: 400 },
      );
    }

    const normalizedPhone = normalizePhone(phone);

    // Check per-phone rate limit (after validation, before sending OTP)
    const phoneResult = await rateLimit(`send-otp:phone:${normalizedPhone}`, PHONE_LIMIT);
    if (!phoneResult.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "RATE_LIMIT_EXCEEDED", message: "請稍後再試" },
        },
        { status: 429 },
      );
    }

    const otp = generateOTP();

    // Store OTP
    await storeOTP(normalizedPhone, otp);

    // Only expose OTP in local development — never in Preview, staging, or production.
    // NODE_ENV === "development" only matches `next dev`; Vercel Preview runs as "production".
    const isDevMode = process.env.NODE_ENV === "development";

    return NextResponse.json({
      ok: true,
      data: {
        message: "驗證碼已發送",
        // Only include OTP in local dev
        ...(isDevMode && { otp, demoMode: true }),
      },
    });
  } catch (error) {
    console.error("[send-otp] Error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "伺服器錯誤" } },
      { status: 500 },
    );
  }
}
