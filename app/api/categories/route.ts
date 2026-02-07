export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { ok } from "@/lib/api/route-helpers";
import { withApi } from "@/lib/api/route-helpers";

// GET /api/categories — public listing of active categories
export const GET = withApi(async (req) => {
  const tenantId = await getTenantId(req);

  const categories = await prisma.category.findMany({
    where: { tenantId, active: true, parentId: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      children: {
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return ok(req, { categories });
});
