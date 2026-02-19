export const runtime = "nodejs";

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { ok, ApiError, withApi } from "@/lib/api/route-helpers";
import { getStripe, planFromPriceId, getGracePeriodEnd } from "@/lib/stripe-subscription";

/**
 * POST /api/stripe/subscription-webhook
 *
 * 專門處理 subscription 相關嘅 Stripe webhook events:
 * - checkout.session.completed (subscription mode)
 * - invoice.paid
 * - invoice.payment_failed
 * - customer.subscription.updated
 * - customer.subscription.deleted
 *
 * 用獨立 webhook endpoint + 獨立 webhook secret，
 * 避免同 order payment webhook 撞。
 */

const log = (level: "info" | "warn" | "error", msg: string, meta?: Record<string, unknown>) => {
  console[level](`[stripe-sub-webhook] ${msg}`, meta || {});
};

/** Helper: 從 SubscriptionItem 取 current_period_end (Stripe SDK v20+) */
function getSubPeriodEnd(sub: Stripe.Subscription): Date | null {
  const periodEnd = sub.items?.data?.[0]?.current_period_end;
  return periodEnd ? new Date(periodEnd * 1000) : null;
}

/** Helper: 從 Invoice 取 subscription ID (Stripe SDK v20+ 用 parent.subscription_details) */
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const subRef = invoice.parent?.subscription_details?.subscription;
  if (!subRef) return null;
  return typeof subRef === "string" ? subRef : subRef.id;
}

export const POST = withApi(async (req) => {
  const stripe = getStripe();
  const whsec = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET;
  if (!whsec) {
    throw new ApiError(500, "INTERNAL", "STRIPE_SUBSCRIPTION_WEBHOOK_SECRET is not configured");
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) throw new ApiError(400, "BAD_REQUEST", "Missing stripe-signature");

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, whsec);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new ApiError(400, "BAD_REQUEST", `Invalid signature: ${msg}`);
  }

  try {
    switch (event.type) {
      // ─── Checkout 完成（subscription mode）───
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // 只處理 subscription mode
        if (session.mode !== "subscription") break;

        const tenantId = session.metadata?.tenantId;
        if (!tenantId) {
          log("warn", "checkout.session.completed missing tenantId in metadata", {
            sessionId: session.id,
          });
          break;
        }

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!subscriptionId) {
          log("warn", "checkout.session.completed missing subscription", {
            sessionId: session.id,
          });
          break;
        }

        // 查 subscription 取得 plan 資訊
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items.data[0]?.price?.id || "";
        const plan = planFromPriceId(priceId);

        if (!plan) {
          log("error", "checkout.session.completed: unknown priceId, skipping plan update", {
            priceId,
            subscriptionId,
            tenantId,
          });
          break;
        }

        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            plan,
            stripeCustomerId:
              typeof session.customer === "string"
                ? session.customer
                : session.customer?.id || undefined,
            stripeSubscriptionId: subscriptionId,
            planStartedAt: new Date(),
            planExpiresAt: getSubPeriodEnd(sub),
            planGracePeriodEndsAt: null,
            subscriptionEndsAt: null,
          },
        });

        log("info", "Subscription activated via checkout", {
          tenantId,
          plan,
          subscriptionId,
        });
        break;
      }

      // ─── Invoice 付款成功（續費）───
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = getInvoiceSubscriptionId(invoice);

        if (!subscriptionId) break;

        // 從 subscription metadata 取得 tenantId
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const tenantId = sub.metadata?.tenantId;
        if (!tenantId) {
          log("warn", "invoice.paid: subscription missing tenantId metadata", {
            subscriptionId,
          });
          break;
        }

        const priceId = sub.items.data[0]?.price?.id || "";
        const plan = planFromPriceId(priceId);

        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            plan: plan || undefined,
            planExpiresAt: getSubPeriodEnd(sub),
            planGracePeriodEndsAt: null,
          },
        });

        log("info", "Invoice paid, subscription renewed", {
          tenantId,
          plan,
          subscriptionId,
        });
        break;
      }

      // ─── Invoice 付款失敗 ───
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = getInvoiceSubscriptionId(invoice);

        if (!subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const tenantId = sub.metadata?.tenantId;
        if (!tenantId) {
          log("warn", "invoice.payment_failed: missing tenantId", {
            subscriptionId,
          });
          break;
        }

        // 設定 grace period（7 日）
        const gracePeriodEnd = getGracePeriodEnd();

        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            planGracePeriodEndsAt: gracePeriodEnd,
          },
        });

        log("warn", "Invoice payment failed, grace period started", {
          tenantId,
          subscriptionId,
          gracePeriodEnd: gracePeriodEnd.toISOString(),
        });
        break;
      }

      // ─── Subscription 更新（升降級）───
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const tenantId = sub.metadata?.tenantId;
        if (!tenantId) {
          log("warn", "subscription.updated: missing tenantId", {
            subscriptionId: sub.id,
          });
          break;
        }

        const priceId = sub.items.data[0]?.price?.id || "";
        const plan = planFromPriceId(priceId);

        if (plan) {
          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              plan,
              stripeSubscriptionId: sub.id,
              planExpiresAt: getSubPeriodEnd(sub),
              // 如果 subscription 狀態正常，清除 grace period
              planGracePeriodEndsAt:
                sub.status === "active" || sub.status === "trialing"
                  ? null
                  : undefined,
            },
          });

          log("info", "Subscription updated", {
            tenantId,
            plan,
            status: sub.status,
          });
        }
        break;
      }

      // ─── Subscription 取消/刪除 → 即時降級到 Free ───
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const tenantId = sub.metadata?.tenantId;
        if (!tenantId) {
          log("warn", "subscription.deleted: missing tenantId", {
            subscriptionId: sub.id,
          });
          break;
        }

        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            plan: "free",
            stripeSubscriptionId: null,
            subscriptionEndsAt: new Date(),
            planExpiresAt: null,
            planGracePeriodEndsAt: null,
          },
        });

        log("info", "Subscription deleted, tenant downgraded to free", {
          tenantId,
          subscriptionId: sub.id,
        });
        break;
      }

      default:
        // Ignore other event types
        break;
    }
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    log("error", "Unhandled webhook exception", { err, eventType: event.type });
    // Re-throw so Stripe receives 5xx and retries
    throw e;
  }

  return ok(req, { received: true });
});
