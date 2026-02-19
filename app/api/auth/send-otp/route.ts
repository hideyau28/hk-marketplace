import { NextResponse } from "next/server";
import { generateOTP, storeOTP, validateHKPhone, normalizePhone } from "@/lib/auth";

export async function POST(request: Request) {
  try {
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
    await storeOTP(normalizedPhone, otp);

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
