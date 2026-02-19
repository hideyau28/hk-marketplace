export const runtime = "nodejs";

import { ok, withApi, ApiError } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateStripeCustomer,
  createSubscriptionCheckout,
  getStripePriceId,
  type SubscriptionPlan,
} from "@/lib/stripe-subscription";

/**
 * POST /api/admin/subscription/checkout
 * Body: { plan: "lite" | "pro", successUrl?: string, cancelUrl?: string }
 * Returns: { url: string } — Stripe Checkout URL
 */
export const POST = withApi(async (req) => {
  const { tenantId, email } = await authenticateAdmin(req);

  const body = await req.json();
  const plan = body.plan as string;

  if (plan !== "lite" && plan !== "pro") {
    throw new ApiError(400, "BAD_REQUEST", "Plan must be lite or pro");
  }

  const priceId = getStripePriceId(plan as SubscriptionPlan);
  if (!priceId) {
    throw new ApiError(
      500,
      "INTERNAL",
      `Stripe Price ID not configured for ${plan}. Set STRIPE_PRICE_${plan.toUpperCase()}_MONTHLY env var.`
    );
  }

  // 取得 tenant 資料
  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      plan: true,
    },
  });

  // 如果已經有 active subscription，唔可以再建新嘅
  if (tenant.stripeSubscriptionId && tenant.plan === plan) {
    throw new ApiError(400, "BAD_REQUEST", "Already subscribed to this plan. Use the billing portal to manage.");
  }

  // 確保有 Stripe Customer
  const adminEmail = email || `admin@${tenant.id}.tenant`;
  const customerId = await getOrCreateStripeCustomer(
    tenantId,
    adminEmail,
    tenant.name,
    tenant.stripeCustomerId
  );

  // 更新 tenant 嘅 stripeCustomerId
  if (customerId !== tenant.stripeCustomerId) {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { stripeCustomerId: customerId },
    });
  }

  // 建 Stripe Checkout Session
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_URL is required");
  const successUrl = body.successUrl || `${baseUrl}/admin/billing?session_id={CHECKOUT_SESSION_ID}&success=1`;
  const cancelUrl = body.cancelUrl || `${baseUrl}/admin/billing?cancelled=1`;

  const checkoutUrl = await createSubscriptionCheckout({
    customerId,
    priceId,
    tenantId,
    successUrl,
    cancelUrl,
  });

  return ok(req, { url: checkoutUrl });
});
