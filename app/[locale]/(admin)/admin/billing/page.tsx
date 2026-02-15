"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Crown,
  CreditCard,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Zap,
} from "lucide-react";
import SidebarToggle from "@/components/admin/SidebarToggle";
import type { Locale } from "@/lib/i18n";

// ---------------------------------------------------------------------------
// 雙語 labels
// ---------------------------------------------------------------------------
const labels = {
  en: {
    title: "Billing & Subscription",
    subtitle: "Manage your plan, usage, and payment method",
    currentPlan: "Current Plan",
    free: "Free",
    lite: "Lite",
    pro: "Pro",
    month: "/mo",
    active: "Active",
    trialing: "Trial",
    expired: "Expired",
    cancelled: "Cancelled",
    gracePeriod: "Grace Period",
    gracePeriodDesc: "Your payment failed. Please update payment method within {days} days to keep your plan.",
    gracePeriodExpired: "Grace period expired. Your plan has been downgraded to Free.",
    planStarted: "Plan started",
    planExpires: "Current period ends",
    cancelAtEnd: "Cancels at period end",
    usage: "Usage",
    products: "Products (SKU)",
    ordersMonth: "Orders this month",
    unlimited: "Unlimited",
    upgrade: "Upgrade",
    downgrade: "Downgrade",
    changePlan: "Change Plan",
    subscribeTo: "Subscribe to",
    managePayment: "Manage Payment Method",
    managePaymentDesc: "Update credit card, view invoices, or cancel subscription",
    openPortal: "Open Billing Portal",
    upgradeTitle: "Upgrade your plan",
    upgradeDesc: "Unlock more products, unlimited orders, and advanced features.",
    selectPlan: "Select Plan",
    features: "Features",
    liteFeatures: "50 products, unlimited orders, coupons, WhatsApp, analytics",
    proFeatures: "Unlimited everything, custom domain, CRM, remove branding, multi-staff",
    freeFeatures: "10 products, 50 orders/mo, basic features",
    checkoutSuccess: "Subscription activated! Welcome to your new plan.",
    checkoutCancelled: "Checkout was cancelled. You can try again anytime.",
    loading: "Loading...",
    redirecting: "Redirecting to checkout...",
    errorLoadBilling: "Failed to load billing info",
  },
  "zh-HK": {
    title: "帳單與訂閱",
    subtitle: "管理你嘅方案、用量同付款方式",
    currentPlan: "目前方案",
    free: "Free",
    lite: "Lite",
    pro: "Pro",
    month: "/月",
    active: "使用中",
    trialing: "試用中",
    expired: "已到期",
    cancelled: "已取消",
    gracePeriod: "寬限期",
    gracePeriodDesc: "付款失敗。請喺 {days} 日內更新付款方式以保留你嘅方案。",
    gracePeriodExpired: "寬限期已過。你嘅方案已降級至 Free。",
    planStarted: "方案開始日期",
    planExpires: "目前期間結束",
    cancelAtEnd: "將於期末取消",
    usage: "用量",
    products: "產品 (SKU)",
    ordersMonth: "本月訂單",
    unlimited: "無限",
    upgrade: "升級",
    downgrade: "降級",
    changePlan: "更改方案",
    subscribeTo: "訂閱",
    managePayment: "管理付款方式",
    managePaymentDesc: "更新信用卡、查看發票或取消訂閱",
    openPortal: "開啟帳單管理",
    upgradeTitle: "升級你嘅方案",
    upgradeDesc: "解鎖更多產品、無限訂單同進階功能。",
    selectPlan: "選擇方案",
    features: "功能",
    liteFeatures: "50 件產品、無限訂單、優惠碼、WhatsApp、數據分析",
    proFeatures: "無限全部、自訂域名、CRM、移除 branding、多員工",
    freeFeatures: "10 件產品、每月 50 單、基本功能",
    checkoutSuccess: "訂閱已啟用！歡迎使用新方案。",
    checkoutCancelled: "結帳已取消。你可以隨時再試。",
    loading: "載入中...",
    redirecting: "跳轉去結帳...",
    errorLoadBilling: "無法載入帳單資料",
  },
} as const;

type PlanPrices = Record<string, { monthly: number; currency: string }>;

type BillingData = {
  plan: string;
  rawPlan: string;
  isExpired: boolean;
  isTrialing: boolean;
  planExpiresAt: string | null;
  planStartedAt: string | null;
  trialEndsAt: string | null;
  hasStripeCustomer: boolean;
  hasSubscription: boolean;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isInGracePeriod: boolean;
  gracePeriodExpired: boolean;
  gracePeriodEndsAt: string | null;
  usage: {
    sku: { current: number; limit: number };
    orders: { current: number; limit: number };
  };
  planPrices: PlanPrices;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysUntil(iso: string | null): number {
  if (!iso) return 0;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function BillingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) || "en";
  const t = locale === "zh-HK" ? labels["zh-HK"] : labels.en;

  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  // Success / cancel banners
  const showSuccess = searchParams.get("success") === "1";
  const showCancelled = searchParams.get("cancelled") === "1";

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/billing");
        const json = await res.json();
        if (mounted && json.ok) {
          setBilling(json.data);
        } else {
          setError(t.errorLoadBilling);
        }
      } catch {
        if (mounted) setError(t.errorLoadBilling);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [t.errorLoadBilling]);

  const handleCheckout = async (plan: string) => {
    setCheckoutLoading(plan);
    try {
      const res = await fetch("/api/admin/subscription/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (json.ok && json.data?.url) {
        window.location.href = json.data.url;
      } else {
        alert(json.error?.message || "Checkout failed");
        setCheckoutLoading(null);
      }
    } catch {
      alert("Network error");
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/admin/subscription/portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
      });
      const json = await res.json();
      if (json.ok && json.data?.url) {
        window.location.href = json.data.url;
      } else {
        alert(json.error?.message || "Portal failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-50 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="bg-zinc-50 min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error || t.errorLoadBilling}</p>
      </div>
    );
  }

  const planName =
    billing.plan === "pro" ? t.pro : billing.plan === "lite" ? t.lite : t.free;
  const planColor =
    billing.plan === "pro"
      ? "bg-violet-100 text-violet-700"
      : billing.plan === "lite"
      ? "bg-blue-100 text-blue-700"
      : "bg-zinc-100 text-zinc-700";

  return (
    <div className="bg-zinc-50 text-zinc-900 pb-20 min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-6">
          <SidebarToggle />
        </div>

        {/* Header */}
        <div className="space-y-1.5 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {t.title}
          </h1>
          <p className="text-zinc-600 text-base max-w-lg">{t.subtitle}</p>
        </div>

        {/* Success/Cancel banners */}
        {showSuccess && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-800">
              {t.checkoutSuccess}
            </p>
          </div>
        )}
        {showCancelled && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm font-medium text-amber-800">
              {t.checkoutCancelled}
            </p>
          </div>
        )}

        {/* Grace period warning */}
        {billing.isInGracePeriod && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">{t.gracePeriod}</p>
              <p className="text-sm text-red-700 mt-1">
                {t.gracePeriodDesc.replace(
                  "{days}",
                  String(daysUntil(billing.gracePeriodEndsAt))
                )}
              </p>
            </div>
          </div>
        )}
        {billing.gracePeriodExpired && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm font-medium text-red-800">
              {t.gracePeriodExpired}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* ═══ Current Plan ═══ */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Crown className="h-5 w-5 text-zinc-600" />
                {t.currentPlan}
              </h3>
            </div>

            {/* Plan badge + status */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold",
                  planColor
                )}
              >
                {planName}
              </span>

              {billing.subscriptionStatus === "active" && !billing.cancelAtPeriodEnd && (
                <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                  {t.active}
                </span>
              )}
              {billing.isTrialing && (
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                  {t.trialing}
                </span>
              )}
              {billing.cancelAtPeriodEnd && (
                <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full font-medium">
                  {t.cancelAtEnd}
                </span>
              )}
              {billing.isExpired && (
                <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full font-medium">
                  {t.expired}
                </span>
              )}

              {billing.plan !== "free" && billing.planPrices[billing.plan] && (
                <span className="text-sm text-zinc-500 ml-auto">
                  ${billing.planPrices[billing.plan].monthly}
                  {t.month}
                </span>
              )}
            </div>

            {/* Dates */}
            {billing.plan !== "free" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {billing.planStartedAt && (
                  <div>
                    <span className="text-zinc-500">{t.planStarted}</span>
                    <p className="font-medium text-zinc-900 mt-0.5">
                      {formatDate(billing.planStartedAt)}
                    </p>
                  </div>
                )}
                {(billing.currentPeriodEnd || billing.planExpiresAt) && (
                  <div>
                    <span className="text-zinc-500">{t.planExpires}</span>
                    <p className="font-medium text-zinc-900 mt-0.5">
                      {formatDate(
                        billing.currentPeriodEnd || billing.planExpiresAt
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ═══ Usage ═══ */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900">{t.usage}</h3>

            {/* SKU */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">{t.products}</span>
                <span className="font-medium text-zinc-900">
                  {billing.usage.sku.current} /{" "}
                  {billing.usage.sku.limit > 999999
                    ? t.unlimited
                    : billing.usage.sku.limit}
                </span>
              </div>
              {billing.usage.sku.limit <= 999999 && (
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      billing.usage.sku.current / billing.usage.sku.limit >= 0.9
                        ? "bg-red-500"
                        : billing.usage.sku.current / billing.usage.sku.limit >=
                          0.7
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    )}
                    style={{
                      width: `${Math.min(
                        100,
                        (billing.usage.sku.current / billing.usage.sku.limit) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Orders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600">{t.ordersMonth}</span>
                <span className="font-medium text-zinc-900">
                  {billing.usage.orders.current} /{" "}
                  {billing.usage.orders.limit > 999999
                    ? t.unlimited
                    : billing.usage.orders.limit}
                </span>
              </div>
              {billing.usage.orders.limit <= 999999 && (
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      billing.usage.orders.current /
                        billing.usage.orders.limit >=
                        0.9
                        ? "bg-red-500"
                        : billing.usage.orders.current /
                            billing.usage.orders.limit >=
                          0.7
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    )}
                    style={{
                      width: `${Math.min(
                        100,
                        (billing.usage.orders.current /
                          billing.usage.orders.limit) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ═══ Manage Payment (Stripe Portal) ═══ */}
          {billing.hasStripeCustomer && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 md:p-8 space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-zinc-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {t.managePayment}
                  </h3>
                  <p className="text-sm text-zinc-600 mt-1">
                    {t.managePaymentDesc}
                  </p>
                </div>
              </div>
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                {t.openPortal}
              </button>
            </div>
          )}

          {/* ═══ Plan Options / Upgrade ═══ */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Zap className="h-5 w-5 text-zinc-600" />
                {billing.plan === "free" ? t.upgradeTitle : t.changePlan}
              </h3>
              {billing.plan === "free" && (
                <p className="text-sm text-zinc-600 mt-1">{t.upgradeDesc}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Free */}
              <div
                className={cn(
                  "rounded-xl border-2 p-5 transition-all",
                  billing.plan === "free"
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200"
                )}
              >
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-lg font-bold text-zinc-900">
                    {t.free}
                  </span>
                  <span className="text-sm text-zinc-500">$0{t.month}</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {t.freeFeatures}
                </p>
                {billing.plan === "free" && (
                  <p className="text-xs font-semibold text-zinc-500 mt-3">
                    {t.currentPlan}
                  </p>
                )}
              </div>

              {/* Lite */}
              <div
                className={cn(
                  "rounded-xl border-2 p-5 transition-all",
                  billing.plan === "lite"
                    ? "border-blue-500 bg-blue-50"
                    : "border-zinc-200 hover:border-blue-300"
                )}
              >
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-lg font-bold text-zinc-900">
                    {t.lite}
                  </span>
                  <span className="text-sm text-zinc-500">
                    ${billing.planPrices.lite?.monthly || 78}
                    {t.month}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                  {t.liteFeatures}
                </p>
                {billing.plan === "lite" ? (
                  <p className="text-xs font-semibold text-blue-600">
                    {t.currentPlan}
                  </p>
                ) : (
                  <button
                    onClick={() => handleCheckout("lite")}
                    disabled={checkoutLoading !== null}
                    className="w-full py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {checkoutLoading === "lite" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                    {billing.plan === "pro" ? t.downgrade : t.upgrade}
                  </button>
                )}
              </div>

              {/* Pro */}
              <div
                className={cn(
                  "rounded-xl border-2 p-5 transition-all",
                  billing.plan === "pro"
                    ? "border-violet-500 bg-violet-50"
                    : "border-zinc-200 hover:border-violet-300"
                )}
              >
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-lg font-bold text-zinc-900">
                    {t.pro}
                  </span>
                  <span className="text-sm text-zinc-500">
                    ${billing.planPrices.pro?.monthly || 198}
                    {t.month}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                  {t.proFeatures}
                </p>
                {billing.plan === "pro" ? (
                  <p className="text-xs font-semibold text-violet-600">
                    {t.currentPlan}
                  </p>
                ) : (
                  <button
                    onClick={() => handleCheckout("pro")}
                    disabled={checkoutLoading !== null}
                    className="w-full py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {checkoutLoading === "pro" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                    {t.upgrade}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
