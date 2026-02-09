export const runtime = "nodejs";

import { ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/orders/count?status=PENDING
export const GET = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status")?.trim().toUpperCase();

  const where: Record<string, unknown> = { tenantId };
  if (statusParam) {
    where.status = statusParam;
  }

  const count = await prisma.order.count({ where });

  return ok(req, { count });
});
