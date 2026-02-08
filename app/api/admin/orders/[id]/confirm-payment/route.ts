export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/admin/orders/:id/confirm-payment
export const POST = withApi(
  async (req: Request, ctx: RouteContext) => {
    const { tenantId, adminId, email } = await authenticateAdmin(req);
    const { id } = await ctx.params;

    const order = await prisma.order.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        statusHistory: true,
      },
    });

    if (!order) {
      throw new ApiError(404, "NOT_FOUND", "Order not found");
    }

    if (order.status !== "PENDING") {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        `Cannot confirm payment: order status is '${order.status}', expected 'PENDING'`
      );
    }

    const now = new Date();
    const confirmedBy = email || adminId || "super";

    // Build status history
    const history = order.statusHistory
      ? JSON.parse(order.statusHistory)
      : [];
    history.push({
      timestamp: now.toISOString(),
      fromStatus: order.status,
      toStatus: "PAID",
      action: "confirm_payment",
      by: confirmedBy,
    });

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: now,
        paymentStatus: "confirmed",
        paymentConfirmedAt: now,
        paymentConfirmedBy: confirmedBy,
        statusHistory: JSON.stringify(history),
      },
    });

    return ok(req, updated);
  },
  { admin: true }
);
