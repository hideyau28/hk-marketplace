export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";

// GET /api/biolink/orders/[id]/track?phone=12345678
// Public endpoint — verifies order access via phone number
export const GET = withApi(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const url = new URL(req.url);
    const phone = url.searchParams.get("phone")?.trim();

    if (!phone || !/^\d{8}$/.test(phone)) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "請輸入 8 位電話號碼",
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        phone: true,
        customerName: true,
        items: true,
        amounts: true,
        fulfillmentType: true,
        fulfillmentAddress: true,
        trackingNumber: true,
        paymentStatus: true,
        statusHistory: true,
        createdAt: true,
        updatedAt: true,
        paidAt: true,
        confirmedAt: true,
        processingAt: true,
        shippedAt: true,
        deliveredAt: true,
        completedAt: true,
        tenant: {
          select: { name: true, slug: true, currency: true },
        },
      },
    });

    if (!order) {
      throw new ApiError(404, "NOT_FOUND", "找不到訂單");
    }

    // Verify phone matches (strip +852 prefix if present)
    const orderPhone = (order.phone || "").replace(/^\+852/, "").trim();
    if (orderPhone !== phone) {
      throw new ApiError(403, "FORBIDDEN", "電話號碼不符");
    }

    const amounts = order.amounts as Record<string, unknown> | null;
    const items = Array.isArray(order.items)
      ? (order.items as Record<string, unknown>[])
      : [];
    const fulfillmentAddress = order.fulfillmentAddress as Record<
      string,
      unknown
    > | null;
    const statusHistory = Array.isArray(order.statusHistory)
      ? (order.statusHistory as Record<string, unknown>[])
      : [];

    return ok(req, {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      items: items.map((item) => ({
        name: String(item.name || item.title || ""),
        qty: Number(item.quantity ?? item.qty ?? 0),
        unitPrice: Number(item.unitPrice ?? item.price ?? 0),
        image: item.image || item.imageUrl || null,
      })),
      amounts: {
        subtotal: Number(amounts?.subtotal ?? 0),
        deliveryFee: Number(amounts?.deliveryFee ?? 0),
        discount: Number(amounts?.discount ?? 0),
        total: Number(amounts?.total ?? 0),
        currency: String(amounts?.currency || order.tenant.currency || "HKD"),
      },
      delivery: {
        method: order.fulfillmentType || "unknown",
        address: fulfillmentAddress?.address || null,
      },
      trackingNumber: order.trackingNumber,
      paymentStatus: order.paymentStatus,
      statusHistory,
      timestamps: {
        created: order.createdAt.toISOString(),
        updated: order.updatedAt.toISOString(),
        paid: order.paidAt?.toISOString() || null,
        confirmed: order.confirmedAt?.toISOString() || null,
        processing: order.processingAt?.toISOString() || null,
        shipped: order.shippedAt?.toISOString() || null,
        delivered: order.deliveredAt?.toISOString() || null,
        completed: order.completedAt?.toISOString() || null,
      },
      store: {
        name: order.tenant.name,
        slug: order.tenant.slug,
      },
    });
  },
);
