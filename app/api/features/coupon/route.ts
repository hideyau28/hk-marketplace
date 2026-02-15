export const runtime = "nodejs";

import { ok, withApi } from "@/lib/api/route-helpers";
import { getTenantId } from "@/lib/tenant";
import { hasFeature } from "@/lib/plan";

// GET /api/features/coupon — public, checks if coupon feature is available
export const GET = withApi(async (req) => {
  const tenantId = await getTenantId(req);
  const enabled = await hasFeature(tenantId, "coupon");
  return ok(req, { enabled });
});
