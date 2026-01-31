import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/admin/session";

export const runtime = "nodejs";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ ok: false, error: "Logout failed" }, { status: 500 });
  }
}
