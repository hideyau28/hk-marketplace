"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

/* ─── i18n (mirrors LandingPage T dict, Studio-tone copy) ─── */
const T = {
  "zh-HK": {
    navPricing: "定價",
    navStart: "免費開店",
    eyebrow: "為精緻 IG 小店而設",
    heroTitle: "由 IG 連結",
    heroTitleAccent: "開始嘅",
    heroTitleSuffix: "精品店面",
    heroSub:
      "為香港有品味嘅首飾、服裝、花藝小店而設。一條 link，一個 storefront，零佣金。",
    heroCta: "免費開始",
    heroSecondary: "睇示範",
    painEyebrow: "你嘅日常",
    painTitle: "用 IG DM 做生意，係咪愈做愈累？",
    pain1: "DM 覆到手軟",
    pain2: "訂單亂晒龍",
    pain3: "收錢好麻煩",
    pain4: "永遠困喺 DM 入面",
    howEyebrow: "三步開店",
    howTitle: "由 link 到生意，最快兩分鐘。",
    howStep1Num: "01",
    howStep1Title: "填店名",
    howStep1Desc: "30 秒搞掂",
    howStep2Num: "02",
    howStep2Title: "揀風格",
    howStep2Desc: "現成模板任你揀",
    howStep3Num: "03",
    howStep3Title: "上架開賣",
    howStep3Desc: "影相上架，即刻收單",
    pricingEyebrow: "定價",
    pricingTitle: "簡單透明，0% 佣金。",
    pricingSub: "你賺幾多就係幾多。",
    pricingFreeName: "Free",
    pricingFreeDesc: "試水溫",
    pricingFreePrice: "$0",
    pricingFreeFeats: ["10 件商品", "50 張訂單／月", "全部收款方式"],
    pricingLiteName: "Lite",
    pricingLiteDesc: "認真副業",
    pricingLitePrice: "$78",
    pricingLiteFeats: ["50 件商品", "無限訂單", "折扣碼", "銷售分析"],
    pricingProName: "Pro",
    pricingProDesc: "全職生意",
    pricingProPrice: "$198",
    pricingProFeats: ["無限商品", "無限訂單 + CRM", "優先客服", "自訂域名（即將推出）"],
    pricingPeriod: "／月",
    pricingPopular: "最受歡迎",
    pricingCta: "選擇方案",
    pricingFullLink: "查看完整定價",
    voiceEyebrow: "首批商戶",
    voice1Quote: "訂單自動入 system，付款狀態一目了然，慳返好多時間。",
    voice1Name: "May",
    voice1Shop: "@maysshop · 飾物店",
    voice2Quote: "客人自己揀 FPS 定 PayMe，所有訂單一覽無遺。",
    voice2Name: "K 小姐",
    voice2Shop: "K 小姐 · 手作店",
    voice3Quote: "終於唔使再用 Excel 記庫存，規格管理好方便。",
    voice3Name: "陳先生",
    voice3Shop: "陳先生 · 波鞋代購",
    ctaTitle: "Ready to ship.",
    ctaSub: "2 分鐘開店 · 0% 佣金 · 唔使信用卡。",
    ctaPrimary: "免費開始",
    ctaSecondary: "睇示範",
    footerCopy: "© 2026 WoWlix · Hong Kong",
    footerTerms: "服務條款",
    footerPrivacy: "私隱政策",
    footerContact: "聯絡",
  },
  en: {
    navPricing: "Pricing",
    navStart: "Start free",
    eyebrow: "Built for tasteful IG shops",
    heroTitle: "A storefront",
    heroTitleAccent: "worthy",
    heroTitleSuffix: "of your IG.",
    heroSub:
      "Made for Hong Kong's curated jewellery, fashion, and floral shops. One link, one boutique, zero commission.",
    heroCta: "Start free",
    heroSecondary: "See it in action",
    painEyebrow: "Sound familiar?",
    painTitle: "Running a business in IG DMs gets harder every day.",
    pain1: "DM overload",
    pain2: "Lost orders",
    pain3: "Payment chaos",
    pain4: "Forever stuck in DMs",
    howEyebrow: "Three steps",
    howTitle: "From link to live in two minutes.",
    howStep1Num: "01",
    howStep1Title: "Name your shop",
    howStep1Desc: "Done in 30 seconds",
    howStep2Num: "02",
    howStep2Title: "Pick a style",
    howStep2Desc: "Curated templates",
    howStep3Num: "03",
    howStep3Title: "List & sell",
    howStep3Desc: "Photos up, orders in",
    pricingEyebrow: "Pricing",
    pricingTitle: "Simple, transparent, 0% commission.",
    pricingSub: "What you earn is what you keep.",
    pricingFreeName: "Free",
    pricingFreeDesc: "Test the waters",
    pricingFreePrice: "$0",
    pricingFreeFeats: ["10 products", "50 orders / mo", "All payment methods"],
    pricingLiteName: "Lite",
    pricingLiteDesc: "Serious side hustle",
    pricingLitePrice: "$78",
    pricingLiteFeats: ["50 products", "Unlimited orders", "Discount codes", "Analytics"],
    pricingProName: "Pro",
    pricingProDesc: "Full-time business",
    pricingProPrice: "$198",
    pricingProFeats: ["Unlimited products", "Orders + CRM", "Priority support", "Custom domain (soon)"],
    pricingPeriod: "/mo",
    pricingPopular: "Most popular",
    pricingCta: "Choose plan",
    pricingFullLink: "See full pricing",
    voiceEyebrow: "Early merchants",
    voice1Quote:
      "Orders auto-track and payment status is crystal clear — saves me hours.",
    voice1Name: "May",
    voice1Shop: "@maysshop · Jewelry",
    voice2Quote:
      "Customers pick FPS or PayMe themselves. All orders in one dashboard.",
    voice2Name: "K",
    voice2Shop: "K · Handmade",
    voice3Quote: "No more Excel for inventory. Variant management just works.",
    voice3Name: "Mr. Chan",
    voice3Shop: "Mr. Chan · Sneaker Reseller",
    ctaTitle: "Ready to ship.",
    ctaSub: "2 min setup · 0% commission · No credit card.",
    ctaPrimary: "Start free",
    ctaSecondary: "See demo",
    footerCopy: "© 2026 WoWlix · Hong Kong",
    footerTerms: "Terms",
    footerPrivacy: "Privacy",
    footerContact: "Contact",
  },
};

type Props = { locale?: Locale };

export default function StudioLandingPage({ locale = "zh-HK" }: Props) {
  const t = T[locale] || T.en;
  const otherLocale = locale === "zh-HK" ? "en" : "zh-HK";

  // Subtle scroll-reveal on `.studio-reveal` sections
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
      {/* ────────── Nav ────────── */}
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
              href={`/${locale}/pricing`}
              className="text-[12px] uppercase tracking-[0.18em] text-wlx-stone hover:text-wlx-ink transition-colors duration-200"
              style={{ transitionTimingFunction: "var(--wlx-ease)" }}
            >
              {t.navPricing}
            </Link>
            <Link
              href={`/${otherLocale}`}
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

      {/* ────────── Hero ────────── */}
      <section className="border-b border-wlx-mist">
        <div className="mx-auto max-w-[1200px] px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-32">
          <p className="text-[11px] uppercase tracking-[0.22em] text-wlx-stone">
            {t.eyebrow}
          </p>
          <h1 className="mt-6 font-wlx-display text-[clamp(40px,9vw,88px)] leading-[1.02] tracking-tight">
            {t.heroTitle}{" "}
            <span className="font-wlx-serif italic font-normal text-wlx-stone">
              {t.heroTitleAccent}
            </span>{" "}
            {t.heroTitleSuffix}
          </h1>
          <p className="mt-6 max-w-[42ch] text-base sm:text-lg leading-relaxed text-wlx-stone">
            {t.heroSub}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href={`/${locale}/start`}
              className="inline-block bg-wlx-ink px-7 py-4 text-[12px] uppercase tracking-[0.22em] text-wlx-paper hover:bg-wlx-ink/90 transition-colors duration-200"
              style={{ transitionTimingFunction: "var(--wlx-ease)" }}
            >
              {t.heroCta}
            </Link>
            <Link
              href={`/${locale}/solemena-test`}
              className="inline-block px-7 py-4 text-[12px] uppercase tracking-[0.22em] text-wlx-ink border border-wlx-mist hover:border-wlx-ink transition-colors duration-200"
              style={{ transitionTimingFunction: "var(--wlx-ease)" }}
            >
              {t.heroSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ────────── Pain ────────── */}
      <section className="studio-reveal border-b border-wlx-mist">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-[11px] uppercase tracking-[0.22em] text-wlx-stone">
            {t.painEyebrow}
          </p>
          <h2 className="mt-5 max-w-[28ch] font-wlx-display text-[clamp(28px,4.5vw,44px)] leading-tight tracking-tight">
            {t.painTitle}
          </h2>
          <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {[t.pain1, t.pain2, t.pain3, t.pain4].map((item, i) => (
              <li
                key={i}
                className="border-t border-wlx-mist pt-5 text-sm text-wlx-ink"
              >
                <span className="block text-[11px] uppercase tracking-[0.2em] text-wlx-stone">
                  0{i + 1}
                </span>
                <span className="mt-3 block text-base leading-snug">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ────────── How ────────── */}
      <section className="studio-reveal border-b border-wlx-mist bg-wlx-cream">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-[11px] uppercase tracking-[0.22em] text-wlx-stone">
            {t.howEyebrow}
          </p>
          <h2 className="mt-5 max-w-[28ch] font-wlx-display text-[clamp(28px,4.5vw,44px)] leading-tight tracking-tight">
            {t.howTitle}
          </h2>
          <ol className="mt-14 grid grid-cols-1 gap-12 sm:grid-cols-3">
            {[
              { n: t.howStep1Num, h: t.howStep1Title, d: t.howStep1Desc },
              { n: t.howStep2Num, h: t.howStep2Title, d: t.howStep2Desc },
              { n: t.howStep3Num, h: t.howStep3Title, d: t.howStep3Desc },
            ].map((step, i) => (
              <li key={i} className="border-t border-wlx-mist pt-6">
                <span className="font-wlx-serif italic text-3xl text-wlx-stone">
                  {step.n}
                </span>
                <h3 className="mt-3 font-wlx-display text-xl tracking-tight">
                  {step.h}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-wlx-stone">
                  {step.d}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ────────── Pricing teaser ────────── */}
      <section className="studio-reveal border-b border-wlx-mist">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-[11px] uppercase tracking-[0.22em] text-wlx-stone">
            {t.pricingEyebrow}
          </p>
          <h2 className="mt-5 font-wlx-display text-[clamp(28px,4.5vw,44px)] leading-tight tracking-tight">
            {t.pricingTitle}
          </h2>
          <p className="mt-3 text-base text-wlx-stone">{t.pricingSub}</p>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Free */}
            <article className="flex flex-col border border-wlx-mist p-8">
              <h3 className="font-wlx-display text-xl tracking-tight">
                {t.pricingFreeName}
              </h3>
              <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-wlx-stone">
                {t.pricingFreeDesc}
              </p>
              <p className="mt-7 text-4xl tabular-nums">
                {t.pricingFreePrice}
                <span className="ml-1 text-sm text-wlx-stone">
                  {t.pricingPeriod}
                </span>
              </p>
              <ul className="mt-7 flex-1 space-y-2 text-sm text-wlx-ink">
                {t.pricingFreeFeats.map((f) => (
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
                {t.pricingCta}
              </Link>
            </article>

            {/* Lite (most popular) */}
            <article className="relative flex flex-col bg-wlx-ink p-8 text-wlx-paper">
              <div className="absolute -top-3 left-8 bg-wlx-accent px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-wlx-accent-fg">
                {t.pricingPopular}
              </div>
              <h3 className="font-wlx-display text-xl tracking-tight">
                {t.pricingLiteName}
              </h3>
              <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-wlx-paper/70">
                {t.pricingLiteDesc}
              </p>
              <p className="mt-7 text-4xl tabular-nums">
                {t.pricingLitePrice}
                <span className="ml-1 text-sm text-wlx-paper/70">
                  {t.pricingPeriod}
                </span>
              </p>
              <ul className="mt-7 flex-1 space-y-2 text-sm">
                {t.pricingLiteFeats.map((f) => (
                  <li key={f} className="border-t border-wlx-paper/15 pt-2">
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/start?plan=lite`}
                className="mt-8 inline-block bg-wlx-paper py-3 text-center text-[12px] uppercase tracking-[0.22em] text-wlx-ink hover:bg-wlx-paper/90 transition-colors duration-200"
                style={{ transitionTimingFunction: "var(--wlx-ease)" }}
              >
                {t.pricingCta}
              </Link>
            </article>

            {/* Pro */}
            <article className="flex flex-col border border-wlx-mist p-8">
              <h3 className="font-wlx-display text-xl tracking-tight">
                {t.pricingProName}
              </h3>
              <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-wlx-stone">
                {t.pricingProDesc}
              </p>
              <p className="mt-7 text-4xl tabular-nums">
                {t.pricingProPrice}
                <span className="ml-1 text-sm text-wlx-stone">
                  {t.pricingPeriod}
                </span>
              </p>
              <ul className="mt-7 flex-1 space-y-2 text-sm text-wlx-ink">
                {t.pricingProFeats.map((f) => (
                  <li key={f} className="border-t border-wlx-mist pt-2">
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/start?plan=pro`}
                className="mt-8 inline-block border border-wlx-ink py-3 text-center text-[12px] uppercase tracking-[0.22em] hover:bg-wlx-ink hover:text-wlx-paper transition-colors duration-200"
                style={{ transitionTimingFunction: "var(--wlx-ease)" }}
              >
                {t.pricingCta}
              </Link>
            </article>
          </div>

          <Link
            href={`/${locale}/pricing`}
            className="mt-10 inline-block text-[12px] uppercase tracking-[0.22em] text-wlx-stone hover:text-wlx-ink transition-colors duration-200"
            style={{ transitionTimingFunction: "var(--wlx-ease)" }}
          >
            {t.pricingFullLink} →
          </Link>
        </div>
      </section>

      {/* ────────── Voices / testimonials ────────── */}
      <section className="studio-reveal border-b border-wlx-mist">
        <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-[11px] uppercase tracking-[0.22em] text-wlx-stone">
            {t.voiceEyebrow}
          </p>
          <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-3">
            {[
              { q: t.voice1Quote, n: t.voice1Name, s: t.voice1Shop },
              { q: t.voice2Quote, n: t.voice2Name, s: t.voice2Shop },
              { q: t.voice3Quote, n: t.voice3Name, s: t.voice3Shop },
            ].map((v, i) => (
              <figure key={i} className="border-t border-wlx-mist pt-6">
                <blockquote className="font-wlx-serif italic text-lg leading-relaxed text-wlx-ink">
                  &ldquo;{v.q}&rdquo;
                </blockquote>
                <figcaption className="mt-5 text-[12px] uppercase tracking-[0.18em] text-wlx-stone">
                  {v.n} <span className="mx-1">·</span> {v.s}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── Final CTA ────────── */}
      <section className="bg-wlx-ink">
        <div className="mx-auto max-w-[900px] px-5 py-24 sm:px-8 sm:py-32 text-center">
          <h2 className="font-wlx-display text-[clamp(40px,7vw,72px)] tracking-tight leading-[1.05] text-wlx-paper">
            {t.ctaTitle}
          </h2>
          <p className="mt-6 text-base sm:text-lg text-wlx-paper/75">
            {t.ctaSub}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${locale}/start`}
              className="inline-block bg-wlx-paper px-7 py-4 text-[12px] uppercase tracking-[0.22em] text-wlx-ink hover:bg-wlx-paper/90 transition-colors duration-200"
              style={{ transitionTimingFunction: "var(--wlx-ease)" }}
            >
              {t.ctaPrimary}
            </Link>
            <Link
              href={`/${locale}/solemena-test`}
              className="inline-block px-7 py-4 text-[12px] uppercase tracking-[0.22em] text-wlx-paper border border-wlx-paper/30 hover:border-wlx-paper transition-colors duration-200"
              style={{ transitionTimingFunction: "var(--wlx-ease)" }}
            >
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ────────── Footer ────────── */}
      <footer className="border-t border-wlx-mist bg-wlx-paper">
        <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] uppercase tracking-[0.18em] text-wlx-stone">
            {t.footerCopy}
          </p>
          <ul className="flex flex-wrap gap-6">
            <li>
              <Link
                href={`/${locale}/terms`}
                className="text-[12px] uppercase tracking-[0.18em] text-wlx-stone hover:text-wlx-ink transition-colors duration-200"
                style={{ transitionTimingFunction: "var(--wlx-ease)" }}
              >
                {t.footerTerms}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/privacy`}
                className="text-[12px] uppercase tracking-[0.18em] text-wlx-stone hover:text-wlx-ink transition-colors duration-200"
                style={{ transitionTimingFunction: "var(--wlx-ease)" }}
              >
                {t.footerPrivacy}
              </Link>
            </li>
            <li>
              <Link
                href={`/${locale}/contact`}
                className="text-[12px] uppercase tracking-[0.18em] text-wlx-stone hover:text-wlx-ink transition-colors duration-200"
                style={{ transitionTimingFunction: "var(--wlx-ease)" }}
              >
                {t.footerContact}
              </Link>
            </li>
          </ul>
        </div>
      </footer>

      {/* Reveal animation */}
      <style jsx global>{`
        .studio-reveal {
          opacity: 0;
          transform: translateY(48px);
          transition: opacity 600ms var(--wlx-ease),
            transform 600ms var(--wlx-ease);
        }
        .studio-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
