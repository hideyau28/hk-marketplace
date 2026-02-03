import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/payment-methods - Get active payment methods (public)
export async function GET() {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        qrImage: true,
        accountInfo: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: { methods },
    });
  } catch (error) {
    console.error("Failed to fetch payment methods:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FETCH_ERROR",
          message: "無法載入付款方式",
        },
      },
      { status: 500 }
    );
  }
}
