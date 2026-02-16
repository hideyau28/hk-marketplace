import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

// GET /api/payment-methods - Get active payment methods (public)
export async function GET(request: Request) {
  try {
    let tenantId: string | null = null;

    // Support ?tenant=<slug> query param (same pattern as payment-config)
    const url = new URL(request.url);
    const tenantParam = url.searchParams.get("tenant");
    if (tenantParam) {
      const t = await prisma.tenant.findUnique({
        where: { slug: tenantParam },
        select: { id: true },
      });
      if (t) tenantId = t.id;
    }

    if (!tenantId) {
      tenantId = await getTenantId(request);
    }

    const methods = await prisma.paymentMethod.findMany({
      where: { active: true, tenantId },
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
