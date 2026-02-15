import Stripe from "stripe";

// ---------------------------------------------------------------------------
// Stripe instance (singleton)
// ---------------------------------------------------------------------------

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  _stripe = new Stripe(key);
  return _stripe;
}

// ---------------------------------------------------------------------------
// Plan → Stripe Price ID mapping
// 喺 Stripe Dashboard 建好 Products + Prices 之後，將 Price ID 填入 env
// ---------------------------------------------------------------------------

export type SubscriptionPlan = "lite" | "pro";

export const PLAN_PRICES: Record<SubscriptionPlan, { monthly: number; currency: string }> = {
  lite: { monthly: 78, currency: "hkd" },
  pro: { monthly: 198, currency: "hkd" },
};

/**
 * 取得 Stripe Price ID。
 * 從環境變數讀取，方便 test/live mode 切換。
 */
export function getStripePriceId(plan: SubscriptionPlan): string {
  if (plan === "lite") {
    return process.env.STRIPE_PRICE_LITE_MONTHLY || "";
  }
  if (plan === "pro") {
    return process.env.STRIPE_PRICE_PRO_MONTHLY || "";
  }
  throw new Error(`Unknown plan: ${plan}`);
}

/**
 * 7 日 grace period 計算
 */
export const GRACE_PERIOD_DAYS = 7;

export function getGracePeriodEnd(fromDate: Date = new Date()): Date {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + GRACE_PERIOD_DAYS);
  return d;
}

// ---------------------------------------------------------------------------
// Stripe Customer 管理
// ---------------------------------------------------------------------------

export async function getOrCreateStripeCustomer(
  tenantId: string,
  email: string,
  name?: string,
  existingCustomerId?: string | null
): Promise<string> {
  const stripe = getStripe();

  // 已有 Stripe Customer，直接用
  if (existingCustomerId) {
    try {
      const existing = await stripe.customers.retrieve(existingCustomerId);
      if (!existing.deleted) return existingCustomerId;
    } catch {
      // Customer 唔存在或已刪除，建新嘅
    }
  }

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { tenantId },
  });

  return customer.id;
}

// ---------------------------------------------------------------------------
// Checkout Session 建立（subscription mode）
// ---------------------------------------------------------------------------

export async function createSubscriptionCheckout(opts: {
  customerId: string;
  priceId: string;
  tenantId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: opts.customerId,
    line_items: [{ price: opts.priceId, quantity: 1 }],
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: {
      tenantId: opts.tenantId,
    },
    subscription_data: {
      metadata: {
        tenantId: opts.tenantId,
      },
    },
  });

  if (!session.url) throw new Error("Stripe Checkout session URL is missing");
  return session.url;
}

// ---------------------------------------------------------------------------
// Customer Portal
// ---------------------------------------------------------------------------

export async function createCustomerPortalSession(opts: {
  customerId: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: opts.customerId,
    return_url: opts.returnUrl,
  });

  return session.url;
}

// ---------------------------------------------------------------------------
// Subscription 查詢
// ---------------------------------------------------------------------------

export async function getSubscriptionDetails(subscriptionId: string) {
  const stripe = getStripe();
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    return sub;
  } catch {
    return null;
  }
}

/**
 * 從 Stripe Price ID 反查 plan name
 */
export function planFromPriceId(priceId: string): SubscriptionPlan | null {
  const litePriceId = process.env.STRIPE_PRICE_LITE_MONTHLY || "";
  const proPriceId = process.env.STRIPE_PRICE_PRO_MONTHLY || "";

  if (priceId === litePriceId) return "lite";
  if (priceId === proPriceId) return "pro";
  return null;
}
