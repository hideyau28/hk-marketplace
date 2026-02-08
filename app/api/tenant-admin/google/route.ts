import { NextResponse } from "next/server";
import { buildGoogleAuthUrl } from "@/lib/auth/google-oauth";

export async function GET() {
  try {
    const url = buildGoogleAuthUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Google OAuth redirect error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to initiate Google login" },
      { status: 500 }
    );
  }
}
