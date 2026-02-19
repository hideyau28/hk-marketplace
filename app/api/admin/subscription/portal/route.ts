export const runtime = "nodejs";

import { ok, withApi, ApiError } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";
import { createCustomerPortalSession } from "@/lib/stripe-subscription";

/**
 * POST /api/admin/subscription/portal
 * Returns: { url: string } — Stripe Customer Portal URL
 * 用嚟管理信用卡、取消訂閱等
 */
export const POST = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    select: { stripeCustomerId: true },
  });

  if (!tenant.stripeCustomerId) {
    throw new ApiError(400, "BAD_REQUEST", "No Stripe customer found. Please subscribe first.");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_URL is required");
  const returnUrl = `${baseUrl}/admin/billing`;

  const portalUrl = await createCustomerPortalSession({
    customerId: tenant.stripeCustomerId,
    returnUrl,
  });

  return ok(req, { url: portalUrl });
});
