export const runtime = "nodejs";

import Stripe from "stripe";
import { Prisma } from "@prisma/client";
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
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new ApiError(400, "BAD_REQUEST", `Invalid signature: ${msg || "unknown"}`);
  }

  // Best-effort: never fail the webhook just because our DB update didn't apply.
  // Stripe will retry; but we also want these logs to be actionable.
  const log = (level: "info" | "warn" | "error", msg: string, meta?: Record<string, unknown>) => {
    const base = {
      stripeEventId: event.id,
      stripeEventType: event.type,
      ...meta,
    };
    console[level](`[stripe-webhook] ${msg}`, base);
  };

  type OrderUpdateData = Prisma.OrderUpdateInput | Prisma.OrderUncheckedUpdateInput;
  const updateByOrderId = async (orderId: string, data: OrderUpdateData) => {
    try {
      await prisma.order.update({ where: { id: orderId }, data: data as Prisma.OrderUpdateArgs["data"] });
      return true;
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      log("warn", "Order update failed", { orderId, err });
      return false;
    }
  };

  type OrderUpdateManyData = Prisma.OrderUpdateManyMutationInput | Prisma.OrderUncheckedUpdateManyInput;
  const updateByPaymentIntent = async (paymentIntentId: string, data: OrderUpdateManyData) => {
    try {
      const res = await prisma.order.updateMany({
        where: { stripePaymentIntentId: paymentIntentId },
        data: data as Prisma.OrderUpdateManyArgs["data"],
      });
      return res.count;
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      log("warn", "Order updateMany failed", { paymentIntentId, err });
      return 0;
    }
  };

  const updateAttemptBySessionId = async (sessionId: string, data: Prisma.PaymentAttemptUpdateManyMutationInput) => {
    try {
      await prisma.paymentAttempt.updateMany({
        where: { provider: "STRIPE", stripeCheckoutSessionId: sessionId },
        data,
      });
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      log("warn", "PaymentAttempt updateMany failed", { sessionId, err });
    }
  };

  const updateAttemptByPaymentIntentId = async (
    paymentIntentId: string,
    data: Prisma.PaymentAttemptUpdateManyMutationInput
  ) => {
    try {
      await prisma.paymentAttempt.updateMany({
        where: { provider: "STRIPE", stripePaymentIntentId: paymentIntentId },
        data,
      });
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      log("warn", "PaymentAttempt updateMany failed", { paymentIntentId, err });
    }
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = String(session.metadata?.orderId || "").trim();

        await updateAttemptBySessionId(session.id, {
          status: "SUCCEEDED",
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
          lastEventId: event.id,
          lastEventType: event.type,
          lastEvent: event as unknown as Prisma.InputJsonValue,
        });

        if (!orderId) {
          log("warn", "Missing orderId in session.metadata", { sessionId: session.id });
          break;
        }

        await updateByOrderId(orderId, {
          status: "PAID",
          paidAt: new Date(),
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        });

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;

        await updateAttemptBySessionId(session.id, {
          status: "CANCELLED",
          lastEventId: event.id,
          lastEventType: event.type,
          lastEvent: event as unknown as Prisma.InputJsonValue,
        });

        // Keep order as-is; an expired session is not necessarily an order cancellation.
        log("info", "session expired recorded", { sessionId: session.id });
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const pid = typeof pi.id === "string" ? pi.id : "";
        if (!pid) break;

        await updateAttemptByPaymentIntentId(pid, {
          status: "SUCCEEDED",
          lastEventId: event.id,
          lastEventType: event.type,
          lastEvent: event as unknown as Prisma.InputJsonValue,
        });

        await updateByPaymentIntent(pid, {
          status: "PAID",
          paidAt: new Date(),
        });

        log("info", "payment_intent.succeeded recorded", { paymentIntentId: pid });
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const pid = typeof pi.id === "string" ? pi.id : "";
        if (!pid) break;

        await updateAttemptByPaymentIntentId(pid, {
          status: "FAILED",
          failureCode: typeof pi.last_payment_error?.code === "string" ? pi.last_payment_error.code : undefined,
          failureMessage:
            typeof pi.last_payment_error?.message === "string" ? pi.last_payment_error.message : undefined,
          lastEventId: event.id,
          lastEventType: event.type,
          lastEvent: event as unknown as Prisma.InputJsonValue,
        });

        // Keep order as-is; a failed payment attempt is not necessarily an order cancellation.
        log("info", "payment_failed recorded", { paymentIntentId: pid });
        break;
      }

      case "payment_intent.canceled": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const pid = typeof pi.id === "string" ? pi.id : "";
        if (!pid) break;

        await updateAttemptByPaymentIntentId(pid, {
          status: "CANCELLED",
          lastEventId: event.id,
          lastEventType: event.type,
          lastEvent: event as unknown as Prisma.InputJsonValue,
        });

        log("info", "payment_intent.canceled recorded", { paymentIntentId: pid });
        break;
      }

      case "charge.refunded": {
        const ch = event.data.object as Stripe.Charge;
        const pid = typeof ch.payment_intent === "string" ? ch.payment_intent : "";
        if (!pid) break;

        await updateAttemptByPaymentIntentId(pid, {
          status: "REFUNDED",
          stripeChargeId: ch.id,
          lastEventId: event.id,
          lastEventType: event.type,
          lastEvent: event as unknown as Prisma.InputJsonValue,
        });

        await updateByPaymentIntent(pid, {
          status: "REFUNDED",
        });

        log("info", "refund applied", { paymentIntentId: pid });
        break;
      }

      case "charge.dispute.created":
      case "charge.dispute.updated":
      case "charge.dispute.closed": {
        const dispute = event.data.object as Stripe.Dispute;
        const chargeId = typeof dispute.charge === "string" ? dispute.charge : "";
        if (!chargeId) break;

        // Try to resolve payment_intent via charge lookup.
        try {
          const ch = await stripe.charges.retrieve(chargeId);
          const pid = typeof ch.payment_intent === "string" ? ch.payment_intent : "";

          if (pid) {
            await updateAttemptByPaymentIntentId(pid, {
              status: "DISPUTED",
              stripeChargeId: ch.id,
              lastEventId: event.id,
              lastEventType: event.type,
              lastEvent: event as unknown as Prisma.InputJsonValue,
            });

            const updated = await updateByPaymentIntent(pid, { status: "DISPUTED" });
            log("info", "dispute applied", { chargeId, paymentIntentId: pid, updated });
          } else {
            log("warn", "Dispute charge has no payment_intent", { chargeId });
          }
        } catch (e: unknown) {
          const err = e instanceof Error ? e.message : String(e);
          log("warn", "Failed to retrieve charge for dispute", { chargeId, err });
        }

        break;
      }

      default:
        // Ignore other event types.
        break;
    }
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    log("error", "Unhandled webhook handler exception", { err });
  }

  return ok(req, { received: true });
});
