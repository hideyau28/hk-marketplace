"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

type Props = { locale?: Locale };

const T = {
  "zh-HK": {
    navHome: "首頁",
    navStart: "免費開店",
    eyebrow: "定價",
    title: "簡單透明，0% 佣金。",
    sub: "你賺幾多就係幾多。月繳、隨時取消，唔需要長合約。",
    period: "／月",
    popular: "最受歡迎",
    free: {
      name: "Free",
      price: "$0",
      desc: "零成本試水溫",
      feats: ["10 件商品", "每月 50 張訂單", "全部收款方式（FPS · PayMe · 信用卡）", "1 款店鋪主題"],
      cta: "免費開始",
    },
    lite: {
      name: "Lite",
      price: "$78",
      desc: "認真副業",
      feats: [
        "50 件商品",
        "無限訂單",
        "全部主題",
        "WhatsApp 預填訊息",
        "折扣碼",
        "訂單 CSV 匯出",
        "基本數據分析",
      ],
      cta: "選擇 Lite",
    },
    pro: {
      name: "Pro",
      price: "$198",
      desc: "全職生意",
      feats: [
        "無限商品",
        "無限訂單",
        "全部主題",
        "進階數據分析 + 熱賣排行",
        "棄單挽回",
        "CRM 客戶庫",
        "優先客服",
        "移除 WoWlix branding",
        "自訂域名（即將推出）",
      ],
      cta: "選擇 Pro",
    },
    faqEyebrow: "常見問題",
    faq: [
      {
        q: "Free Plan 有冇限制？",
        a: "10 件商品、每月 50 張訂單，過咗就需要升級。0% 平台佣金，永遠免費。",
      },
      {
        q: "可以隨時取消嗎？",
        a: "可以。月繳，隨時取消，下個 billing cycle 自動降級到 Free。",
      },
      {
        q: "升級會扣咩錢？",
        a: "我哋按月計，按比例計算嗰個月剩餘日數。冇隱藏收費。",
      },
      {
        q: "支援邊啲收款方式？",
        a: "FPS 轉數快、PayMe、AlipayHK、信用卡（經 Stripe Connect）。所有 plan 都包。",
      },
    ],
    ctaTitle: "夠晒料？開始啦。",
    ctaSub: "2 分鐘開店 · 唔使信用卡 · 永遠 0% 佣金",
    ctaBtn: "免費開始",
  },
  en: {
    navHome: "Home",
    navStart: "Start free",
    eyebrow: "Pricing",
    title: "Simple, transparent, 0% commission.",
    sub: "What you earn is what you keep. Monthly, cancel anytime, no contracts.",
    period: "/mo",
    popular: "Most popular",
    free: {
      name: "Free",
      price: "$0",
      desc: "Zero cost to start",
      feats: ["10 products", "50 orders / mo", "All payment methods (FPS · PayMe · card)", "1 store theme"],
      cta: "Start free",
    },
    lite: {
      name: "Lite",
      price: "$78",
      desc: "Serious side hustle",
      feats: [
        "50 products",
        "Unlimited orders",
        "All themes",
        "WhatsApp prefill",
        "Discount codes",
        "Order CSV export",
        "Basic analytics",
      ],
      cta: "Choose Lite",
    },
    pro: {
      name: "Pro",
      price: "$198",
      desc: "Full-time business",
      feats: [
        "Unlimited products",
        "Unlimited orders",
        "All themes",
        "Advanced analytics + bestsellers",
        "Abandoned cart recovery",
        "CRM customer database",
        "Priority support",
        "Remove WoWlix branding",
        "Custom domain (coming soon)",
      ],
      cta: "Choose Pro",
    },
    faqEyebrow: "FAQ",
    faq: [
      {
        q: "What are the limits on Free?",
        a: "10 products and 50 orders per month. Past that, upgrade. 0% commission forever.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. Monthly billing, cancel anytime, downgrades to Free at next cycle.",
      },
      {
        q: "How does upgrading work?",
        a: "Pro-rated for the remainder of the month. No hidden fees.",
      },
      {
        q: "Which payment methods are supported?",
        a: "FPS, PayMe, AlipayHK, and credit cards (via Stripe Connect). Available on all plans.",
      },
    ],
    ctaTitle: "Seen enough? Start building.",
    ctaSub: "2 min setup · No credit card · 0% commission, always",
    ctaBtn: "Start free",
  },
};

export default function StudioPricingPage({ locale = "zh-HK" }: Props) {
  const t = T[locale] || T.en;
  const otherLocale = locale === "zh-HK" ? "en" : "zh-HK";

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".studio-reveal");
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "120px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-wlx-paper text-wlx-ink font-wlx-sans">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-wlx-mist bg-wlx-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href={`/${locale}`}
            className="font-wlx-display text-lg tracking-tight"
          >
            WoWlix
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href={`/${locale}`}
              className="text-[12px] uppercase tracking-[0.18em] text-wlx-stone hover:text-wlx-ink transition-colors duration-200"
              style={{ transitionTimingFunction: "var(--wlx-ease)" }}
            >
              {t.navHome}
            </Link>
            <Link
              href={`/${otherLocale}/pricing`}
              className="text-[12px] uppercase tracking-[0.18em] text-wlx-stone hover:text-wlx-ink transition-colors duration-200"
              style={{ transitionTimingFunction: "var(--wlx-ease)" }}
            >
              {locale === "zh-HK" ? "EN" : "繁"}
            </Link>
            <Link
              href={`/${locale}/start`}
              className="hidden sm:inline-block bg-wlx-ink px-5 py-2.5 text-[12px] uppercase tracking-[0.18em] text-wlx-paper hover:bg-wlx-ink/90 transition-colors duration-200"
              style={{ transitionTimingFunction: "var(--wlx-ease)" }}
            >
              {t.navStart}
            </Link>
          </nav>
        </div>
      </header>

      {/* Header */}
      <section className="border-b border-wlx-mist">
        <div className="mx-auto max-w-[1200px] px-5 pt-16 pb-12 sm:px-8 sm:pt-24 sm:pb-16">
          <p className="text-[11px] uppercase tracking-[0.22em] text-wlx-stone">
            {t.eyebrow}
          </p>
          <h1 className="mt-6 font-wlx-display text-[clamp(36px,7vw,72px)] tracking-tight leading-[1.05]">
            {t.title}
          </h1>
          <p className="mt-5 max-w-[48ch] text-base sm:text-lg text-wlx-stone">
            {t.sub}
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="border-b border-wlx-mist">
        <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Free */}
            <article className="flex flex-col border border-wlx-mist p-8">
              <h2 className="font-wlx-display text-xl tracking-tight">
                {t.free.name}
              </h2>
              <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-wlx-stone">
                {t.free.desc}
              </p>
              <p className="mt-7 text-5xl tabular-nums">
                {t.free.price}
                <span className="ml-1 text-sm text-wlx-stone">{t.period}</span>
              </p>
              <ul className="mt-7 flex-1 space-y-2 text-sm text-wlx-ink">
                {t.free.feats.map((f) => (
                  <li key={f} className="border-t border-wlx-mist pt-2">
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/start`}
                className="mt-8 inline-block border border-wlx-ink py-3 text-center text-[12px] uppercase tracking-[0.22em] hover:bg-wlx-ink hover:text-wlx-paper transition-colors duration-200"
                style={{ transitionTimingFunction: "var(--wlx-ease)" }}
              >
                {t.free.cta}
              </Link>
            </article>

            {/* Lite */}
            <article className="flex flex-col border border-wlx-mist p-8">
              <h2 className="font-wlx-display text-xl tracking-tight">
                {t.lite.name}
              </h2>
              <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-wlx-stone">
                {t.lite.desc}
              </p>
              <p className="mt-7 text-5xl tabular-nums">
                {t.lite.price}
                <span className="ml-1 text-sm text-wlx-stone">{t.period}</span>
              </p>
              <ul className="mt-7 flex-1 space-y-2 text-sm text-wlx-ink">
                {t.lite.feats.map((f) => (
                  <li key={f} className="border-t border-wlx-mist pt-2">
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/start?plan=lite`}
                className="mt-8 inline-block border border-wlx-ink py-3 text-center text-[12px] uppercase tracking-[0.22em] hover:bg-wlx-ink hover:text-wlx-paper transition-colors duration-200"
                style={{ transitionTimingFunction: "var(--wlx-ease)" }}
              >
                {t.lite.cta}
              </Link>
            </article>

            {/* Pro */}
            <article className="relative flex flex-col bg-wlx-ink p-8 text-wlx-paper">
              <div className="absolute -top-3 left-8 bg-wlx-accent px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-wlx-accent-fg">
                {t.popular}
              </div>
              <h2 className="font-wlx-display text-xl tracking-tight">
                {t.pro.name}
              </h2>
              <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-wlx-paper/70">
                {t.pro.desc}
              </p>
              <p className="mt-7 text-5xl tabular-nums">
                {t.pro.price}
                <span className="ml-1 text-sm text-wlx-paper/70">
                  {t.period}
                </span>
              </p>
              <ul className="mt-7 flex-1 space-y-2 text-sm">
                {t.pro.feats.map((f) => (
                  <li key={f} className="border-t border-wlx-paper/15 pt-2">
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/start?plan=pro`}
                className="mt-8 inline-block bg-wlx-paper py-3 text-center text-[12px] uppercase tracking-[0.22em] text-wlx-ink hover:bg-wlx-paper/90 transition-colors duration-200"
                style={{ transitionTimingFunction: "var(--wlx-ease)" }}
              >
                {t.pro.cta}
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="studio-reveal border-b border-wlx-mist bg-wlx-cream">
        <div className="mx-auto max-w-[860px] px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-[11px] uppercase tracking-[0.22em] text-wlx-stone">
            {t.faqEyebrow}
          </p>
          <dl className="mt-12 divide-y divide-wlx-mist">
            {t.faq.map((item) => (
              <div key={item.q} className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-3">
                <dt className="font-wlx-display text-base sm:text-lg tracking-tight sm:col-span-1">
                  {item.q}
                </dt>
                <dd className="text-sm leading-relaxed text-wlx-stone sm:col-span-2">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-wlx-ink">
        <div className="mx-auto max-w-[900px] px-5 py-24 sm:px-8 sm:py-32 text-center">
          <h2 className="font-wlx-display text-[clamp(36px,6vw,64px)] tracking-tight leading-[1.05] text-wlx-paper">
            {t.ctaTitle}
          </h2>
          <p className="mt-6 text-base sm:text-lg text-wlx-paper/75">
            {t.ctaSub}
          </p>
          <Link
            href={`/${locale}/start`}
            className="mt-10 inline-block bg-wlx-paper px-7 py-4 text-[12px] uppercase tracking-[0.22em] text-wlx-ink hover:bg-wlx-paper/90 transition-colors duration-200"
            style={{ transitionTimingFunction: "var(--wlx-ease)" }}
          >
            {t.ctaBtn}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-wlx-mist bg-wlx-paper">
        <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
          <p className="text-[12px] uppercase tracking-[0.18em] text-wlx-stone">
            © 2026 WoWlix · Hong Kong
          </p>
        </div>
      </footer>
    </div>
  );
}
