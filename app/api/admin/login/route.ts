import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie, validateAdminSecret } from "@/lib/admin/session";
import { withRateLimit } from "@/lib/api/rate-limit-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { logAdminActivity, ADMIN_ACTIONS } from "@/lib/admin/activity-log";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Apply rate limiting for auth endpoints
  const rateLimitResponse = withRateLimit(RATE_LIMITS.AUTH, {
    keyPrefix: "admin-login",
  })(request);

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    if (!process.env.ADMIN_SECRET) {
      return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 500 });
    }

    const body = await request.json();
    const { secret } = body;

    if (!secret || typeof secret !== "string") {
      return NextResponse.json({ ok: false, error: "Secret is required" }, { status: 400 });
    }

    if (!validateAdminSecret(secret)) {
      return NextResponse.json({ ok: false, error: "Invalid admin secret" }, { status: 401 });
    }

    const token = await createSession();
    await setSessionCookie(token);

    // Log admin login
    await logAdminActivity({
      action: ADMIN_ACTIONS.LOGIN,
      request,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ ok: false, error: "Login failed" }, { status: 500 });
  }
}
