import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

// PUT /api/payment-methods/[id] - Update payment method (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin auth
    const adminSecret = req.headers.get("x-admin-secret");
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNAUTHORIZED",
            message: "未授權",
          },
        },
        { status: 401 }
      );
    }

    const tenantId = await getTenantId(req);
    const { id } = await params;

    const existing = await prisma.paymentMethod.findFirst({ where: { id, tenantId } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "找不到付款方式" } }, { status: 404 });
    }

    const body = await req.json();

    const { qrImage, accountInfo, active } = body;

    const updateData: Record<string, unknown> = {};
    if (qrImage !== undefined) updateData.qrImage = qrImage;
    if (accountInfo !== undefined) updateData.accountInfo = accountInfo;
    if (active !== undefined) updateData.active = active;

    await prisma.paymentMethod.updateMany({ where: { id, tenantId }, data: updateData });
    const method = await prisma.paymentMethod.findFirst({ where: { id, tenantId } });

    return NextResponse.json({
      ok: true,
      data: method,
    });
  } catch (error) {
    console.error("Failed to update payment method:", error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UPDATE_ERROR",
          message: "更新失敗",
        },
      },
      { status: 500 }
    );
  }
}

// GET /api/payment-methods/[id] - Get single payment method (admin)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantId(req);
    const { id } = await params;

    const method = await prisma.paymentMethod.findFirst({
      where: { id, tenantId },
    });

    if (!method) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "NOT_FOUND",
            message: "找不到付款方式",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: method,
    });
  } catch (error) {
    console.error("Failed to fetch payment method:", error);
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
