import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie, validateAdminSecret } from "@/lib/admin/session";
import { withRateLimit } from "@/lib/api/rate-limit-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";
import { logAdminActivity, ADMIN_ACTIONS } from "@/lib/admin/activity-log";
import { getTenantId } from "@/lib/tenant";

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
    const body = await request.json();
    const { secret } = body;

    if (!secret || typeof secret !== "string") {
      return NextResponse.json({ ok: false, error: "Secret is required" }, { status: 400 });
    }

    if (!validateAdminSecret(secret)) {
      return NextResponse.json({ ok: false, error: "Invalid admin secret" }, { status: 401 });
    }

    // Resolve tenant from hostname/headers (ADMIN_SECRET login = super admin, hostname-based)
    const tenantId = await getTenantId(request);
    const token = await createSession(tenantId);
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
