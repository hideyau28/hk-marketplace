export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";

// GET /api/orders/:id/track (customer)
export const GET = withApi(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  if (!id) {
    throw new ApiError(400, "BAD_REQUEST", "Order id is required");
  }

  const order = await prisma.order.findUnique({
    where: { id },
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
