import { NextResponse } from "next/server";
import { generateOTP, storeOTP, validateHKPhone, normalizePhone } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/api/route-helpers";

const OTP_RATE_LIMIT = {
  interval: 60 * 1000, // 1 minute
  maxRequests: 3,
};

export async function POST(request: Request) {
  try {
    // Rate limit: 3 requests per minute per IP
    const ip = getClientIp(request);
    const rl = rateLimit(`send-otp:${ip}`, OTP_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: { code: "RATE_LIMITED", message: "請求太頻繁，請稍後再試" } },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { ok: false, error: { code: "MISSING_PHONE", message: "電話號碼為必填" } },
        { status: 400 }
      );
    }

    // Validate HK phone format
    if (!validateHKPhone(phone)) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_PHONE", message: "請輸入有效嘅香港電話號碼（8位數字）" } },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone);
    const otp = generateOTP();

    // Store OTP
    storeOTP(normalizedPhone, otp);

    // In demo mode, return OTP in response for easy testing
    const isDemoMode = process.env.NODE_ENV !== "production";

    return NextResponse.json({
      ok: true,
      data: {
        message: "驗證碼已發送",
        // Only include OTP in demo mode
        ...(isDemoMode && { otp, demoMode: true }),
      },
    });
  } catch (error) {
    console.error("[send-otp] Error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "伺服器錯誤" } },
      { status: 500 }
    );
  }
}
