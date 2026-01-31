import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie, validateAdminSecret } from "@/lib/admin/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
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

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ ok: false, error: "Login failed" }, { status: 500 });
  }
}
