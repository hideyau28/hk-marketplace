import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { authenticateAdmin } from "@/lib/auth/admin-auth";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    // Unified admin auth
    await authenticateAdmin(req);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "No file provided",
          },
        },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "hk-marketplace",
      resource_type: "auto",
    });

    return NextResponse.json({
      ok: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    // If it's an auth error, return proper status
    if (error && typeof error === "object" && "status" in error) {
      const apiErr = error as { status: number; code: string; message: string };
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: apiErr.code || "UNAUTHORIZED",
            message: apiErr.message || "Authentication required",
          },
        },
        { status: apiErr.status }
      );
    }

    console.error("Upload error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UPLOAD_ERROR",
          message: error instanceof Error ? error.message : "Failed to upload image",
        },
      },
      { status: 500 }
    );
  }
}
