export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail, ApiError } from "@/lib/api/route-helpers";

// GET /api/tenant/branding — public, no auth required
export async function GET(req: Request) {
  try {
    const { getTenantId } = await import("@/lib/tenant");
    const tenantId = await getTenantId(req);
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        name: true,
        slug: true,
        themeColor: true,
        logoUrl: true,
        currency: true,
        languages: true,
      },
    });

    if (!tenant) {
      throw new ApiError(404, "NOT_FOUND", "Tenant not found");
    }

    return ok(req, {
      name: tenant.name,
      slug: tenant.slug,
      themeColor: tenant.themeColor,
      logoUrl: tenant.logoUrl ?? null,
      currency: tenant.currency,
      languages: tenant.languages,
    });
  } catch (e) {
    return fail(req, e);
  }
}
