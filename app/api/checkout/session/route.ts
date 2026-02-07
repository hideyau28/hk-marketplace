export const runtime = "nodejs";

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { getTenantId } from "@/lib/tenant";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new ApiError(500, "INTERNAL", "STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, {
    // Keep default (latest) API version for this stripe-node release.
  });
}

type Body = {
  orderId: string;
  locale?: string;
};

export const POST = withApi(async (req) => {
  const stripe = getStripe();
  const tenantId = await getTenantId(req);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  const orderId = (body?.orderId || "").trim();
  if (!orderId) throw new ApiError(400, "BAD_REQUEST", "orderId is required");

  const order = await prisma.order.findFirst({ where: { id: orderId, tenantId } });
  if (!order) throw new ApiError(404, "NOT_FOUND", "Order not found");

  const amounts: any = order.amounts;
  const currency = String(amounts?.currency || "HKD").toLowerCase();

  const items: any[] = Array.isArray(order.items) ? (order.items as any[]) : [];
  if (items.length === 0) throw new ApiError(400, "BAD_REQUEST", "Order has no items");

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((it) => {
    const name = String(it?.name || it?.title || "Item");
    const unitPrice = Number(it?.unitPrice ?? it?.price);
    const quantity = Number(it?.quantity ?? it?.qty);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new ApiError(400, "BAD_REQUEST", `Invalid unitPrice for item: ${name}`);
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new ApiError(400, "BAD_REQUEST", `Invalid quantity for item: ${name}`);
    }

    return {
      price_data: {
        currency,
        product_data: { name },
        unit_amount: Math.round(unitPrice * 100),
      },
      quantity: Math.floor(quantity),
    };
  });

  // Delivery fee (v1 fixed HKD 30)
  if (order.fulfillmentType === "DELIVERY") {
    line_items.push({
      price_data: {
        currency,
        product_data: { name: "Delivery fee" },
        unit_amount: 30 * 100,
      },
      quantity: 1,
    });
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3012";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const locale = (body.locale || "zh-HK").trim();

  // Prefer explicit base URL for correctness behind proxies / local dev.
  const baseUrl = (process.env.APP_URL || `${proto}://${host}`).replace(/\/$/, "");

  const successUrl = `${baseUrl}/${locale}/orders/${orderId}?payment=success`;
  const cancelUrl = `${baseUrl}/${locale}/checkout?orderId=${orderId}&payment=cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderId,
    },
  });

  // Track as a payment attempt (canonical record)
  await prisma.paymentAttempt.create({
    data: {
      provider: "STRIPE",
      tenantId,
      status: "CREATED",
      orderId,
      amount: typeof session.amount_total === "number" ? session.amount_total : null,
      currency: typeof session.currency === "string" ? session.currency : null,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
      lastEventType: "checkout.session.created",
      lastEvent: session as unknown as import("@prisma/client").Prisma.InputJsonValue,
    },
  }).catch(() => null);

  // Legacy fields (for backward compatibility)
  await prisma.order.update({
    where: { id: orderId },
    data: {
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
    },
  });

  if (!session.url) throw new ApiError(500, "INTERNAL", "Stripe session URL missing");

  return ok(req, { url: session.url });
});
