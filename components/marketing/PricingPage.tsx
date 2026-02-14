"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Locale } from "@/lib/i18n";

/* ─── Content maps keyed by locale ─── */
const t = {
  "zh-HK": {
    /* Nav */
    navCta: "免費開店",
    navPricing: "定價",
    /* Hero */
    heroHeadline: ["0% 平台抽成", "·", "$0 起", "·", "2 分鐘開店"],
    heroSub:
      "仲用 Google Form 接單？WoWlix 幫你慳時間、慳錢、專心賣嘢",
    heroCta: "免費開店",
    heroGhost: "睇下邊個 Plan 啱你",
    heroSteps: [
      { icon: "📦", label: "上貨" },
      { icon: "🔗", label: "分享 Link" },
      { icon: "🛒", label: "收單" },
    ],
    /* Plan cards */
    plans: [
      {
        name: "Free",
        price: 0,
        sub: "零成本試水溫",
        cta: "免費開始",
        note: "永久免費・隨時升級",
        features: [
          "10 件商品",
          "每月 50 單",
          "FPS + PayMe + AlipayHK",
          "Mochi 主題",
          "1 個帳號（店主）",
        ],
      },
      {
        name: "Lite",
        price: 78,
        sub: "認真副業首選",
        cta: "立即訂閱",
        note: "月繳・隨時取消・0% 平台抽成",
        popular: true,
        features: [
          "50 件商品",
          "無限訂單",
          "Free 全部收款 + 銀行過數",
          "所有主題（持續更新）",
          "WhatsApp 預填訊息",
          "優惠碼",
          "訂單 CSV 匯出",
          "基本數據分析",
          "2 個帳號",
        ],
      },
      {
        name: "Pro",
        price: 198,
        sub: "全職生意必備",
        cta: "免費試 14 日",
        note: "14 日免費試用・0% 平台抽成",
        features: [
          "無限商品",
          "無限訂單",
          "全部收款方式",
          "所有主題（持續更新）",
          "Lite 全部功能",
          "棄單挽回",
          "CRM 客戶庫",
          "熱賣排行",
          "自訂域名",
          "移除 WoWlix branding",
          "3 個帳號",
        ],
      },
    ],
    /* Calculator */
    calcTitle: "你每月大概做幾多生意？",
    calcToggleLite: "用 Lite 比較",
    calcTogglePro: "用 Pro 比較",
    calcSaveLabel: "每月慳",
    calcYearLabel: "一年慳",
    calcSource: "計算方式及來源",
    calcSourceNote:
      "數據截至 2026 年 2 月，基於各平台官方公開定價頁",
    calcCompetitors: [
      { name: "SHOPLINE Basic", formula: "$499 + 營業額×0.8%", url: "https://shopline.hk/pricing" },
      { name: "Boutir Essential", formula: "$374（年繳月均）", url: "https://www.boutir.com/pricing" },
      { name: "Shopify Basic", formula: "US$25 ≈ HK$195 + 營業額×2%", url: "https://www.shopify.com/pricing" },
    ],
    /* Scenarios */
    scenarioTitle: "邊個 Plan 啱你？",
    scenarios: [
      {
        emoji: "🌱",
        title: "啱啱開始",
        desc: "每月 10-30 單 / 月入 $3K-$8K",
        plan: "Free $0",
        quote: "零成本開舖，試下市場反應先",
        cta: "免費開始",
      },
      {
        emoji: "🚀",
        title: "開始有回頭客",
        desc: "每月 50-100 單 / 月入 $10K-$20K",
        plan: "Lite $78",
        quote: "$78 = 一晚外賣錢，換走每晚跟單 1 小時",
        cta: "立即訂閱",
      },
      {
        emoji: "👑",
        title: "認真做品牌",
        desc: "每月 120-200 單 / 月入 $20K-$30K",
        plan: "Pro $198",
        quote: "自訂域名 + CRM，唔再比人覺得係 IG 雜嘜檔",
        cta: "免費試 14 日",
      },
    ],
    /* Social proof */
    proofTitle: "用 WoWlix 開嘅店",
    proofItems: [
      { template: "Noir", shop: "限量波鞋", persona: "IG 粉絲 3.1K · 用 WoWlix 2 個月", emoji: "👟" },
      { template: "Linen", shop: "手作飾品", persona: "IG 粉絲 1.8K · 用 WoWlix 4 個月", emoji: "💍" },
      { template: "Mochi", shop: "Mochi 蛋糕", persona: "IG 粉絲 2.3K · 用 WoWlix 3 個月", emoji: "🧁" },
      { template: "Petal", shop: "韓式美妝", persona: "IG 粉絲 5.2K · 用 WoWlix 1 個月", emoji: "💄" },
    ],
    /* Feature table */
    tableTitle: "功能對比",
    tableRows: [
      { label: "商品數量", free: "10", lite: "50", pro: "無限" },
      { label: "每月訂單", free: "50", lite: "無限", pro: "無限" },
      { label: "收款方式", free: "3 種", lite: "4 種", pro: "全部" },
      { label: "WhatsApp 預填訊息", free: false, lite: true, pro: true },
      { label: "優惠碼", free: false, lite: true, pro: true },
      { label: "棄單挽回", free: false, lite: false, pro: true },
      { label: "CRM 客戶庫", free: false, lite: false, pro: true },
      { label: "自訂域名", free: false, lite: false, pro: true },
      { label: "平台抽成", free: "0%", lite: "0%", pro: "0%", highlight: true },
    ],
    /* FAQ */
    faqTitle: "常見問題",
    faqs: [
      {
        q: "WoWlix 真係 0% 平台抽成？",
        a: "真係。WoWlix 不收任何交易抽成或隱藏費用。如果你日後使用信用卡收款，支付通道（如 Stripe）會收取標準手續費，但呢個係支付商收嘅，WoWlix 唔會額外加價。而家用 FPS/PayMe/AlipayHK 就真係 0 成本。",
      },
      {
        q: "Free Plan 有咩限制？",
        a: "10 件商品、每月 50 單。夠你試水溫。想上更多款式、要優惠碼同數據分析就升 Lite，$78 搞掂。",
      },
      {
        q: "我可以用 PayMe / FPS / AlipayHK 收錢？",
        a: "可以，Free plan 已經支援。客人結帳時揀付款方式，你後台確認收款就得。",
      },
      {
        q: "「棄單挽回」係咩？",
        a: "當客人落咗單但未付款，Pro plan 會自動整理成列表，你可以一鍵 WhatsApp 提醒佢哋完成付款。呢啲「差少少就買」嘅客人，追返一個就值回 plan 費。",
      },
      {
        q: "CRM 客戶庫包咩功能？",
        a: "記錄每個客人嘅購買紀錄、消費總額、標籤分類（如 VIP / 回頭客）。你可以篩選「買過蛋糕」嘅客人，一鍵匯出名單做推廣。",
      },
      {
        q: "同其他網店平台有咩分別？",
        a: "其他平台功能多但貴（$374-$499/月起步，仲要抽成 0.5-5%）。WoWlix 專做 IG 小店最需要嘅功能，$0 起步、0% 抽成。你唔需要 POS、直播、多國貨幣。你需要收錢、發貨、好睇嘅店面。",
      },
      {
        q: "我可以隨時取消？生意做大咗點算？",
        a: "月繳制，隨時取消，冇綁約。生意做大就升 Pro，$198 有 CRM + 自訂域名 + 無限商品。如果有日你需要 POS + 全渠道零售，我哋會幫你順利搬遷，唔鎖你嘅數據。",
      },
    ],
    /* Final CTA */
    ctaHeadline: "仲用 Google Form 接單？",
    ctaSub: "2 分鐘開店・0% 平台抽成・$0 起步",
    ctaBtn: "免費開店",
    /* Footer */
    footerNote:
      "WoWlix 不收平台抽成。如使用信用卡等第三方支付，需支付通道手續費（由支付商收取，WoWlix 不額外加價）。",
  },
  en: {
    navCta: "Start Free",
    navPricing: "Pricing",
    heroHeadline: ["0% Commission", "·", "From $0", "·", "2-Min Setup"],
    heroSub:
      "Still using Google Forms? WoWlix saves you time, money, and hassle.",
    heroCta: "Start Free",
    heroGhost: "See Plans",
    heroSteps: [
      { icon: "📦", label: "Add Products" },
      { icon: "🔗", label: "Share Link" },
      { icon: "🛒", label: "Get Orders" },
    ],
    plans: [
      {
        name: "Free",
        price: 0,
        sub: "Zero cost to start",
        cta: "Start Free",
        note: "Free forever · Upgrade anytime",
        features: [
          "10 products",
          "50 orders/month",
          "FPS + PayMe + AlipayHK",
          "Mochi theme",
          "1 account (owner)",
        ],
      },
      {
        name: "Lite",
        price: 78,
        sub: "Best for side hustles",
        cta: "Subscribe Now",
        note: "Monthly · Cancel anytime · 0% commission",
        popular: true,
        features: [
          "50 products",
          "Unlimited orders",
          "All Free payments + bank transfer",
          "All themes (updated regularly)",
          "WhatsApp pre-filled messages",
          "Coupon codes",
          "Order CSV export",
          "Basic analytics",
          "2 accounts",
        ],
      },
      {
        name: "Pro",
        price: 198,
        sub: "For serious businesses",
        cta: "Try 14 Days Free",
        note: "14-day free trial · 0% commission",
        features: [
          "Unlimited products",
          "Unlimited orders",
          "All payment methods",
          "All themes (updated regularly)",
          "All Lite features",
          "Abandoned cart recovery",
          "CRM customer database",
          "Best sellers ranking",
          "Custom domain",
          "Remove WoWlix branding",
          "3 accounts",
        ],
      },
    ],
    calcTitle: "How much do you sell per month?",
    calcToggleLite: "Compare with Lite",
    calcTogglePro: "Compare with Pro",
    calcSaveLabel: "Save monthly",
    calcYearLabel: "Save yearly",
    calcSource: "Calculation method & sources",
    calcSourceNote:
      "Data as of February 2026, based on official public pricing pages",
    calcCompetitors: [
      { name: "SHOPLINE Basic", formula: "$499 + revenue × 0.8%", url: "https://shopline.hk/pricing" },
      { name: "Boutir Essential", formula: "$374 (annual avg/month)", url: "https://www.boutir.com/pricing" },
      { name: "Shopify Basic", formula: "US$25 ≈ HK$195 + revenue × 2%", url: "https://www.shopify.com/pricing" },
    ],
    scenarioTitle: "Which plan is right for you?",
    scenarios: [
      {
        emoji: "🌱",
        title: "Just Starting",
        desc: "10-30 orders/mo · $3K-$8K revenue",
        plan: "Free $0",
        quote: "Zero cost to test the waters",
        cta: "Start Free",
      },
      {
        emoji: "🚀",
        title: "Growing Fast",
        desc: "50-100 orders/mo · $10K-$20K revenue",
        plan: "Lite $78",
        quote: "$78 = one takeout dinner, saves you 1 hour every night",
        cta: "Subscribe Now",
      },
      {
        emoji: "👑",
        title: "Building a Brand",
        desc: "120-200 orders/mo · $20K-$30K revenue",
        plan: "Pro $198",
        quote: "Custom domain + CRM, look like a real brand",
        cta: "Try 14 Days Free",
      },
    ],
    proofTitle: "Stores built with WoWlix",
    proofItems: [
      { template: "Noir", shop: "Limited Sneakers", persona: "3.1K IG followers · 2 months on WoWlix", emoji: "👟" },
      { template: "Linen", shop: "Handmade Jewelry", persona: "1.8K IG followers · 4 months on WoWlix", emoji: "💍" },
      { template: "Mochi", shop: "Mochi Cakes", persona: "2.3K IG followers · 3 months on WoWlix", emoji: "🧁" },
      { template: "Petal", shop: "K-Beauty", persona: "5.2K IG followers · 1 month on WoWlix", emoji: "💄" },
    ],
    tableTitle: "Feature Comparison",
    tableRows: [
      { label: "Products", free: "10", lite: "50", pro: "Unlimited" },
      { label: "Monthly Orders", free: "50", lite: "Unlimited", pro: "Unlimited" },
      { label: "Payment Methods", free: "3 types", lite: "4 types", pro: "All" },
      { label: "WhatsApp Pre-fill", free: false, lite: true, pro: true },
      { label: "Coupon Codes", free: false, lite: true, pro: true },
      { label: "Abandoned Cart Recovery", free: false, lite: false, pro: true },
      { label: "CRM Database", free: false, lite: false, pro: true },
      { label: "Custom Domain", free: false, lite: false, pro: true },
      { label: "Platform Commission", free: "0%", lite: "0%", pro: "0%", highlight: true },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        q: "Is WoWlix really 0% commission?",
        a: "Yes. WoWlix charges no transaction commission or hidden fees. If you use credit card payments in the future, the payment provider (e.g. Stripe) charges standard processing fees, but WoWlix adds nothing on top. Using FPS/PayMe/AlipayHK is truly zero cost.",
      },
      {
        q: "What are the Free Plan limits?",
        a: "10 products, 50 orders per month. Enough to test the waters. Need more products, coupon codes and analytics? Upgrade to Lite for $78.",
      },
      {
        q: "Can I accept PayMe / FPS / AlipayHK?",
        a: "Yes, the Free plan already supports these. Customers choose their payment method at checkout, and you confirm payment in your dashboard.",
      },
      {
        q: 'What is "Abandoned Cart Recovery"?',
        a: "When a customer places an order but hasn't paid, Pro plan automatically organizes them into a list. You can send a one-tap WhatsApp reminder to complete payment. Recovering just one order pays for the plan.",
      },
      {
        q: "What does the CRM include?",
        a: "Track each customer's purchase history, total spending, and tags (e.g. VIP, repeat buyer). Filter customers who bought specific products and export lists for marketing.",
      },
      {
        q: "How is WoWlix different from other platforms?",
        a: "Other platforms are feature-rich but expensive ($374-$499/month + 0.5-5% commission). WoWlix focuses on what IG shops actually need, starting at $0 with 0% commission. You don't need POS, livestreaming, or multi-currency. You need payments, shipping, and a beautiful storefront.",
      },
      {
        q: "Can I cancel anytime? What if I outgrow WoWlix?",
        a: "Monthly billing, cancel anytime, no lock-in. Scale up to Pro for $198 with CRM + custom domain + unlimited products. If you ever need POS + omnichannel retail, we'll help you migrate smoothly. Your data is never locked in.",
      },
    ],
    ctaHeadline: "Still taking orders on Google Forms?",
    ctaSub: "2-min setup · 0% commission · Start free",
    ctaBtn: "Start Free",
    footerNote:
      "WoWlix charges no platform commission. Third-party payment processing fees (charged by payment providers, not WoWlix) may apply for credit card payments.",
  },
};

/* ─── Calculator helpers ─── */
function calcCosts(revenue: number) {
  return {
    shopline: 499 + revenue * 0.008,
    boutir: 374,
    shopify: 195 + revenue * 0.02,
    lite: 78,
    pro: 198,
  };
}

/* ─── Smooth scroll helper ─── */
function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/* ─── Reusable WoWlix logo ─── */
function WoWlixLogo() {
  return (
    <span className="text-2xl font-extrabold tracking-tight">
      <span className="text-[#FF9500]">W</span>
      <span>o</span>
      <span className="text-[#FF9500]">W</span>
      <span>lix</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function PricingPage({ locale }: { locale: Locale }) {
  const c = t[locale] || t["en"];
  const startHref = `/${locale}/start`;

  return (
    <div className="pricing-page bg-white text-zinc-900">
      <style>{pricingStyles}</style>

      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-100 bg-white/80 px-5 py-4 backdrop-blur-xl md:px-10">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-lg">✦</span>
          <WoWlixLogo />
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => scrollToId("plans")}
            className="hidden text-sm font-semibold text-zinc-600 hover:text-zinc-900 md:block"
          >
            {c.navPricing}
          </button>
          <Link
            href={startHref}
            className="rounded-full bg-[#FF9500] px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200"
          >
            {c.navCta}
          </Link>
        </div>
      </nav>

      {/* ─── SECTION 1 : HERO ─── */}
      <section className="pricing-hero relative overflow-hidden px-5 pb-16 pt-16 md:px-10 md:pb-24 md:pt-20">
        <div className="pricing-hero-bg" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="mb-5 text-4xl font-black leading-tight tracking-tight md:text-6xl">
            {c.heroHeadline.map((part, i) =>
              i % 2 === 0 ? (
                <span key={i} className="text-[#FF9500]">
                  {part}
                </span>
              ) : (
                <span key={i} className="mx-2 text-zinc-300">
                  {part}
                </span>
              ),
            )}
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-lg text-zinc-500">
            {c.heroSub}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={startHref}
              className="rounded-full bg-[#FF9500] px-8 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-200"
            >
              {c.heroCta} →
            </Link>
            <button
              onClick={() => scrollToId("plans")}
              className="rounded-full border border-zinc-200 px-8 py-3.5 text-base font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-800"
            >
              {c.heroGhost}
            </button>
          </div>
          {/* Mini flow */}
          <div className="mt-12 flex items-center justify-center gap-4 md:gap-8">
            {c.heroSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-4 md:gap-8">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl md:text-3xl">{step.icon}</span>
                  <span className="text-xs font-medium text-zinc-500 md:text-sm">
                    {step.label}
                  </span>
                </div>
                {i < c.heroSteps.length - 1 && (
                  <span className="text-zinc-300">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 2 : PLAN CARDS ─── */}
      <section id="plans" className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {c.plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} locale={locale} />
          ))}
        </div>
      </section>

      {/* ─── SECTION 3 : SAVINGS CALCULATOR ─── */}
      <SavingsCalculator locale={locale} c={c} startHref={startHref} />

      {/* ─── SECTION 4 : SCENARIO CARDS ─── */}
      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight md:text-4xl">
            {c.scenarioTitle}
          </h2>
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {c.scenarios.map((s, i) => (
              <div
                key={i}
                className="min-w-[280px] flex-shrink-0 rounded-2xl border border-zinc-100 bg-zinc-50 p-6 md:min-w-0"
              >
                <div className="mb-3 text-4xl">{s.emoji}</div>
                <h3 className="mb-1 text-xl font-bold">{s.title}</h3>
                <p className="mb-3 text-sm text-zinc-500">{s.desc}</p>
                <div className="mb-3 inline-block rounded-full bg-[#FFF3E0] px-3 py-1 text-sm font-bold text-[#FF9500]">
                  {s.plan}
                </div>
                <p className="mb-5 text-sm italic text-zinc-600">
                  &ldquo;{s.quote}&rdquo;
                </p>
                <Link
                  href={`/${locale}/start`}
                  className="inline-block rounded-full bg-[#FF9500] px-5 py-2 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-orange-200"
                >
                  {s.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5 : SOCIAL PROOF / DEMO ─── */}
      <section className="bg-zinc-50 px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight md:text-4xl">
            {c.proofTitle}
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {c.proofItems.map((item, i) => (
              <div
                key={i}
                className="min-w-[220px] flex-shrink-0 md:min-w-[240px]"
              >
                {/* Phone mockup */}
                <div className="mx-auto w-[200px] overflow-hidden rounded-[28px] border-[3px] border-zinc-300 bg-white shadow-xl md:w-[220px]">
                  <div className="relative">
                    <div className="flex h-[90px] items-end justify-center bg-gradient-to-br from-[#FF9500] to-[#FF6B00] pb-2">
                      <span className="text-3xl">{item.emoji}</span>
                    </div>
                    <div className="px-3 pb-4 pt-3 text-center">
                      <p className="text-xs font-bold text-zinc-900">
                        {item.shop}
                      </p>
                      <p className="mt-0.5 text-[10px] text-zinc-400">
                        {item.template} template
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className="aspect-square rounded-lg bg-zinc-100"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-center text-xs text-zinc-500">
                  {item.persona}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 6 : FEATURE TABLE ─── */}
      <FeatureTable locale={locale} c={c} />

      {/* ─── SECTION 7 : FAQ ─── */}
      <section className="bg-zinc-50 px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight md:text-4xl">
            {c.faqTitle}
          </h2>
          <div className="flex flex-col gap-3">
            {c.faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 8 : FINAL CTA ─── */}
      <section className="relative overflow-hidden bg-[#1A1A1A] px-5 py-20 text-center text-white md:py-28">
        <div className="pricing-cta-glow" />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-black tracking-tight md:text-5xl">
            {c.ctaHeadline}
          </h2>
          <p className="mb-8 text-lg text-zinc-400">{c.ctaSub}</p>
          <Link
            href={startHref}
            className="pricing-cta-btn inline-block rounded-full bg-[#FF9500] px-10 py-4 text-lg font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/30"
          >
            {c.ctaBtn} →
          </Link>
        </div>
      </section>

      {/* ─── FOOTER NOTE ─── */}
      <footer className="border-t border-zinc-100 bg-white px-5 py-8 text-center">
        <div className="mb-3">
          <WoWlixLogo />
        </div>
        <p className="mx-auto max-w-xl text-xs text-zinc-400">
          {c.footerNote}
        </p>
        <p className="mt-2 text-xs text-zinc-300">
          © 2026 Flow Studio HK
        </p>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════ */

/* ─── Plan Card ─── */
type PlanData = (typeof t)["en"]["plans"][number];
function PlanCard({
  plan,
  locale,
}: {
  plan: PlanData;
  locale: Locale;
}) {
  const isPro = plan.name === "Pro";
  const isPopular = "popular" in plan && plan.popular;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 p-6 transition-transform hover:-translate-y-1 md:p-8 ${
        isPro
          ? "border-zinc-900 bg-[#1A1A1A] text-white"
          : isPopular
            ? "scale-[1.03] border-[#FF9500] bg-[#FFF3E0]"
            : "border-zinc-100 bg-white"
      }`}
    >
      {/* 0% badge */}
      <div
        className={`absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
          isPro
            ? "bg-zinc-800 text-[#FF9500]"
            : "bg-[#FFF3E0] text-[#FF9500]"
        }`}
      >
        0% {locale === "zh-HK" ? "平台抽成" : "Commission"}
      </div>

      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FF9500] px-4 py-1 text-xs font-bold text-white">
          {locale === "zh-HK" ? "最受歡迎" : "Most Popular"}
        </div>
      )}

      <h3 className="text-2xl font-extrabold">{plan.name}</h3>
      <p
        className={`mt-1 text-sm ${isPro ? "text-zinc-400" : "text-zinc-500"}`}
      >
        {plan.sub}
      </p>

      {/* Price */}
      <div className="mb-5 mt-5">
        <span
          className={`text-sm ${isPro ? "text-zinc-500" : "text-zinc-400"}`}
        >
          HK$
        </span>
        <span className="text-5xl font-extrabold tracking-tighter">
          {plan.price}
        </span>
        {plan.price > 0 && (
          <span
            className={`text-sm ${isPro ? "text-zinc-500" : "text-zinc-400"}`}
          >
            /{locale === "zh-HK" ? "月" : "mo"}
          </span>
        )}
      </div>

      {/* Features */}
      <ul className="mb-6 flex flex-1 flex-col gap-2.5">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 text-[#FF9500]">✓</span>
            <span className={isPro ? "text-zinc-300" : ""}>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={`/${locale}/start`}
        className={`block rounded-full py-3 text-center text-sm font-bold transition-all hover:-translate-y-0.5 ${
          isPro
            ? "bg-white text-zinc-900 hover:shadow-lg"
            : isPopular
              ? "bg-[#FF9500] text-white hover:shadow-lg hover:shadow-orange-200"
              : "border border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400"
        }`}
      >
        {plan.cta}
      </Link>

      {/* Note */}
      <p
        className={`mt-3 text-center text-xs ${isPro ? "text-zinc-500" : "text-zinc-400"}`}
      >
        {plan.note}
      </p>
    </div>
  );
}

/* ─── Savings Calculator ─── */
type ContentMap = (typeof t)["en"];
function SavingsCalculator({
  locale,
  c,
  startHref,
}: {
  locale: Locale;
  c: ContentMap;
  startHref: string;
}) {
  const [revenue, setRevenue] = useState(10000);
  const [usePro, setUsePro] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const costs = calcCosts(revenue);
  const wowlixCost = usePro ? costs.pro : costs.lite;
  const maxCost = Math.max(costs.shopline, costs.boutir, costs.shopify);

  const bars = [
    {
      label: locale === "zh-HK" ? "本地網店平台 A" : "Local Platform A",
      cost: costs.shopline,
      color: "#D1D5DB",
    },
    {
      label: locale === "zh-HK" ? "本地網店平台 B" : "Local Platform B",
      cost: costs.boutir,
      color: "#D1D5DB",
    },
    {
      label: locale === "zh-HK" ? "海外網店平台" : "International Platform",
      cost: costs.shopify,
      color: "#D1D5DB",
    },
    {
      label: usePro ? "WoWlix Pro" : "WoWlix Lite",
      cost: wowlixCost,
      color: "#FF9500",
      isWowlix: true,
    },
  ];

  const minSaving = Math.round(
    Math.min(costs.shopline, costs.boutir, costs.shopify) - wowlixCost,
  );
  const maxSaving = Math.round(maxCost - wowlixCost);

  const ticks = [5000, 10000, 20000, 30000, 50000];

  return (
    <section className="bg-zinc-50 px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-2 text-center text-3xl font-extrabold tracking-tight md:text-4xl">
          {c.calcTitle}
        </h2>

        {/* Slider */}
        <div className="mx-auto mt-8 max-w-md">
          <div className="mb-3 text-center text-3xl font-extrabold text-[#FF9500]">
            HK${revenue.toLocaleString()}
          </div>
          <input
            type="range"
            min={5000}
            max={50000}
            step={1000}
            value={revenue}
            onChange={(e) => setRevenue(Number(e.target.value))}
            className="pricing-slider w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-zinc-400">
            {ticks.map((v) => (
              <span key={v}>${(v / 1000).toFixed(0)}K</span>
            ))}
          </div>
        </div>

        {/* Toggle */}
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setUsePro(false)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              !usePro
                ? "bg-[#FF9500] text-white"
                : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
            }`}
          >
            {c.calcToggleLite}
          </button>
          <button
            onClick={() => setUsePro(true)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              usePro
                ? "bg-[#FF9500] text-white"
                : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300"
            }`}
          >
            {c.calcTogglePro}
          </button>
        </div>

        {/* Bars */}
        <div className="mt-8 flex flex-col gap-4">
          {bars.map((bar) => {
            const pct = maxCost > 0 ? (bar.cost / maxCost) * 100 : 0;
            return (
              <div key={bar.label}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span
                    className={`font-medium ${bar.isWowlix ? "text-[#FF9500]" : "text-zinc-600"}`}
                  >
                    {bar.label}
                  </span>
                  <span
                    className={`font-bold ${bar.isWowlix ? "text-[#FF9500]" : "text-zinc-800"}`}
                  >
                    ${Math.round(bar.cost)}/{locale === "zh-HK" ? "月" : "mo"}
                  </span>
                </div>
                <div className="h-8 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className={`pricing-bar h-full rounded-full ${bar.isWowlix ? "pricing-bar-pulse" : ""}`}
                    style={{
                      width: `${Math.max(pct, 3)}%`,
                      backgroundColor: bar.color,
                    }}
                  />
                </div>
                {bar.isWowlix && (
                  <p className="mt-1 text-right text-xs font-semibold text-[#FF9500]">
                    ← {locale === "zh-HK" ? "你喺呢度" : "You are here"}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Savings summary */}
        {minSaving > 0 && (
          <div className="mt-8 rounded-2xl border-2 border-[#FF9500] bg-[#FFF3E0] p-5 text-center">
            <p className="text-lg font-extrabold text-zinc-900">
              {c.calcSaveLabel}{" "}
              <span className="text-[#FF9500]">
                ${minSaving.toLocaleString()} - ${maxSaving.toLocaleString()}
              </span>
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {c.calcYearLabel}{" "}
              <span className="font-bold text-[#FF9500]">
                ${(minSaving * 12).toLocaleString()} - $
                {(maxSaving * 12).toLocaleString()}
              </span>
            </p>
          </div>
        )}

        {/* Source accordion */}
        <div className="mt-6">
          <button
            onClick={() => setSourceOpen(!sourceOpen)}
            className="mx-auto flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600"
          >
            {c.calcSource}{" "}
            <span
              className={`transition-transform ${sourceOpen ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>
          {sourceOpen && (
            <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-4 text-xs text-zinc-500">
              <ul className="flex flex-col gap-2">
                {c.calcCompetitors.map((comp) => (
                  <li key={comp.name}>
                    <strong>{comp.name}</strong>: {comp.formula}
                    <br />
                    <span className="text-zinc-400">{comp.url}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-zinc-400">{c.calcSourceNote}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Feature Table ─── */
function FeatureTable({
  locale,
  c,
}: {
  locale: Locale;
  c: ContentMap;
}) {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const plans = ["Free", "Lite $78", "Pro $198"];

  return (
    <section className="px-5 py-16 md:px-10 md:py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight md:text-4xl">
          {c.tableTitle}
        </h2>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-5 py-4 text-left font-semibold text-zinc-600">
                  {locale === "zh-HK" ? "功能" : "Feature"}
                </th>
                <th className="px-5 py-4 text-center font-semibold text-zinc-600">
                  Free
                </th>
                <th className="px-5 py-4 text-center font-semibold text-[#FF9500]">
                  Lite $78
                </th>
                <th className="px-5 py-4 text-center font-semibold text-zinc-600">
                  Pro $198
                </th>
              </tr>
            </thead>
            <tbody>
              {c.tableRows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-zinc-100 transition-colors hover:bg-[#FFF3E0]/40 ${
                    row.highlight ? "bg-[#FFF3E0]" : ""
                  }`}
                >
                  <td className="px-5 py-3.5 font-medium">{row.label}</td>
                  <td className="px-5 py-3.5 text-center">
                    <CellValue val={row.free} highlight={row.highlight} />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <CellValue val={row.lite} highlight={row.highlight} />
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <CellValue val={row.pro} highlight={row.highlight} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-[#FFF3E0] px-5 py-2 text-right text-xs font-medium text-[#FF9500]">
            ← {locale === "zh-HK" ? "全行最低" : "Lowest in industry"}
          </div>
        </div>

        {/* Mobile accordion cards */}
        <div className="flex flex-col gap-3 md:hidden">
          {plans.map((plan) => {
            const isOpen = expandedPlan === plan;
            const colKey =
              plan === "Free" ? "free" : plan.startsWith("Lite") ? "lite" : "pro";
            return (
              <div
                key={plan}
                className={`rounded-xl border transition-colors ${
                  isOpen ? "border-[#FF9500] bg-[#FFF3E0]/30" : "border-zinc-200"
                }`}
              >
                <button
                  onClick={() => setExpandedPlan(isOpen ? null : plan)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-bold"
                >
                  {plan}
                  <span
                    className={`text-[#FF9500] transition-transform ${isOpen ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-zinc-100 px-5 py-3">
                    {c.tableRows.map((row, i) => {
                      const val = row[colKey as keyof typeof row];
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between py-2 text-sm ${
                            row.highlight ? "font-bold text-[#FF9500]" : ""
                          }`}
                        >
                          <span>{row.label}</span>
                          <CellValue val={val as string | boolean} highlight={row.highlight} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Cell value display ─── */
function CellValue({ val, highlight }: { val: string | boolean | undefined; highlight?: boolean }) {
  if (val === true)
    return <span className="text-[#FF9500]">✓</span>;
  if (val === false) return <span className="text-zinc-300">✗</span>;
  return (
    <span className={highlight ? "font-bold text-[#FF9500]" : ""}>
      {val}
    </span>
  );
}

/* ─── FAQ Accordion Item ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [open]);

  return (
    <div
      className={`rounded-xl border transition-colors ${
        open ? "border-[#FF9500]/30 bg-[#FFF3E0]/20" : "border-zinc-200 bg-white"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="pr-4 text-sm font-semibold md:text-base">{q}</span>
        <span
          className={`shrink-0 text-lg text-[#FF9500] transition-transform ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: height }}
      >
        <p className="px-5 pb-4 text-sm leading-relaxed text-zinc-500">
          {a}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STYLES (embedded to match LandingPage pattern)
   ═══════════════════════════════════════════════ */
const pricingStyles = `
  .pricing-page {
    --orange: #FF9500;
    --orange-light: #FFF3E0;
  }

  /* Hero gradient mesh */
  .pricing-hero-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #FFF3E0 0%, #ffffff 50%, #FFF9F0 100%);
    z-index: 0;
  }

  /* Slider styling */
  .pricing-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 8px;
    border-radius: 999px;
    background: linear-gradient(90deg, #FF9500, #FFB84D);
    outline: none;
    cursor: pointer;
  }
  .pricing-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #FF9500;
    border: 4px solid white;
    box-shadow: 0 2px 8px rgba(255,149,0,0.4);
    cursor: pointer;
    transition: transform 0.15s;
  }
  .pricing-slider::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }
  .pricing-slider::-moz-range-thumb {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #FF9500;
    border: 4px solid white;
    box-shadow: 0 2px 8px rgba(255,149,0,0.4);
    cursor: pointer;
  }

  /* Bar animation */
  .pricing-bar {
    transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .pricing-bar-pulse {
    animation: barPulse 2s ease-in-out infinite;
  }
  @keyframes barPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  /* CTA glow */
  .pricing-cta-glow {
    position: absolute;
    width: 500px;
    height: 500px;
    background: #FF9500;
    border-radius: 50%;
    filter: blur(200px);
    opacity: 0.1;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  /* CTA button hover spark effect */
  .pricing-cta-btn {
    position: relative;
    overflow: hidden;
  }
  .pricing-cta-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }
  .pricing-cta-btn:hover::after {
    transform: translateX(100%);
  }
`;
