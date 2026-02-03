import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSessionUser(request);

    if (!session) {
      return NextResponse.json(
        { ok: false, error: { code: "UNAUTHORIZED", message: "未登入" } },
        { status: 401 }
      );
    }

    // Get user's orders, newest first
    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        items: true,
        amounts: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        fulfillmentType: true,
        fulfillmentAddress: true,
        customerName: true,
        phone: true,
        email: true,
        note: true,
        trackingNumber: true,
        createdAt: true,
        confirmedAt: true,
        processingAt: true,
        shippedAt: true,
        deliveredAt: true,
        completedAt: true,
        cancelledAt: true,
        refundedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: { orders },
    });
  } catch (error) {
    console.error("[auth/orders] Error:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "伺服器錯誤" } },
      { status: 500 }
    );
  }
}
