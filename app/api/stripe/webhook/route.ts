export const runtime = "nodejs";

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { ApiError, ok, withApi } from "@/lib/api/route-helpers";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new ApiError(500, "INTERNAL", "STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key, {
    // Keep default (latest) API version for this stripe-node release.
  });
}

export const POST = withApi(async (req) => {
  const stripe = getStripe();
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whsec) {
    throw new ApiError(500, "INTERNAL", "STRIPE_WEBHOOK_SECRET is not configured");
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) throw new ApiError(400, "BAD_REQUEST", "Missing stripe-signature");

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whsec);
  } catch (e: any) {
    throw new ApiError(400, "BAD_REQUEST", `Invalid signature: ${e?.message || "unknown"}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = String(session.metadata?.orderId || "").trim();
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        },
      }).catch(() => null);
    }
  }

  return ok(req, { received: true });
});
