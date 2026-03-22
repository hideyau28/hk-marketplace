"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  ClipboardList,
  Wallet,
  TrendingDown,
  Store,
  Palette,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import HeroSection from "@/components/marketing/sections/HeroSection";

/* ─── i18n ─── */
const T = {
  "zh-HK": {
    // Nav
    navPricing: "定價",
    navLangZh: "繁",
    navLangEn: "EN",
    navCta: "免費開店",

    // Pain Points
    painTitle: "你係咪都遇到呢啲問題？",
    painSub1: "用 IG DM 做生意",
    painSub2: "愈做愈辛苦",
    pain1Title: "DM 覆到手軟",
    pain1Desc: "一個人根本做唔晒",
    pain2Title: "訂單亂晒龍",
    pain2Desc: "成日漏單出錯單",
    pain3Title: "收錢好麻煩",
    pain3Desc: "逐個對數好煩",
    pain4Title: "生意做唔大",
    pain4Desc: "永遠困喺 DM",

    // How It Works
    howTitle: "三步開店，簡單到唔信",
    howStep1Num: "01",
    howStep1Title: "填店名",
    howStep1Desc: "取個名，30 秒搞掂",
    howStep2Num: "02",
    howStep2Title: "選風格",
    howStep2Desc: "4 款主題模板任你揀",
    howStep3Num: "03",
    howStep3Title: "上架開賣",
    howStep3Desc: "影相上架，即刻開始收單",

    // Pricing
    pricingTitle: "簡單透明，0% 佣金",
    pricingSub: "你賺幾多就係幾多，我哋唔抽成",
    pricingFreeName: "Free",
    pricingFreePrice: "0",
    pricingFreeDesc: "試水溫",
    pricingFreeFeat1: "10 件商品",
    pricingFreeFeat2: "每月 50 張訂單",
    pricingFreeFeat3: "全部收款方式（FPS・PayMe・AlipayHK・信用卡）",
    pricingFreeFeat4: "0% 交易佣金",
    pricingFreeBtn: "免費開始",
    pricingLiteName: "Lite",
    pricingLitePrice: "78",
    pricingLiteDesc: "認真副業",
    pricingLiteFeat1: "50 件商品",
    pricingLiteFeat2: "無限訂單",
    pricingLiteFeat3: "全部收款方式",
    pricingLiteFeat4: "折扣碼功能",
    pricingLiteFeat5: "銷售數據分析",
    pricingLiteBtn: "選擇 Lite",
    pricingProName: "Pro",
    pricingProPrice: "198",
    pricingProDesc: "全職生意",
    pricingProBadge: "最受歡迎",
    pricingProFeat1: "無限商品",
    pricingProFeat2: "無限訂單 + CRM",
    pricingProFeat3: "全部收款方式",
    pricingProFeat4: "自訂域名（加購・即將推出）",
    pricingProFeat5: "優先客服支援",
    pricingProBtn: "選擇 Pro",
    pricingPeriod: "/月",
    pricingFullLink: "查看完整定價 →",

    // Trust Signals
    trustTitle: "首批商戶招募中",
    trustStat1Value: "0%",
    trustStat1Label: "交易佣金",
    trustStat2Value: "2 分鐘",
    trustStat2Label: "開店時間",
    trustStat3Value: "$0",
    trustStat3Label: "免費開始",
    testimonial1Quote:
      "用咗 WoWlix，**訂單自動入 system，付款狀態一目了然**，慳返好多時間。",
    testimonial1Name: "May",
    testimonial1Shop: "@maysshop · 飾物店",
    testimonial2Quote: "客人自己揀 FPS 定 PayMe，**所有訂單同付款一覽無遺**。",
    testimonial2Name: "K 小姐",
    testimonial2Shop: "K 小姐 · 手作店",
    testimonial3Quote: "**終於唔使再用 Excel 記庫存**，規格管理好方便！",
    testimonial3Name: "陳先生",
    testimonial3Shop: "陳先生 · 波鞋代購",

    // Final CTA
    ctaTitle: "準備好將你嘅 IG Shop 升級？",
    ctaSub: "2 分鐘開店 · 0% 佣金 · $0 起步",
    ctaBtn: "限時免費開始→",
    ctaSecondaryBtn: "睇主頁示範",
    ctaNote: "唔使信用卡 · 隨時取消",
    ctaTrust1: "唔使信用卡",
    ctaTrust2: "隨時取消",
    ctaTrust3: "0% 佣金",

    // Footer
    footerProduct: "產品",
    footerPricing: "定價",
    footerTemplates: "主題模板",
    footerFeatures: "功能",
    footerSupport: "支援",
    footerHelp: "幫助中心",
    footerContact: "聯絡我哋",
    footerWhatsApp: "WhatsApp 客服",
    footerLegal: "法律",
    footerTerms: "服務條款",
    footerPrivacy: "私隱政策",
    footerCopy: "© 2026 WoWlix by Flow Studio HK",
  },
  en: {
    navPricing: "Pricing",
    navLangZh: "繁",
    navLangEn: "EN",
    navCta: "Start Free",

    painTitle: "Sound familiar?",
    painSub1: "Running a business on IG DMs",
    painSub2: "gets harder every day",
    pain1Title: "DM overload",
    pain1Desc: "Impossible to handle alone",
    pain2Title: "Orders in chaos",
    pain2Desc: "Missing orders constantly",
    pain3Title: "Payment headaches",
    pain3Desc: "Checking payments one by one",
    pain4Title: "Can't scale up",
    pain4Desc: "Forever stuck in DMs",

    howTitle: "3 Steps to Launch. It's That Simple.",
    howStep1Num: "01",
    howStep1Title: "Name Your Shop",
    howStep1Desc: "Pick a name — done in 30 seconds",
    howStep2Num: "02",
    howStep2Title: "Pick a Style",
    howStep2Desc: "4 theme templates to match your vibe",
    howStep3Num: "03",
    howStep3Title: "List & Sell",
    howStep3Desc: "Upload photos and start taking orders",

    pricingTitle: "Simple & Transparent. 0% Commission.",
    pricingSub: "What you earn is what you keep — we never take a cut",
    pricingFreeName: "Free",
    pricingFreePrice: "0",
    pricingFreeDesc: "Test the waters",
    pricingFreeFeat1: "10 products",
    pricingFreeFeat2: "50 orders/month",
    pricingFreeFeat3:
      "All payment methods (FPS · PayMe · AlipayHK · Credit Card)",
    pricingFreeFeat4: "0% commission",
    pricingFreeBtn: "Start Free",
    pricingLiteName: "Lite",
    pricingLitePrice: "78",
    pricingLiteDesc: "Serious side hustle",
    pricingLiteFeat1: "50 products",
    pricingLiteFeat2: "Unlimited orders",
    pricingLiteFeat3: "All payment methods",
    pricingLiteFeat4: "Discount codes",
    pricingLiteFeat5: "Sales analytics",
    pricingLiteBtn: "Choose Lite",
    pricingProName: "Pro",
    pricingProPrice: "198",
    pricingProDesc: "Full-time business",
    pricingProBadge: "Most Popular",
    pricingProFeat1: "Unlimited products",
    pricingProFeat2: "Unlimited orders + CRM",
    pricingProFeat3: "All payment methods",
    pricingProFeat4: "Custom domain (add-on · coming soon)",
    pricingProFeat5: "Priority support",
    pricingProBtn: "Choose Pro",
    pricingPeriod: "/mo",
    pricingFullLink: "View full pricing →",

    trustTitle: "Early Merchants Wanted",
    trustStat1Value: "0%",
    trustStat1Label: "Commission",
    trustStat2Value: "2 Min",
    trustStat2Label: "Setup Time",
    trustStat3Value: "$0",
    trustStat3Label: "Free to Start",
    testimonial1Quote:
      "With WoWlix, **orders auto-track and payment status is crystal clear** — saves me hours.",
    testimonial1Name: "May",
    testimonial1Shop: "@maysshop · Jewelry",
    testimonial2Quote:
      "Customers pick FPS or PayMe themselves — **all orders and payments in one dashboard**.",
    testimonial2Name: "K",
    testimonial2Shop: "K · Handmade",
    testimonial3Quote:
      "**No more Excel for inventory** — variant management just works!",
    testimonial3Name: "Mr. Chan",
    testimonial3Shop: "Mr. Chan · Sneaker Reseller",

    ctaTitle: "Ready to upgrade your IG Shop?",
    ctaSub: "2 min setup · 0% commission · From $0",
    ctaBtn: "Start Free Now→",
    ctaSecondaryBtn: "Browse Demo Store",
    ctaNote: "No credit card · Cancel anytime",
    ctaTrust1: "No credit card",
    ctaTrust2: "Cancel anytime",
    ctaTrust3: "0% commission",

    footerProduct: "Product",
    footerPricing: "Pricing",
    footerTemplates: "Themes",
    footerFeatures: "Features",
    footerSupport: "Support",
    footerHelp: "Help Center",
    footerContact: "Contact Us",
    footerWhatsApp: "WhatsApp Support",
    footerLegal: "Legal",
    footerTerms: "Terms of Service",
    footerPrivacy: "Privacy Policy",
    footerCopy: "© 2026 WoWlix by Flow Studio HK",
  },
};

/* ─── Main Component ─── */
export default function LandingPage({ locale = "zh-HK" }: { locale?: Locale }) {
  const t = T[locale] || T["en"];
  const isZH = locale === "zh-HK";
  const [hoveredPain, setHoveredPain] = useState<number | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* ─── Scroll fade-in-up (Intersection Observer) ─── */
  useEffect(() => {
    // Progressive enhancement: hide sections only after JS is ready
    document.documentElement.classList.add("js-scroll-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "300px" },
    );
    document
      .querySelectorAll(".scroll-reveal")
      .forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("js-scroll-ready");
    };
  }, []);

  /* ─── Parse **bold** markers in testimonial quotes ─── */
  const renderBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} style={{ color: "#fff", fontStyle: "normal" }}>
          {part}
        </strong>
      ) : (
        part
      ),
    );
  };

  const painCards = [
    { Icon: MessageCircle, title: t.pain1Title, desc: t.pain1Desc },
    { Icon: ClipboardList, title: t.pain2Title, desc: t.pain2Desc },
    { Icon: Wallet, title: t.pain3Title, desc: t.pain3Desc },
    { Icon: TrendingDown, title: t.pain4Title, desc: t.pain4Desc },
  ];

  const howSteps = [
    { title: t.howStep1Title, desc: t.howStep1Desc, Icon: Store },
    { title: t.howStep2Title, desc: t.howStep2Desc, Icon: Palette },
    { title: t.howStep3Title, desc: t.howStep3Desc, Icon: ShoppingBag },
  ];

  const plans = [
    {
      name: t.pricingFreeName,
      price: t.pricingFreePrice,
      desc: t.pricingFreeDesc,
      btn: t.pricingFreeBtn,
      features: [
        t.pricingFreeFeat1,
        t.pricingFreeFeat2,
        t.pricingFreeFeat3,
        t.pricingFreeFeat4,
      ],
      href: `/${locale}/start?plan=free`,
      highlighted: false,
    },
    {
      name: t.pricingLiteName,
      price: t.pricingLitePrice,
      desc: t.pricingLiteDesc,
      btn: t.pricingLiteBtn,
      features: [
        t.pricingLiteFeat1,
        t.pricingLiteFeat2,
        t.pricingLiteFeat3,
        t.pricingLiteFeat4,
        t.pricingLiteFeat5,
      ],
      href: `/${locale}/start?plan=lite`,
      highlighted: false,
    },
    {
      name: t.pricingProName,
      price: t.pricingProPrice,
      desc: t.pricingProDesc,
      btn: t.pricingProBtn,
      features: [
        t.pricingProFeat1,
        t.pricingProFeat2,
        t.pricingProFeat3,
        t.pricingProFeat4,
        t.pricingProFeat5,
      ],
      href: `/${locale}/start?plan=pro`,
      highlighted: true,
      badge: t.pricingProBadge,
    },
  ];

  const testimonials = [
    {
      quote: t.testimonial1Quote,
      name: t.testimonial1Name,
      shop: t.testimonial1Shop,
    },
    {
      quote: t.testimonial2Quote,
      name: t.testimonial2Name,
      shop: t.testimonial2Shop,
    },
    {
      quote: t.testimonial3Quote,
      name: t.testimonial3Name,
      shop: t.testimonial3Shop,
    },
  ];

  return (
    <div
      style={{
        fontFamily:
          "'Noto Sans TC', 'Plus Jakarta Sans', -apple-system, sans-serif",
        color: "#1A1A1A",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes pulse { 0%,100% { box-shadow: 0 8px 32px rgba(255,149,0,0.4); } 50% { box-shadow: 0 8px 48px rgba(255,149,0,0.65); } }
        .scroll-reveal { opacity: 1; transform: translateY(0); transition: opacity 0.6s cubic-bezier(0.33,1,0.68,1), transform 0.6s cubic-bezier(0.33,1,0.68,1); }
        .js-scroll-ready .scroll-reveal { opacity: 0; transform: translateY(24px); }
        .js-scroll-ready .scroll-visible { opacity: 1 !important; transform: translateY(0) !important; }
        .lp-pulse { animation: pulse 2s ease-in-out infinite; }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ─── How-step stagger reveal ─── */
        .js-scroll-ready .how-step { opacity: 0; }
        .js-scroll-ready .scroll-visible .how-step {
          animation: fadeInUp 0.6s cubic-bezier(0.33,1,0.68,1) both;
        }

        /* ─── Mobile responsive ─── */
        @media (max-width: 640px) {
          .lp-plan-grid { grid-template-columns: 1fr !important; }
          .lp-pain-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .lp-testimonial-grid { grid-template-columns: 1fr !important; }
          .lp-stats-row { flex-direction: column !important; gap: 24px !important; }
          .lp-footer-grid { grid-template-columns: repeat(3, 1fr) !important; text-align: center !important; }
          .lp-section { padding-left: 20px !important; padding-right: 20px !important; }
        }
        @media (max-width: 768px) {
          .lp-plan-grid { grid-template-columns: 1fr !important; max-width: 400px !important; margin-left: auto !important; margin-right: auto !important; }
          .lp-nav-desktop { display: none !important; }
          .lp-nav-hamburger { display: block !important; }
        }
      `}</style>

      {/* ─── NAV (Dark) ─── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          width: "100%",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <Link
            href={`/${locale}`}
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: -0.5,
              textDecoration: "none",
              color: "#1A1A1A",
            }}
          >
            <span style={{ color: "#FF9500" }}>W</span>o
            <span style={{ color: "#FF9500" }}>W</span>lix
          </Link>
          {/* Desktop nav links */}
          <div
            className="lp-nav-desktop"
            style={{ display: "flex", gap: 16, alignItems: "center" }}
          >
            <Link
              href={`/${locale}/pricing`}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "rgba(0,0,0,0.5)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
            >
              {t.navPricing}
            </Link>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
              }}
            >
              <Link
                href="/zh-HK"
                style={{
                  color: isZH ? "#1A1A1A" : "rgba(0,0,0,0.3)",
                  fontWeight: isZH ? 700 : 400,
                  textDecoration: "none",
                  padding: "4px 2px",
                  transition: "color 0.2s",
                }}
              >
                {t.navLangZh}
              </Link>
              <span style={{ color: "rgba(0,0,0,0.2)", userSelect: "none" }}>
                /
              </span>
              <Link
                href="/en"
                style={{
                  color: !isZH ? "#1A1A1A" : "rgba(0,0,0,0.3)",
                  fontWeight: !isZH ? 700 : 400,
                  textDecoration: "none",
                  padding: "4px 2px",
                  transition: "color 0.2s",
                }}
              >
                {t.navLangEn}
              </Link>
            </div>
            <Link
              href={`/${locale}/start`}
              style={{
                background: "#FF9500",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
                transition: "all 0.2s",
              }}
            >
              {t.navCta}
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            className="lp-nav-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              color: "#1A1A1A",
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ─── Mobile dropdown menu ─── */}
      {mobileMenuOpen && (
        <div
          className="lp-mobile-menu"
          style={{
            position: "sticky",
            top: 57,
            zIndex: 99,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
          }}
        >
          <Link
            href={`/${locale}/pricing`}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "rgba(0,0,0,0.6)",
              textDecoration: "none",
            }}
          >
            {t.navPricing}
          </Link>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              fontSize: 13,
            }}
          >
            <Link
              href="/zh-HK"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: isZH ? "#1A1A1A" : "rgba(0,0,0,0.3)",
                fontWeight: isZH ? 700 : 400,
                textDecoration: "none",
                padding: "4px 2px",
              }}
            >
              {t.navLangZh}
            </Link>
            <span style={{ color: "rgba(0,0,0,0.2)", userSelect: "none" }}>
              /
            </span>
            <Link
              href="/en"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: !isZH ? "#1A1A1A" : "rgba(0,0,0,0.3)",
                fontWeight: !isZH ? 700 : 400,
                textDecoration: "none",
                padding: "4px 2px",
              }}
            >
              {t.navLangEn}
            </Link>
          </div>
          <Link
            href={`/${locale}/start`}
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: "#FF9500",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {t.navCta}
          </Link>
        </div>
      )}

      {/* ─── HERO ─── */}
      <HeroSection locale={locale as Locale} />

      {/* ─── PAIN POINTS (White bg) ─── */}
      <section
        className="lp-section scroll-reveal"
        style={{ padding: "80px 24px", background: "#fff" }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            textAlign: "center" as const,
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 900,
              color: "#1A1A1A",
              marginBottom: 12,
            }}
          >
            {t.painTitle}
          </h2>
          <p
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#6B7280",
              lineHeight: 1.6,
              marginBottom: 48,
            }}
          >
            {t.painSub1}
            <br />
            {t.painSub2}
          </p>

          <div
            className="lp-pain-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {painCards.map((card, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredPain(i)}
                onMouseLeave={() => setHoveredPain(null)}
                style={{
                  padding: 16,
                  background: hoveredPain === i ? "#FFF8F0" : "#FAFAFA",
                  borderRadius: 14,
                  border: "1px solid #F0F0F0",
                  transition: "all 0.3s",
                  transform:
                    hoveredPain === i ? "translateY(-4px)" : "translateY(0)",
                  boxShadow:
                    hoveredPain === i ? "0 12px 32px rgba(0,0,0,0.10)" : "none",
                  display: "flex",
                  flexDirection: "column" as const,
                  alignItems: "center",
                  textAlign: "center" as const,
                  minHeight: 120,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#FFF3E0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                    flexShrink: 0,
                  }}
                >
                  <card.Icon size={26} color="#FF9500" strokeWidth={2} />
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#1A1A1A",
                    marginBottom: 4,
                  }}
                >
                  {card.title}
                </div>
                <div style={{ fontSize: 13, color: "#888", lineHeight: 1.4 }}>
                  {card.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (Light bg) ─── */}
      <section
        id="how-it-works"
        className="lp-section scroll-reveal"
        style={{ padding: "60px 24px", background: "#FFF3E0" }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            textAlign: "center" as const,
          }}
        >
          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 900,
              color: "#1A1A1A",
              marginBottom: 40,
            }}
          >
            {t.howTitle}
          </h2>

          {/* Steps row — flex on all screen sizes */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {howSteps.map((step, i) => (
              <div key={i} style={{ display: "contents" }}>
                <div
                  className="how-step"
                  style={{
                    display: "flex",
                    flexDirection: "column" as const,
                    alignItems: "center",
                    textAlign: "center" as const,
                    flex: "1 1 0",
                    minWidth: 0,
                    animationDelay: `${i * 150}ms`,
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: "#FFE0B2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12,
                      flexShrink: 0,
                    }}
                  >
                    <step.Icon size={26} color="#FF9500" strokeWidth={2} />
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#1A1A1A",
                      marginBottom: 4,
                    }}
                  >
                    {step.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#888",
                      lineHeight: 1.4,
                    }}
                  >
                    {step.desc}
                  </div>
                </div>
                {i < 2 && (
                  <div
                    style={{
                      fontSize: 18,
                      color: "#FF9500",
                      fontWeight: 700,
                      flexShrink: 0,
                      opacity: 0.6,
                      paddingBottom: 28,
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF (White bg) ─── */}
      <section
        className="lp-section scroll-reveal"
        style={{
          padding: "64px 24px",
          background: "#fff",
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            textAlign: "center" as const,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "#FFF8F0",
              border: "1.5px solid rgba(255,149,0,0.2)",
              borderRadius: 32,
              padding: "10px 24px",
              marginBottom: 40,
            }}
          >
            <span style={{ fontSize: 22 }}>🏪</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#1A1A1A" }}>
              已有 <span style={{ color: "#FF9500" }}>200+</span> 間 IG 店使用
              WoWlix
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap" as const,
            }}
          >
            {[
              {
                quote: "用咗之後，訂單再都唔會亂咗！",
                name: "May · @maysshop",
                avatar: "M",
              },
              {
                quote: "2 分鐘開完店，放入 IG Bio 即刻有人落單",
                name: "Vivian · 手作甜品店",
                avatar: "V",
              },
              {
                quote: "0% 抽成係真嘅，慳返好多！",
                name: "Ken · 波鞋代購",
                avatar: "K",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  flex: "1 1 240px",
                  maxWidth: 300,
                  background: "#FAFAFA",
                  border: "1px solid #EBEBEB",
                  borderRadius: 16,
                  padding: "20px",
                  textAlign: "left" as const,
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    color: "#374151",
                    lineHeight: 1.6,
                    marginBottom: 14,
                    fontStyle: "italic" as const,
                  }}
                >
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #FF9500, #FFB347)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {item.avatar}
                  </div>
                  <span
                    style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600 }}
                  >
                    {item.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING (White bg) ─── */}
      <section
        id="pricing"
        className="lp-section scroll-reveal"
        style={{ padding: "80px 24px", background: "#fff" }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            textAlign: "center" as const,
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 900,
              color: "#1A1A1A",
              marginBottom: 12,
            }}
          >
            {t.pricingTitle}
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#6B7280",
              marginBottom: 48,
            }}
          >
            {t.pricingSub}
          </p>

          <div
            className="lp-plan-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              alignItems: "start",
            }}
          >
            {plans.map((plan, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredPlan(i)}
                onMouseLeave={() => setHoveredPlan(null)}
                style={{
                  padding: "32px 24px",
                  background: "#fff",
                  borderRadius: 20,
                  border: plan.highlighted
                    ? "2px solid #FF9500"
                    : "1px solid #E5E7EB",
                  textAlign: "left" as const,
                  position: "relative" as const,
                  transition: "all 0.3s",
                  transform:
                    hoveredPlan === i ? "translateY(-4px)" : "translateY(0)",
                  boxShadow: plan.highlighted
                    ? "0 12px 40px rgba(255,149,0,0.12)"
                    : hoveredPlan === i
                      ? "0 8px 24px rgba(0,0,0,0.06)"
                      : "none",
                }}
              >
                {plan.highlighted && plan.badge && (
                  <div
                    style={{
                      position: "absolute" as const,
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#FF9500",
                      color: "#fff",
                      padding: "4px 16px",
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: "nowrap" as const,
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#6B7280",
                    marginBottom: 4,
                  }}
                >
                  {plan.name}
                </div>
                <div
                  style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}
                >
                  {plan.desc}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 2,
                    marginBottom: 24,
                  }}
                >
                  <span
                    style={{ fontSize: 16, fontWeight: 600, color: "#9CA3AF" }}
                  >
                    $
                  </span>
                  <span
                    style={{
                      fontSize: 48,
                      fontWeight: 900,
                      lineHeight: 1,
                      color: "#1A1A1A",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {plan.price}
                  </span>
                  <span
                    style={{ fontSize: 14, color: "#9CA3AF", marginLeft: 2 }}
                  >
                    {t.pricingPeriod}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column" as const,
                    gap: 10,
                    marginBottom: 24,
                  }}
                >
                  {plan.features.map((feat, j) => (
                    <div
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 14,
                        color: "#555",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M13.3 4.3L6.3 11.3L2.7 7.7"
                          stroke="#FF9500"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {feat}
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.href}
                  style={{
                    display: "block",
                    textAlign: "center" as const,
                    padding: "14px 24px",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    textDecoration: "none",
                    background: plan.highlighted ? "#FF9500" : "transparent",
                    color: plan.highlighted ? "#fff" : "#FF9500",
                    border: plan.highlighted ? "none" : "1.5px solid #FF9500",
                    transition: "all 0.2s",
                    boxShadow: plan.highlighted
                      ? "0 4px 16px rgba(255,149,0,0.3)"
                      : "none",
                  }}
                >
                  {plan.btn}
                </Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link
              href={`/${locale}/pricing`}
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#FF9500",
                textDecoration: "none",
                transition: "opacity 0.2s",
              }}
            >
              {t.pricingFullLink}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Gradient: White → Dark ─── */}
      <div
        style={{
          height: 80,
          background: "linear-gradient(to bottom, #fff, #0D0D0D)",
        }}
      />

      {/* ─── TRUST SIGNALS (Dark bg) ─── */}
      <section
        className="lp-section scroll-reveal"
        style={{ padding: "80px 24px", background: "#0D0D0D" }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            textAlign: "center" as const,
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 900,
              color: "#fff",
              marginBottom: 48,
            }}
          >
            {t.trustTitle}
          </h2>

          {/* Stats row */}
          <div
            className="lp-stats-row"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 48,
              marginBottom: 56,
              flexWrap: "wrap" as const,
            }}
          >
            {[
              { value: t.trustStat1Value, label: t.trustStat1Label },
              { value: t.trustStat2Value, label: t.trustStat2Label },
              { value: t.trustStat3Value, label: t.trustStat3Label },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" as const }}>
                <div
                  style={{
                    fontSize: "clamp(36px, 6vw, 56px)",
                    fontWeight: 900,
                    color: "#FF9500",
                    lineHeight: 1,
                    fontFamily: "'JetBrains Mono', monospace",
                    marginBottom: 8,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.5)",
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div
            className="lp-testimonial-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {testimonials.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "24px",
                  background: "#161616",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.15)",
                  textAlign: "left" as const,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.7,
                    marginBottom: 16,
                    fontStyle: "italic" as const,
                  }}
                >
                  &ldquo;{renderBold(item.quote)}&rdquo;
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* IG-style gradient ring avatar */}
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF, #515BD4)",
                      padding: 2,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        background: "#161616",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FF9500",
                        fontWeight: 800,
                        fontSize: 15,
                      }}
                    >
                      {item.name[0]}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}
                    >
                      {item.shop}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA (Dark bg) ─── */}
      <section
        className="lp-section scroll-reveal"
        style={{
          padding: "80px 24px",
          background: "#111",
          textAlign: "center" as const,
          position: "relative" as const,
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute" as const,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            background:
              "radial-gradient(circle, rgba(255,149,0,0.06) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none" as const,
          }}
        />
        <div
          style={{
            position: "relative" as const,
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 900,
              color: "#fff",
              marginBottom: 12,
            }}
          >
            {t.ctaTitle}
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.45)",
              marginBottom: 36,
            }}
          >
            {t.ctaSub}
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href={`/${locale}/start`}
              className="lp-pulse"
              style={{
                background: "#FF9500",
                color: "#fff",
                border: "2px solid #FF9500",
                padding: "18px 48px",
                borderRadius: 14,
                fontSize: 20,
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-block",
                boxShadow: "0 8px 32px rgba(255,149,0,0.4)",
                transition: "transform 0.2s",
              }}
            >
              {t.ctaBtn}
            </Link>
            <Link
              href={`/${locale}/hypedrops`}
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.75)",
                border: "2px solid rgba(255,255,255,0.25)",
                padding: "18px 36px",
                borderRadius: 14,
                fontSize: 18,
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-block",
                transition: "border-color 0.2s, color 0.2s",
              }}
            >
              {t.ctaSecondaryBtn}
            </Link>
          </div>
          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "center",
              gap: 24,
              flexWrap: "wrap" as const,
            }}
          >
            {[t.ctaTrust1, t.ctaTrust2, t.ctaTrust3].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13.3 4.3L6.3 11.3L2.7 7.7"
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER (Dark bg) ─── */}
      <footer
        style={{
          padding: "56px 24px 32px",
          background: "#0A0A0A",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            className="lp-footer-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 32,
              marginBottom: 40,
            }}
          >
            {/* Column 1: Product */}
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 16,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                }}
              >
                {t.footerProduct}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 10,
                }}
              >
                <Link
                  href={`/${locale}/pricing`}
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    textDecoration: "none",
                    fontSize: 14,
                    transition: "color 0.2s",
                  }}
                >
                  {t.footerPricing}
                </Link>
                <Link
                  href={`/${locale}/pricing`}
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    textDecoration: "none",
                    fontSize: 14,
                    transition: "color 0.2s",
                  }}
                >
                  {t.footerFeatures}
                </Link>
              </div>
            </div>
            {/* Column 2: Support */}
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 16,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                }}
              >
                {t.footerSupport}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 10,
                }}
              >
                <Link
                  href={`/${locale}/contact`}
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  {t.footerHelp}
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  {t.footerContact}
                </Link>
                <a
                  href="https://wa.me/85254323686"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  {t.footerWhatsApp}
                </a>
              </div>
            </div>
            {/* Column 3: Legal */}
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 16,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                }}
              >
                {t.footerLegal}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: 10,
                }}
              >
                <Link
                  href={`/${locale}/terms`}
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  {t.footerTerms}
                </Link>
                <Link
                  href={`/${locale}/privacy`}
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  {t.footerPrivacy}
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 24,
              textAlign: "center" as const,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#fff",
                marginBottom: 12,
              }}
            >
              <span style={{ color: "#FF9500" }}>&#10022;</span> WoWlix
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
                marginBottom: 12,
              }}
            >
              {/* Instagram */}
              <a
                href="https://www.instagram.com/wowlix.hk"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  transition: "color 0.2s",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1.5"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/85254323686"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  transition: "color 0.2s",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
              {t.footerCopy}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
