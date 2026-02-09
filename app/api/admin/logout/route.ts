import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/admin/session";

export const runtime = "nodejs";

export async function POST() {
  try {
    await clearSessionCookie();

    const response = NextResponse.json({ ok: true });

    // 清除 tenant-admin-token JWT cookie
    response.cookies.set("tenant-admin-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ ok: false, error: "Logout failed" }, { status: 500 });
  }
}
