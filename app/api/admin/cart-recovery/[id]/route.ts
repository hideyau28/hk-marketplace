export const runtime = "nodejs";

import { ok, withApi, ApiError } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { hasFeature } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["contacted", "recovered", "dismissed"] as const;

// PATCH /api/admin/cart-recovery/[id]
export const PATCH = withApi(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { tenantId } = await authenticateAdmin(req);

  if (!(await hasFeature(tenantId, "cart_recovery"))) {
    throw new ApiError(403, "FORBIDDEN", "This feature requires Lite/Pro plan");
  }

  const { id } = await ctx.params;

  const body = await req.json();
  const { recoveryStatus } = body;

  if (!recoveryStatus || !VALID_STATUSES.includes(recoveryStatus)) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      `Invalid recoveryStatus. Must be one of: ${VALID_STATUSES.join(", ")}`
    );
  }

  // 確認訂單存在且屬於此 tenant
  const order = await prisma.order.findFirst({
    where: { id, tenantId },
    select: { id: true, status: true },
  });

  if (!order) {
    throw new ApiError(404, "NOT_FOUND", "Order not found");
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { recoveryStatus },
    select: {
      id: true,
      recoveryStatus: true,
    },
  });

  return ok(req, updated);
});
