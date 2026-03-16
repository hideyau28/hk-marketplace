import { ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

// GET /api/tenant/config — public endpoint for tenant region/currency/delivery config
export const GET = withApi(async (req) => {
  const tenantId = await getTenantId(req);

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      region: true,
      currency: true,
      deliveryOptions: true,
      freeShippingThreshold: true,
    },
  });

  if (!tenant) {
    return ok(req, {
      region: "HK",
      currency: "HKD",
      deliveryOptions: [],
      freeShippingThreshold: null,
    });
  }

  return ok(req, {
    region: tenant.region || "HK",
    currency: tenant.currency || "HKD",
    deliveryOptions: tenant.deliveryOptions || [],
    freeShippingThreshold: tenant.freeShippingThreshold,
  });
});
