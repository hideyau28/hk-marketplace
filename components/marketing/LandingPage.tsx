"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import {
  MessageCircle,
  ClipboardList,
  CreditCard,
  TrendingDown,
  Link as LinkIcon,
  ShoppingBag,
  Rocket,
  Check,
  ArrowRight,
  Instagram,
  Facebook,
  Mail,
} from "lucide-react";

/* ─── i18n ─── */
const T = {
  "zh-HK": {
    // Nav
    nav1: "功能",
    nav2: "價錢",
    nav3: "常見問題",
    navCta: "免費開店",
    // Hero
    heroBadge: "🇭🇰 專為香港 IG 店主而設",
    heroH1: "一條 Link\n將 Follower\n變成生意",
    heroSub:
      "唔使識 Code，2 分鐘開好網店。\n將你嘅 IG Bio Link 變成一間真正嘅網上商店。",
    ctaPrimary: "免費開始",
    ctaSecondary: "了解更多",
    trustLine: "✦ 0% 佣金  ·  免費開始  ·  2 分鐘開店",
    // Pain Points
    painLabel: "你係咪都遇到呢啲問題？",
    painTitle: "用 IG DM 做生意\n愈做愈辛苦",
    painSub: "每日覆幾十個 DM、手動記訂單、追數追到頭都大？\n你唔係一個人。",
    pain1t: "DM 覆到手軟",
    pain1d: "客人問價、問尺寸、問存貨⋯⋯同一個問題每日答十次。",
    pain2t: "訂單亂晒龍",
    pain2d: "用 Excel 記訂單、WhatsApp 對數，一忙就走漏眼。",
    pain3t: "收錢好麻煩",
    pain3d: "銀行轉帳要逐個 Check，FPS 截圖成日對唔到。",
    pain4t: "生意做唔大",
    pain4d: "得 IG 一個渠道，無法俾客人自助下單，錯過好多生意。",
    // How It Works
    howLabel: "點樣運作",
    howTitle: "三步開店，簡單到唔信",
    howSub: "由註冊到開店，快過沖杯咖啡。",
    step1Num: "01",
    step1Title: "連結 Instagram",
    step1Desc:
      "登入你嘅 IG 帳號，WoWlix 會自動同步你嘅商品相片同資料。",
    step2Num: "02",
    step2Title: "設定商品同價錢",
    step2Desc: "揀相、寫描述、定價錢——用手機就搞得掂，唔使識 Code。",
    step3Num: "03",
    step3Title: "分享 Link，開始收單",
    step3Desc:
      "將你嘅專屬商店 Link 放入 IG Bio，客人自己落單自己付款。",
    // Pricing
    priceLabel: "價錢方案",
    priceTitle: "簡單透明，0% 佣金",
    priceSub: "所有方案均不收取交易佣金。你賺嘅，全部都係你嘅。",
    freeName: "Free",
    freePrice: "$0",
    freeDesc: "啱啱開始嘅你，零成本試水溫。",
    freeFeats: ["最多 10 件商品", "基本商店頁面", "WhatsApp 通知", "0% 交易佣金"],
    freeBtn: "免費開始",
    liteName: "Lite",
    litePrice: "$78",
    liteDesc: "認真做生意嘅你，需要更多功能。",
    liteFeats: ["無限商品數量", "自訂商店外觀", "折扣碼功能", "銷售數據分析"],
    liteBtn: "選擇 Lite",
    proBadge: "最受歡迎",
    proName: "Pro",
    proPrice: "$198",
    proDesc: "全方位工具，助你成為真正嘅品牌。",
    proFeats: [
      "Lite 所有功能",
      "自訂網域名稱",
      "進階 SEO 工具",
      "自動化營銷工具",
      "優先客服支援",
    ],
    proBtn: "選擇 Pro",
    pricePeriod: "/月",
    // Trust Signals
    trustLabel: "值得信賴",
    trustTitle: "已有 2,000+ 店主選擇 WoWlix",
    stat1Num: "2,000+",
    stat1Label: "活躍店主",
    stat2Num: "$5M+",
    stat2Label: "總交易額",
    stat3Num: "0%",
    stat3Label: "交易佣金",
    stat4Num: "4.9★",
    stat4Label: "平均評分",
    test1Quote:
      "「之前用 DM 接單成日漏單，而家客人自己落單付款，我終於可以專心做產品！」",
    test1Name: "Amy L.",
    test1Role: "飾品 IG 店主",
    test2Quote:
      "「Setup 真係超快，我用咗唔夠 5 分鐘就開好晒，仲要免費！真心推薦。」",
    test2Name: "Karen W.",
    test2Role: "手作甜品 IG 店主",
    test3Quote:
      "「最鍾意佢 0% 佣金，賺幾多都係自己嘅。終於唔使再俾平台抽水！」",
    test3Name: "Michelle C.",
    test3Role: "時裝 IG 店主",
    // Final CTA
    ctaHeadline: "準備好將你嘅\nIG Shop 升級？",
    ctaSubline: "免費開始，無需信用卡。隨時升級，隨時取消。",
    ctaFinalBtn: "免費開店",
    ctaTrust: "✦ 2 分鐘開店  ·  0% 佣金  ·  永久免費方案",
    // Footer
    footerDesc: "專為香港 Instagram 店主而設嘅\n一站式網上商店平台。",
    footerCol1: "產品",
    footerCol1L1: "功能",
    footerCol1L2: "價錢",
    footerCol1L3: "範例商店",
    footerCol2: "公司",
    footerCol2L1: "關於我們",
    footerCol2L2: "聯絡我們",
    footerCol2L3: "Blog",
    footerCol3: "法律",
    footerCol3L1: "私隱政策",
    footerCol3L2: "服務條款",
    footerCopy: "© 2026 WoWlix. All rights reserved.",
  },
  en: {
    nav1: "Features",
    nav2: "Pricing",
    nav3: "FAQ",
    navCta: "Start Free",
    heroBadge: "🇭🇰 Built for HK Instagram shops",
    heroH1: "One Link\nTurn Followers\ninto Sales",
    heroSub:
      "No coding needed, set up your shop in 2 minutes.\nTurn your IG Bio Link into a real online store.",
    ctaPrimary: "Start Free",
    ctaSecondary: "Learn More",
    trustLine: "✦ 0% commission  ·  Start free  ·  2 min setup",
    painLabel: "Sound familiar?",
    painTitle: "Running your IG shop\nis getting harder",
    painSub:
      "Replying to dozens of DMs daily, tracking orders manually, chasing payments?\nYou're not alone.",
    pain1t: "DM overload",
    pain1d: "Customers asking prices, sizes, stock — same questions answered 10 times a day.",
    pain2t: "Orders everywhere",
    pain2d: "Using Excel and WhatsApp to track orders — miss one when you're busy.",
    pain3t: "Payment hassles",
    pain3d: "Checking bank transfers one by one, FPS screenshots never match up.",
    pain4t: "Can't scale up",
    pain4d: "Only one channel on IG, no self-checkout — missing out on sales.",
    howLabel: "How it works",
    howTitle: "3 steps to launch, seriously",
    howSub: "From signup to live store, faster than making coffee.",
    step1Num: "01",
    step1Title: "Connect Instagram",
    step1Desc:
      "Sign in with your IG account, WoWlix auto-syncs your product photos and info.",
    step2Num: "02",
    step2Title: "Set up products & prices",
    step2Desc: "Pick photos, write descriptions, set prices — all from your phone, no code needed.",
    step3Num: "03",
    step3Title: "Share link, start selling",
    step3Desc:
      "Put your store link in your IG Bio — customers order and pay themselves.",
    priceLabel: "Pricing",
    priceTitle: "Simple, transparent, 0% commission",
    priceSub: "No transaction fees on any plan. What you earn is all yours.",
    freeName: "Free",
    freePrice: "$0",
    freeDesc: "Just starting out, zero cost to test the waters.",
    freeFeats: ["Up to 10 products", "Basic store page", "WhatsApp notifications", "0% commission"],
    freeBtn: "Start Free",
    liteName: "Lite",
    litePrice: "$78",
    liteDesc: "For serious sellers who need more features.",
    liteFeats: ["Unlimited products", "Custom store design", "Discount codes", "Sales analytics"],
    liteBtn: "Choose Lite",
    proBadge: "Most popular",
    proName: "Pro",
    proPrice: "$198",
    proDesc: "Full toolkit to build a real brand.",
    proFeats: [
      "All Lite features",
      "Custom domain",
      "Advanced SEO tools",
      "Marketing automation",
      "Priority support",
    ],
    proBtn: "Choose Pro",
    pricePeriod: "/mo",
    trustLabel: "Trusted",
    trustTitle: "2,000+ shop owners choose WoWlix",
    stat1Num: "2,000+",
    stat1Label: "Active shops",
    stat2Num: "$5M+",
    stat2Label: "Total GMV",
    stat3Num: "0%",
    stat3Label: "Commission",
    stat4Num: "4.9★",
    stat4Label: "Avg rating",
    test1Quote:
      '"Used to miss orders via DM — now customers order & pay themselves. I can finally focus on products!"',
    test1Name: "Amy L.",
    test1Role: "Accessories IG shop",
    test2Quote:
      '"Setup was super fast, took less than 5 minutes and it\'s free! Highly recommend."',
    test2Name: "Karen W.",
    test2Role: "Dessert IG shop",
    test3Quote:
      '"Love the 0% commission — what I earn is mine. Finally no more platform fees!"',
    test3Name: "Michelle C.",
    test3Role: "Fashion IG shop",
    ctaHeadline: "Ready to upgrade\nyour IG Shop?",
    ctaSubline: "Start free, no credit card needed. Upgrade or cancel anytime.",
    ctaFinalBtn: "Start Free",
    ctaTrust: "✦ 2 min setup  ·  0% commission  ·  Free plan forever",
    footerDesc:
      "The all-in-one online store platform\nbuilt for Hong Kong Instagram shop owners.",
    footerCol1: "Product",
    footerCol1L1: "Features",
    footerCol1L2: "Pricing",
    footerCol1L3: "Demo stores",
    footerCol2: "Company",
    footerCol2L1: "About us",
    footerCol2L2: "Contact",
    footerCol2L3: "Blog",
    footerCol3: "Legal",
    footerCol3L1: "Privacy Policy",
    footerCol3L2: "Terms of Service",
    footerCopy: "© 2026 WoWlix. All rights reserved.",
  },
};

/* ─── Pain card icons ─── */
const PAIN_ICONS = [MessageCircle, ClipboardList, CreditCard, TrendingDown] as const;

/* ─── Step icons ─── */
const STEP_ICONS = [LinkIcon, ShoppingBag, Rocket] as const;

/* ─── Main Component ─── */

export default function LandingPage({
  locale = "zh-HK",
}: {
  locale?: Locale;
}) {
  const t = T[locale] || T["en"];

  return (
    <div className="font-body text-[#1A1A1A] overflow-x-hidden">
      {/* ─── HEADER ─── */}
      <header className="flex items-center justify-between bg-[#0D0D0D] px-20 py-5 max-md:px-6 max-md:py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-[#FF9500]">
            <span className="font-display text-xl font-black text-white">
              W
            </span>
          </div>
          <span className="font-display text-[22px] font-extrabold tracking-tight text-white">
            WoWlix
          </span>
        </div>
        <div className="flex items-center gap-9 max-md:gap-4">
          <span className="text-[15px] font-medium text-white/80 cursor-pointer hover:text-white transition-colors max-md:hidden">
            {t.nav1}
          </span>
          <span className="text-[15px] font-medium text-white/80 cursor-pointer hover:text-white transition-colors max-md:hidden">
            {t.nav2}
          </span>
          <span className="text-[15px] font-medium text-white/80 cursor-pointer hover:text-white transition-colors max-md:hidden">
            {t.nav3}
          </span>
          <Link
            href={`/${locale}/start`}
            className="font-body text-sm font-semibold text-white bg-[#FF9500] rounded-full px-6 py-2.5 hover:bg-[#E68600] transition-colors"
          >
            {t.navCta}
          </Link>
        </div>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section
        className="flex items-center justify-between gap-[60px] px-20 py-[100px] max-lg:flex-col max-lg:items-center max-lg:text-center max-md:px-6 max-md:py-16"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, #5C2E00 0%, #2A1500 20%, #0D0D0D 60%)",
        }}
      >
        {/* Hero Text */}
        <div className="flex flex-col gap-8 max-w-[680px]">
          {/* Badge */}
          <div className="flex items-center gap-2 bg-[#FF950020] rounded-full px-4 py-2 w-fit max-lg:mx-auto">
            <div className="w-2 h-2 rounded-full bg-[#FF9500]" />
            <span className="font-body text-[13px] font-medium text-[#FFB347]">
              {t.heroBadge}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-[72px] font-black leading-none tracking-[-2px] text-white whitespace-pre-line max-md:text-[44px]">
            {t.heroH1}
          </h1>

          {/* Subline */}
          <p className="font-body text-[19px] font-normal leading-relaxed text-white/65 max-w-[520px] whitespace-pre-line max-lg:mx-auto">
            {t.heroSub}
          </p>

          {/* CTA Row */}
          <div className="flex items-center gap-4 max-lg:justify-center">
            <Link
              href={`/${locale}/start`}
              className="flex items-center gap-2 font-display text-[17px] font-bold text-white bg-[#FF9500] rounded-full px-8 py-4 hover:bg-[#E68600] transition-colors"
            >
              {t.ctaPrimary}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/${locale}/pricing`}
              className="font-display text-[17px] font-semibold text-white/80 border-[1.5px] border-white/20 rounded-full px-8 py-4 hover:border-white/40 transition-colors"
            >
              {t.ctaSecondary}
            </Link>
          </div>

          {/* Trust line */}
          <p className="font-body text-[13px] font-medium text-white/40">
            {t.trustLine}
          </p>
        </div>

        {/* Phone Mockup */}
        <div className="flex items-center justify-center w-[340px] h-[480px] rounded-[32px] bg-[#1A1A1A] border-[1.5px] border-white/8 shadow-[0_8px_60px_rgba(255,149,0,0.19)] max-md:w-[280px] max-md:h-[400px]">
          <span className="font-body text-sm font-medium text-white/25">
            Screenshot placeholder
          </span>
        </div>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="flex flex-col items-center gap-[60px] bg-[#F9FAFB] px-20 py-[100px] max-md:px-6 max-md:py-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 max-w-[700px]">
          <span className="font-display text-sm font-bold tracking-[1px] text-[#FF9500]">
            {t.painLabel}
          </span>
          <h2 className="font-display text-5xl font-black leading-tight tracking-[-1.5px] text-[#0D0D0D] text-center whitespace-pre-line max-md:text-3xl">
            {t.painTitle}
          </h2>
          <p className="font-body text-[17px] font-normal leading-relaxed text-[#6B7280] text-center max-w-[560px] whitespace-pre-line">
            {t.painSub}
          </p>
        </div>

        {/* Pain Grid — 4 cards */}
        <div className="flex gap-6 w-full max-w-[1280px] max-lg:flex-col">
          {([
            { icon: 0, title: t.pain1t, desc: t.pain1d },
            { icon: 1, title: t.pain2t, desc: t.pain2d },
            { icon: 2, title: t.pain3t, desc: t.pain3d },
            { icon: 3, title: t.pain4t, desc: t.pain4d },
          ] as const).map((card, i) => {
            const Icon = PAIN_ICONS[card.icon];
            return (
              <div
                key={i}
                className="flex-1 flex flex-col gap-4 bg-white rounded-[20px] p-7 border border-[#D1D5DB]"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-[14px] bg-[#FFF3E0]">
                  <Icon className="w-6 h-6 text-[#FF9500]" />
                </div>
                <h3 className="font-display text-xl font-extrabold tracking-[-0.5px] text-[#0D0D0D]">
                  {card.title}
                </h3>
                <p className="font-body text-sm font-normal leading-relaxed text-[#6B7280]">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="flex flex-col items-center gap-16 bg-white px-20 py-[100px] max-md:px-6 max-md:py-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 max-w-[600px]">
          <span className="font-display text-sm font-bold tracking-[1px] text-[#FF9500]">
            {t.howLabel}
          </span>
          <h2 className="font-display text-5xl font-black leading-tight tracking-[-1.5px] text-[#0D0D0D] text-center max-md:text-3xl">
            {t.howTitle}
          </h2>
          <p className="font-body text-[17px] font-normal text-[#6B7280] text-center">
            {t.howSub}
          </p>
        </div>

        {/* Steps */}
        <div className="flex gap-8 w-full max-w-[1280px] max-lg:flex-col">
          {([
            {
              num: t.step1Num,
              title: t.step1Title,
              desc: t.step1Desc,
              icon: 0,
            },
            {
              num: t.step2Num,
              title: t.step2Title,
              desc: t.step2Desc,
              icon: 1,
            },
            {
              num: t.step3Num,
              title: t.step3Title,
              desc: t.step3Desc,
              icon: 2,
            },
          ] as const).map((step, i) => {
            const Icon = STEP_ICONS[step.icon];
            return (
              <div
                key={i}
                className="flex-1 flex flex-col gap-5 bg-[#0D0D0D] rounded-3xl p-9"
              >
                <span className="font-display text-[64px] font-black leading-[0.9] tracking-[-2px] text-[#FF9500]">
                  {step.num}
                </span>
                <h3 className="font-display text-[22px] font-extrabold tracking-[-0.5px] text-white">
                  {step.title}
                </h3>
                <p className="font-body text-sm font-normal leading-relaxed text-white/60">
                  {step.desc}
                </p>
                <div className="flex items-center justify-center w-12 h-12 rounded-[14px] bg-[#FF950025]">
                  <Icon className="w-[22px] h-[22px] text-[#FF9500]" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="flex flex-col items-center gap-16 bg-[#F9FAFB] px-20 py-[100px] max-md:px-6 max-md:py-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 max-w-[600px]">
          <span className="font-display text-sm font-bold tracking-[1px] text-[#FF9500]">
            {t.priceLabel}
          </span>
          <h2 className="font-display text-5xl font-black leading-tight tracking-[-1.5px] text-[#0D0D0D] text-center max-md:text-3xl">
            {t.priceTitle}
          </h2>
          <p className="font-body text-[17px] font-normal leading-relaxed text-[#6B7280] text-center max-w-[500px]">
            {t.priceSub}
          </p>
        </div>

        {/* Price Grid */}
        <div className="flex gap-6 w-full max-w-[1280px] max-lg:flex-col">
          {/* Free */}
          <div className="flex-1 flex flex-col gap-7 bg-white rounded-3xl p-9 border border-[#E5E7EB]">
            <div className="flex flex-col gap-2">
              <span className="font-display text-lg font-bold text-[#6B7280]">
                {t.freeName}
              </span>
              <div className="flex items-end gap-1">
                <span className="font-display text-5xl font-black tracking-[-2px] leading-[0.95] text-[#0D0D0D]">
                  {t.freePrice}
                </span>
                <span className="font-body text-base font-normal text-[#9CA3AF]">
                  {t.pricePeriod}
                </span>
              </div>
              <p className="font-body text-sm font-normal leading-snug text-[#6B7280]">
                {t.freeDesc}
              </p>
            </div>
            <div className="w-full h-px bg-[#E5E7EB]" />
            <div className="flex flex-col gap-3.5">
              {t.freeFeats.map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className="w-[18px] h-[18px] text-[#22C55E]" />
                  <span className="font-body text-sm text-[#0D0D0D]">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href={`/${locale}/start`}
              className="flex items-center justify-center font-display text-[15px] font-bold text-[#0D0D0D] bg-[#F3F4F6] rounded-full py-3.5 px-6 w-full hover:bg-[#E5E7EB] transition-colors"
            >
              {t.freeBtn}
            </Link>
          </div>

          {/* Lite */}
          <div className="flex-1 flex flex-col gap-7 bg-white rounded-3xl p-9 border border-[#E5E7EB]">
            <div className="flex flex-col gap-2">
              <span className="font-display text-lg font-bold text-[#6B7280]">
                {t.liteName}
              </span>
              <div className="flex items-end gap-1">
                <span className="font-display text-5xl font-black tracking-[-2px] leading-[0.95] text-[#0D0D0D]">
                  {t.litePrice}
                </span>
                <span className="font-body text-base font-normal text-[#9CA3AF]">
                  {t.pricePeriod}
                </span>
              </div>
              <p className="font-body text-sm font-normal leading-snug text-[#6B7280]">
                {t.liteDesc}
              </p>
            </div>
            <div className="w-full h-px bg-[#E5E7EB]" />
            <div className="flex flex-col gap-3.5">
              {t.liteFeats.map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className="w-[18px] h-[18px] text-[#22C55E]" />
                  <span className="font-body text-sm text-[#0D0D0D]">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href={`/${locale}/start`}
              className="flex items-center justify-center font-display text-[15px] font-bold text-[#0D0D0D] bg-[#F3F4F6] rounded-full py-3.5 px-6 w-full hover:bg-[#E5E7EB] transition-colors"
            >
              {t.liteBtn}
            </Link>
          </div>

          {/* Pro (highlighted) */}
          <div className="flex-1 flex flex-col gap-7 bg-[#0D0D0D] rounded-3xl p-9 border-2 border-[#FF9500]">
            <div className="font-display text-xs font-bold text-white bg-[#FF9500] rounded-full px-3.5 py-1.5 w-fit">
              {t.proBadge}
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-display text-lg font-bold text-[#FFB347]">
                {t.proName}
              </span>
              <div className="flex items-end gap-1">
                <span className="font-display text-5xl font-black tracking-[-2px] leading-[0.95] text-white">
                  {t.proPrice}
                </span>
                <span className="font-body text-base font-normal text-white/55">
                  {t.pricePeriod}
                </span>
              </div>
              <p className="font-body text-sm font-normal leading-snug text-white/60">
                {t.proDesc}
              </p>
            </div>
            <div className="w-full h-px bg-white/12" />
            <div className="flex flex-col gap-3.5">
              {t.proFeats.map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Check className="w-[18px] h-[18px] text-[#FF9500]" />
                  <span className="font-body text-sm text-white">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href={`/${locale}/start`}
              className="flex items-center justify-center font-display text-[15px] font-bold text-white bg-[#FF9500] rounded-full py-3.5 px-6 w-full hover:bg-[#E68600] transition-colors"
            >
              {t.proBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TRUST SIGNALS ─── */}
      <section className="flex flex-col items-center gap-16 bg-white px-20 py-[100px] max-md:px-6 max-md:py-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 max-w-[600px]">
          <span className="font-display text-sm font-bold tracking-[1px] text-[#FF9500]">
            {t.trustLabel}
          </span>
          <h2 className="font-display text-5xl font-black leading-tight tracking-[-1.5px] text-[#0D0D0D] text-center max-md:text-3xl">
            {t.trustTitle}
          </h2>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-around w-full max-w-[1280px] max-md:flex-col max-md:gap-8">
          {([
            { num: t.stat1Num, label: t.stat1Label },
            { num: t.stat2Num, label: t.stat2Label },
            { num: t.stat3Num, label: t.stat3Label },
            { num: t.stat4Num, label: t.stat4Label },
          ]).map((stat, i, arr) => (
            <div key={i} className="contents">
              <div className="flex flex-col items-center gap-1">
                <span className="font-display text-5xl font-black tracking-[-2px] text-[#FF9500]">
                  {stat.num}
                </span>
                <span className="font-body text-[15px] font-medium text-[#6B7280]">
                  {stat.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className="w-px h-[60px] bg-[#E5E7EB] max-md:hidden" />
              )}
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="flex gap-6 w-full max-w-[1280px] max-lg:flex-col">
          {([
            {
              quote: t.test1Quote,
              name: t.test1Name,
              role: t.test1Role,
              initial: "A",
            },
            {
              quote: t.test2Quote,
              name: t.test2Name,
              role: t.test2Role,
              initial: "K",
            },
            {
              quote: t.test3Quote,
              name: t.test3Name,
              role: t.test3Role,
              initial: "M",
            },
          ]).map((item, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col gap-5 bg-[#F9FAFB] rounded-[20px] p-8 border border-[#E5E7EB]"
            >
              <span className="font-body text-base text-[#FF9500]">
                ★★★★★
              </span>
              <p className="font-body text-[15px] font-normal leading-relaxed text-[#0D0D0D]">
                {item.quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFF3E0]">
                  <span className="font-display text-base font-bold text-[#FF9500]">
                    {item.initial}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-body text-sm font-semibold text-[#0D0D0D]">
                    {item.name}
                  </span>
                  <span className="font-body text-[13px] font-normal text-[#9CA3AF]">
                    {item.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section
        className="flex flex-col items-center gap-9 px-20 py-[120px] max-md:px-6 max-md:py-16"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, #4D2800 0%, #0D0D0D 50%)",
        }}
      >
        <h2 className="font-display text-[56px] font-black leading-[1.05] tracking-[-2px] text-white text-center whitespace-pre-line max-md:text-4xl">
          {t.ctaHeadline}
        </h2>
        <p className="font-body text-lg font-normal text-white/65 text-center">
          {t.ctaSubline}
        </p>
        <Link
          href={`/${locale}/start`}
          className="flex items-center gap-2.5 font-display text-lg font-bold text-white bg-[#FF9500] rounded-full px-10 py-[18px] hover:bg-[#E68600] transition-colors"
        >
          {t.ctaFinalBtn}
          <ArrowRight className="w-[22px] h-[22px]" />
        </Link>
        <p className="font-body text-sm font-medium text-white/35">
          {t.ctaTrust}
        </p>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="flex flex-col gap-12 bg-[#0D0D0D] px-20 pt-[60px] pb-10 max-md:px-6">
        {/* Top */}
        <div className="flex justify-between w-full max-md:flex-col max-md:gap-10">
          {/* Brand */}
          <div className="flex flex-col gap-4 max-w-[320px]">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#FF9500]">
                <span className="font-display text-[17px] font-black text-white">
                  W
                </span>
              </div>
              <span className="font-display text-xl font-extrabold tracking-[-0.5px] text-white">
                WoWlix
              </span>
            </div>
            <p className="font-body text-sm font-normal leading-relaxed text-white/55 whitespace-pre-line">
              {t.footerDesc}
            </p>
          </div>

          {/* Link columns */}
          <div className="flex gap-20 max-md:gap-10">
            <div className="flex flex-col gap-4">
              <span className="font-display text-sm font-bold text-white">
                {t.footerCol1}
              </span>
              <span className="font-body text-sm text-white/55 cursor-pointer hover:text-white/80 transition-colors">
                {t.footerCol1L1}
              </span>
              <span className="font-body text-sm text-white/55 cursor-pointer hover:text-white/80 transition-colors">
                {t.footerCol1L2}
              </span>
              <span className="font-body text-sm text-white/55 cursor-pointer hover:text-white/80 transition-colors">
                {t.footerCol1L3}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-display text-sm font-bold text-white">
                {t.footerCol2}
              </span>
              <span className="font-body text-sm text-white/55 cursor-pointer hover:text-white/80 transition-colors">
                {t.footerCol2L1}
              </span>
              <span className="font-body text-sm text-white/55 cursor-pointer hover:text-white/80 transition-colors">
                {t.footerCol2L2}
              </span>
              <span className="font-body text-sm text-white/55 cursor-pointer hover:text-white/80 transition-colors">
                {t.footerCol2L3}
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-display text-sm font-bold text-white">
                {t.footerCol3}
              </span>
              <span className="font-body text-sm text-white/55 cursor-pointer hover:text-white/80 transition-colors">
                {t.footerCol3L1}
              </span>
              <span className="font-body text-sm text-white/55 cursor-pointer hover:text-white/80 transition-colors">
                {t.footerCol3L2}
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/8" />

        {/* Bottom */}
        <div className="flex items-center justify-between max-md:flex-col max-md:gap-4">
          <span className="font-body text-[13px] text-white/35">
            {t.footerCopy}
          </span>
          <div className="flex items-center gap-5">
            <Instagram className="w-5 h-5 text-white/40 cursor-pointer hover:text-white/70 transition-colors" />
            <Facebook className="w-5 h-5 text-white/40 cursor-pointer hover:text-white/70 transition-colors" />
            <Mail className="w-5 h-5 text-white/40 cursor-pointer hover:text-white/70 transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
