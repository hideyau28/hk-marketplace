import { NextRequest, NextResponse } from "next/server";
import {
  generateOTP,
  storeOTP,
  validateEmail,
  normalizeEmail,
  OTP_EXPIRY_MINUTES,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { withRateLimit } from "@/lib/api/rate-limit-middleware";
import { sendEmail } from "@/lib/email/send";
import OtpEmail from "@/lib/email/templates/OtpEmail";

// Per-IP: 10 requests / 15 min (prevent bulk enumeration)
const ipLimiter = withRateLimit(
  { interval: 15 * 60 * 1000, maxRequests: 10 },
  { keyPrefix: "send-otp:ip" },
);

// Per-email: 3 requests / 15 min (prevent spamming one inbox)
const EMAIL_LIMIT = { interval: 15 * 60 * 1000, maxRequests: 3 };

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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "MISSING_EMAIL", message: "電郵為必填" },
        },
        { status: 400 },
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_EMAIL",
            message: "請輸入有效嘅電郵地址",
          },
        },
        { status: 400 },
      );
    }

    const normalizedEmail = normalizeEmail(email);

    // Check per-email rate limit (after validation, before sending OTP)
    const emailResult = await rateLimit(
      `send-otp:email:${normalizedEmail}`,
      EMAIL_LIMIT,
    );
    if (!emailResult.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "RATE_LIMIT_EXCEEDED", message: "請稍後再試" },
        },
        { status: 429 },
      );
    }

    const otp = generateOTP();

    // Store OTP keyed by email (OtpCode.phone column is a generic identifier)
    await storeOTP(normalizedEmail, otp);

    // Send OTP via Resend (falls back to console.log when RESEND_API_KEY unset)
    const sendResult = await sendEmail({
      to: normalizedEmail,
      subject: `Your WoWlix verification code: ${otp}`,
      template: OtpEmail({ code: otp, expiresInMinutes: OTP_EXPIRY_MINUTES }),
    });

    if (!sendResult.ok) {
      console.error("[send-otp] Email delivery failed:", sendResult.error);
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "EMAIL_SEND_FAILED",
            message: "驗證碼發送失敗，請稍後再試",
          },
        },
        { status: 502 },
      );
    }

    // Only expose OTP in local development — never in Preview, staging, or production.
    // NODE_ENV === "development" only matches `next dev`; Vercel Preview runs as "production".
    const isDevMode = process.env.NODE_ENV === "development";

    return NextResponse.json({
      ok: true,
      data: {
        message: "驗證碼已發送至您嘅電郵",
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
