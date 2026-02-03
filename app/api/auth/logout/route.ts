import { NextResponse } from "next/server";

const COOKIE_NAME = "hk_session";

export async function POST() {
  const response = NextResponse.json({
    ok: true,
    data: { message: "已登出" },
  });

  // Clear the session cookie
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  return response;
}
