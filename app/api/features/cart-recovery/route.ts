export const runtime = "nodejs";

import { ok, withApi } from "@/lib/api/route-helpers";
import { getTenantId } from "@/lib/tenant";
import { hasFeature } from "@/lib/plan";

// GET /api/features/cart-recovery — checks if cart_recovery feature is available
export const GET = withApi(async (req) => {
  const tenantId = await getTenantId(req);
  const enabled = await hasFeature(tenantId, "cart_recovery");
  return ok(req, { enabled });
});
