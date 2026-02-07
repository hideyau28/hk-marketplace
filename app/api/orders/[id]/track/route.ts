export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

// GET /api/orders/:id/track (customer)
export const GET = withApi(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const tenantId = await getTenantId(req);
  if (!id) {
    throw new ApiError(400, "BAD_REQUEST", "Order id is required");
  }

  const order = await prisma.order.findFirst({
    where: { id, tenantId },
    select: {
      id: true,
      status: true,
      createdAt: true,
      paidAt: true,
      fulfillingAt: true,
      shippedAt: true,
      completedAt: true,
      cancelledAt: true,
      refundedAt: true,
      disputedAt: true,
    },
  });

  if (!order) {
    throw new ApiError(404, "NOT_FOUND", "Order not found");
  }

  return ok(req, order);
});
