export const runtime = "nodejs";

import { ok, withApi } from "@/lib/api/route-helpers";
import { getTenantId } from "@/lib/tenant";
import { hasFeature } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

// GET /api/features/coupon — public, checks if coupon feature is available
// Supports ?slug=xxx for biolink context (path-based routes)
export const GET = withApi(async (req) => {
  let tenantId: string;

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (slug) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });
    if (!tenant || tenant.status !== "active") {
      return ok(req, { enabled: false });
    }
    tenantId = tenant.id;
  } else {
    tenantId = await getTenantId(req);
  }

  const enabled = await hasFeature(tenantId, "coupon");
  return ok(req, { enabled });
});
