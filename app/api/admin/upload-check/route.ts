import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/admin-auth";

export async function GET(req: NextRequest) {
  const result = {
    ok: true,
    auth: false,
    cloudinary: {
      cloudName: false,
      apiKey: false,
    },
  };

  // Check auth
  try {
    await authenticateAdmin(req);
    result.auth = true;
  } catch {
    result.ok = false;
  }

  // Check Cloudinary env vars
  result.cloudinary.cloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
  result.cloudinary.apiKey = !!process.env.CLOUDINARY_API_KEY;

  if (!result.cloudinary.cloudName || !result.cloudinary.apiKey) {
    result.ok = false;
  }

  return NextResponse.json(result, {
    status: result.ok ? 200 : 503,
  });
}
