"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
    pain1Icon: "💬",
    pain1Title: "DM 覆到手軟",
    pain1Desc: "一個人根本做唔晒",
    pain2Icon: "📋",
    pain2Title: "訂單亂晒龍",
    pain2Desc: "成日漏單出錯單",
    pain3Icon: "💸",
    pain3Title: "收錢好麻煩",
    pain3Desc: "逐個對數好煩",
    pain4Icon: "📉",
    pain4Title: "生意做唔大",
    pain4Desc: "永遠困喺 DM",

    // How It Works
    howTitle: "三步開店，簡單到唔信",
    howStep1Num: "01",
    howStep1Title: "上架商品",
    howStep1Desc: "影相上架，填好價錢同庫存，30 秒搞掂",
    howStep2Num: "02",
    howStep2Title: "設定收款",
    howStep2Desc: "FPS、PayMe、AlipayHK，客人自助付款",
    howStep3Num: "03",
    howStep3Title: "分享 Link 開始收單",
    howStep3Desc: "將 Link 放入 IG Bio，客人即刻可以落單付款",

    // Pricing
    pricingTitle: "簡單透明，0% 佣金",
    pricingSub: "你賺幾多就係幾多，我哋唔抽成",
    pricingFreeName: "Free",
    pricingFreePrice: "0",
    pricingFreeDesc: "試水溫",
    pricingFreeFeat1: "10 件商品",
    pricingFreeFeat2: "每月 50 張訂單",
    pricingFreeFeat3: "WhatsApp 通知",
    pricingFreeFeat4: "0% 交易佣金",
    pricingFreeBtn: "免費開始",
    pricingLiteName: "Lite",
    pricingLitePrice: "78",
    pricingLiteDesc: "認真副業",
    pricingLiteFeat1: "50 件商品",
    pricingLiteFeat2: "無限訂單",
    pricingLiteFeat3: "自訂品牌主題",
    pricingLiteFeat4: "折扣碼功能",
    pricingLiteFeat5: "銷售數據分析",
    pricingLiteBtn: "選擇 Lite",
    pricingProName: "Pro",
    pricingProPrice: "198",
    pricingProDesc: "全職生意",
    pricingProBadge: "最受歡迎",
    pricingProFeat1: "無限商品",
    pricingProFeat2: "無限訂單 + CRM",
    pricingProFeat3: "自訂域名 + 進階分析",
    pricingProFeat4: "自動化促銷工具",
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
    testimonial1Quote: "用咗 WoWlix，**訂單自動入 system，收款一目了然**，慳返好多時間。",
    testimonial1Name: "May",
    testimonial1Shop: "@maysshop · 飾物店",
    testimonial2Quote: "客人自己揀 FPS 定 PayMe，**唔使再逐個 check 入數**。",
    testimonial2Name: "K 小姐",
    testimonial2Shop: "K 小姐 · 手作店",
    testimonial3Quote: "**終於唔使再用 Excel 記庫存**，規格管理好方便！",
    testimonial3Name: "陳先生",
    testimonial3Shop: "陳先生 · 波鞋代購",

    // Final CTA
    ctaTitle: "準備好將你嘅 IG Shop 升級？",
    ctaSub: "2 分鐘開店 · 0% 佣金 · $0 起步",
    ctaBtn: "限時免費開始→",
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
    pain1Icon: "💬",
    pain1Title: "DM overload",
    pain1Desc: "Impossible to handle alone",
    pain2Icon: "📋",
    pain2Title: "Orders in chaos",
    pain2Desc: "Missing orders constantly",
    pain3Icon: "💸",
    pain3Title: "Payment headaches",
    pain3Desc: "Checking payments one by one",
    pain4Icon: "📉",
    pain4Title: "Can't scale up",
    pain4Desc: "Forever stuck in DMs",

    howTitle: "3 Steps to Launch. It's That Simple.",
    howStep1Num: "01",
    howStep1Title: "List Products",
    howStep1Desc: "Snap photos, set prices and inventory — done in 30 seconds",
    howStep2Num: "02",
    howStep2Title: "Set Up Payments",
    howStep2Desc: "FPS, PayMe, AlipayHK — customers pay on their own",
    howStep3Num: "03",
    howStep3Title: "Share Link & Start Selling",
    howStep3Desc: "Drop the link in your IG Bio, customers can order & pay instantly",

    pricingTitle: "Simple & Transparent. 0% Commission.",
    pricingSub: "What you earn is what you keep — we never take a cut",
    pricingFreeName: "Free",
    pricingFreePrice: "0",
    pricingFreeDesc: "Test the waters",
    pricingFreeFeat1: "10 products",
    pricingFreeFeat2: "50 orders/month",
    pricingFreeFeat3: "WhatsApp notifications",
    pricingFreeFeat4: "0% commission",
    pricingFreeBtn: "Start Free",
    pricingLiteName: "Lite",
    pricingLitePrice: "78",
    pricingLiteDesc: "Serious side hustle",
    pricingLiteFeat1: "50 products",
    pricingLiteFeat2: "Unlimited orders",
    pricingLiteFeat3: "Custom brand themes",
    pricingLiteFeat4: "Discount codes",
    pricingLiteFeat5: "Sales analytics",
    pricingLiteBtn: "Choose Lite",
    pricingProName: "Pro",
    pricingProPrice: "198",
    pricingProDesc: "Full-time business",
    pricingProBadge: "Most Popular",
    pricingProFeat1: "Unlimited products",
    pricingProFeat2: "Unlimited orders + CRM",
    pricingProFeat3: "Custom domain + advanced analytics",
    pricingProFeat4: "Automated promotions",
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
    testimonial1Quote: "With WoWlix, **orders auto-track and payments are crystal clear** — saves me hours.",
    testimonial1Name: "May",
    testimonial1Shop: "@maysshop · Jewelry",
    testimonial2Quote: "Customers pick FPS or PayMe themselves — **no more checking transfers one by one**.",
    testimonial2Name: "K",
    testimonial2Shop: "K · Handmade",
    testimonial3Quote: "**No more Excel for inventory** — variant management just works!",
    testimonial3Name: "Mr. Chan",
    testimonial3Shop: "Mr. Chan · Sneaker Reseller",

    ctaTitle: "Ready to upgrade your IG Shop?",
    ctaSub: "2 min setup · 0% commission · From $0",
    ctaBtn: "Start Free Now→",
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

  /* ─── Scroll fade-in-up (Intersection Observer) ─── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ─── Parse **bold** markers in testimonial quotes ─── */
  const renderBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} style={{ color: "#fff", fontStyle: "normal" }}>{part}</strong> : part
    );
  };

  const painCards = [
    { icon: t.pain1Icon, title: t.pain1Title, desc: t.pain1Desc },
    { icon: t.pain2Icon, title: t.pain2Title, desc: t.pain2Desc },
    { icon: t.pain3Icon, title: t.pain3Title, desc: t.pain3Desc },
    { icon: t.pain4Icon, title: t.pain4Title, desc: t.pain4Desc },
  ];

  const howSteps = [
    { num: t.howStep1Num, title: t.howStep1Title, desc: t.howStep1Desc, icon: "📦" },
    { num: t.howStep2Num, title: t.howStep2Title, desc: t.howStep2Desc, icon: "💳" },
    { num: t.howStep3Num, title: t.howStep3Title, desc: t.howStep3Desc, icon: "🔗" },
  ];

  const plans = [
    {
      name: t.pricingFreeName, price: t.pricingFreePrice, desc: t.pricingFreeDesc,
      btn: t.pricingFreeBtn, features: [t.pricingFreeFeat1, t.pricingFreeFeat2, t.pricingFreeFeat3, t.pricingFreeFeat4],
      href: `/${locale}/start?plan=free`, highlighted: false,
    },
    {
      name: t.pricingLiteName, price: t.pricingLitePrice, desc: t.pricingLiteDesc,
      btn: t.pricingLiteBtn, features: [t.pricingLiteFeat1, t.pricingLiteFeat2, t.pricingLiteFeat3, t.pricingLiteFeat4, t.pricingLiteFeat5],
      href: `/${locale}/start?plan=lite`, highlighted: false,
    },
    {
      name: t.pricingProName, price: t.pricingProPrice, desc: t.pricingProDesc,
      btn: t.pricingProBtn, features: [t.pricingProFeat1, t.pricingProFeat2, t.pricingProFeat3, t.pricingProFeat4, t.pricingProFeat5],
      href: `/${locale}/start?plan=pro`, highlighted: true, badge: t.pricingProBadge,
    },
  ];

  const testimonials = [
    { quote: t.testimonial1Quote, name: t.testimonial1Name, shop: t.testimonial1Shop },
    { quote: t.testimonial2Quote, name: t.testimonial2Name, shop: t.testimonial2Shop },
    { quote: t.testimonial3Quote, name: t.testimonial3Name, shop: t.testimonial3Shop },
  ];

  return (
    <div style={{ fontFamily: "'Noto Sans TC', 'Plus Jakarta Sans', -apple-system, sans-serif", color: "#1A1A1A", overflowX: "hidden" }}>
<style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes pulse { 0%,100% { box-shadow: 0 8px 32px rgba(255,149,0,0.4); } 50% { box-shadow: 0 8px 48px rgba(255,149,0,0.65); } }
        .scroll-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s cubic-bezier(0.33,1,0.68,1), transform 0.6s cubic-bezier(0.33,1,0.68,1); }
        .scroll-visible { opacity: 1 !important; transform: translateY(0) !important; }
        .lp-pulse { animation: pulse 2s ease-in-out infinite; }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ─── Mobile responsive ─── */
        @media (max-width: 640px) {
          .lp-how-grid { grid-template-columns: 1fr !important; }
          .lp-plan-grid { grid-template-columns: 1fr !important; }
          .lp-pain-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .lp-testimonial-grid { grid-template-columns: 1fr !important; }
          .lp-stats-row { flex-direction: column !important; gap: 24px !important; }
          .lp-footer-grid { grid-template-columns: repeat(3, 1fr) !important; text-align: center !important; }
          .lp-section { padding-left: 20px !important; padding-right: 20px !important; }
        }
        @media (max-width: 768px) {
          .lp-plan-grid { grid-template-columns: 1fr !important; max-width: 400px !important; margin-left: auto !important; margin-right: auto !important; }
        }
      `}</style>

      {/* ─── NAV (Dark) ─── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, width: "100%",
        background: "rgba(13,13,13,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
       <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 24px", maxWidth: 1200, margin: "0 auto",
       }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>
          <span style={{ color: "#FF9500" }}>&#10022;</span> WoWlix
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href={`/${locale}/pricing`} style={{
            fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)",
            textDecoration: "none", transition: "color 0.2s",
          }}>{t.navPricing}</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
            <Link
              href="/zh-HK"
              style={{
                color: isZH ? "#fff" : "rgba(255,255,255,0.35)",
                fontWeight: isZH ? 700 : 400,
                textDecoration: "none", padding: "4px 2px", transition: "color 0.2s",
              }}
            >
              {t.navLangZh}
            </Link>
            <span style={{ color: "rgba(255,255,255,0.2)", userSelect: "none" }}>/</span>
            <Link
              href="/en"
              style={{
                color: !isZH ? "#fff" : "rgba(255,255,255,0.35)",
                fontWeight: !isZH ? 700 : 400,
                textDecoration: "none", padding: "4px 2px", transition: "color 0.2s",
              }}
            >
              {t.navLangEn}
            </Link>
          </div>
          <Link href={`/${locale}/start`} style={{
            background: "#FF9500", color: "#fff", border: "none",
            padding: "10px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700,
            textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center",
            transition: "transform 0.2s, box-shadow 0.2s",
            boxShadow: "0 4px 16px rgba(255,149,0,0.3)",
          }}>{t.navCta}</Link>
        </div>
       </div>
      </nav>

      {/* ─── HERO ─── */}
      <HeroSection locale={locale as Locale} />

      {/* ─── PAIN POINTS (White bg) ─── */}
      <section className="lp-section scroll-reveal" style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" as const }}>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900,
            color: "#1A1A1A", marginBottom: 12,
          }}>
            {t.painTitle}
          </h2>
          <p style={{
            fontSize: 20, fontWeight: 600, color: "#6B7280", lineHeight: 1.6, marginBottom: 48,
          }}>
            {t.painSub1}<br />{t.painSub2}
          </p>

          <div className="lp-pain-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}>
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
                  transform: hoveredPain === i ? "translateY(-4px)" : "translateY(0)",
                  boxShadow: hoveredPain === i ? "0 12px 32px rgba(0,0,0,0.10)" : "none",
                  display: "flex", flexDirection: "column" as const, alignItems: "center",
                  textAlign: "center" as const, minHeight: 120,
                }}
              >
                <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 8 }}>{card.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1A1A1A", marginBottom: 4 }}>{card.title}</div>
                <div style={{ fontSize: 13, color: "#888", lineHeight: 1.4 }}>{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (Dark bg) ─── */}
      <section id="how-it-works" className="lp-section scroll-reveal" style={{ padding: "80px 24px", background: "#0D0D0D" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" as const }}>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900,
            color: "#fff", marginBottom: 48,
          }}>
            {t.howTitle}
          </h2>

          <div className="lp-how-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20,
          }}>
            {howSteps.map((step, i) => (
              <div key={i} style={{
                padding: "32px 24px",
                background: "#161616",
                borderRadius: 20,
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "left" as const,
                transition: "all 0.3s",
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  marginBottom: 16,
                }}>
                  <span style={{
                    fontSize: 40, fontWeight: 900, color: "#FF9500",
                    fontFamily: "'JetBrains Mono', monospace",
                    lineHeight: 1,
                  }}>
                    {step.num}
                  </span>
                  <span style={{ fontSize: 32, lineHeight: 1 }}>{step.icon}</span>
                </div>
                <div style={{
                  fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8,
                }}>
                  {step.title}
                </div>
                <div style={{
                  fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6,
                }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING (White bg) ─── */}
      <section id="pricing" className="lp-section scroll-reveal" style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" as const }}>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900,
            color: "#1A1A1A", marginBottom: 12,
          }}>
            {t.pricingTitle}
          </h2>
          <p style={{
            fontSize: 16, color: "#6B7280", marginBottom: 48,
          }}>
            {t.pricingSub}
          </p>

          <div className="lp-plan-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20,
            alignItems: "start",
          }}>
            {plans.map((plan, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredPlan(i)}
                onMouseLeave={() => setHoveredPlan(null)}
                style={{
                  padding: "32px 24px",
                  background: "#fff",
                  borderRadius: 20,
                  border: plan.highlighted ? "2px solid #FF9500" : "1px solid #E5E7EB",
                  textAlign: "left" as const,
                  position: "relative" as const,
                  transition: "all 0.3s",
                  transform: hoveredPlan === i ? "translateY(-4px)" : "translateY(0)",
                  boxShadow: plan.highlighted
                    ? "0 12px 40px rgba(255,149,0,0.12)"
                    : hoveredPlan === i ? "0 8px 24px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {plan.highlighted && plan.badge && (
                  <div style={{
                    position: "absolute" as const, top: -12, left: "50%", transform: "translateX(-50%)",
                    background: "#FF9500", color: "#fff", padding: "4px 16px",
                    borderRadius: 12, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" as const,
                  }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ fontSize: 14, fontWeight: 700, color: "#6B7280", marginBottom: 4 }}>
                  {plan.name}
                </div>
                <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>
                  {plan.desc}
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 24 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "#9CA3AF" }}>$</span>
                  <span style={{
                    fontSize: 48, fontWeight: 900, lineHeight: 1, color: "#1A1A1A",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 14, color: "#9CA3AF", marginLeft: 2 }}>
                    {t.pricingPeriod}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 }}>
                  {plan.features.map((feat, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#555" }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.3 4.3L6.3 11.3L2.7 7.7" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {feat}
                    </div>
                  ))}
                </div>

                <Link href={plan.href} style={{
                  display: "block", textAlign: "center" as const,
                  padding: "14px 24px", borderRadius: 12,
                  fontSize: 15, fontWeight: 700,
                  textDecoration: "none",
                  background: plan.highlighted ? "#FF9500" : "transparent",
                  color: plan.highlighted ? "#fff" : "#FF9500",
                  border: plan.highlighted ? "none" : "1.5px solid #FF9500",
                  transition: "all 0.2s",
                  boxShadow: plan.highlighted ? "0 4px 16px rgba(255,149,0,0.3)" : "none",
                }}>
                  {plan.btn}
                </Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link href={`/${locale}/pricing`} style={{
              fontSize: 15, fontWeight: 700, color: "#FF9500",
              textDecoration: "none", transition: "opacity 0.2s",
            }}>
              {t.pricingFullLink}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TRUST SIGNALS (Dark bg) ─── */}
      <section className="lp-section scroll-reveal" style={{ padding: "80px 24px", background: "#0D0D0D" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" as const }}>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 900,
            color: "#fff", marginBottom: 48,
          }}>
            {t.trustTitle}
          </h2>

          {/* Stats row */}
          <div className="lp-stats-row" style={{
            display: "flex", justifyContent: "center", gap: 48, marginBottom: 56,
            flexWrap: "wrap" as const,
          }}>
            {[
              { value: t.trustStat1Value, label: t.trustStat1Label },
              { value: t.trustStat2Value, label: t.trustStat2Label },
              { value: t.trustStat3Value, label: t.trustStat3Label },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" as const }}>
                <div style={{
                  fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 900,
                  color: "#FF9500", lineHeight: 1,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: 8,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="lp-testimonial-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
          }}>
            {testimonials.map((item, i) => (
              <div key={i} style={{
                padding: "24px",
                background: "#161616",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "left" as const,
              }}>
                <div style={{
                  fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7,
                  marginBottom: 16, fontStyle: "italic" as const,
                }}>
                  &ldquo;{renderBold(item.quote)}&rdquo;
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(255,149,0,0.15)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "#FF9500", fontWeight: 800, fontSize: 14,
                  }}>
                    {item.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{item.shop}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA (Dark bg) ─── */}
      <section className="lp-section scroll-reveal" style={{
        padding: "80px 24px",
        background: "#111",
        textAlign: "center" as const,
        position: "relative" as const, overflow: "hidden",
      }}>
        {/* Glow */}
        <div style={{
          position: "absolute" as const, top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(255,149,0,0.06) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none" as const,
        }} />
        <div style={{ position: "relative" as const, maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900,
            color: "#fff", marginBottom: 12,
          }}>
            {t.ctaTitle}
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", marginBottom: 36 }}>
            {t.ctaSub}
          </p>
          <Link href={`/${locale}/start`} className="lp-pulse" style={{
            background: "#FF9500", color: "#fff", border: "none",
            padding: "18px 48px", borderRadius: 14, fontSize: 20, fontWeight: 700,
            textDecoration: "none", display: "inline-block",
            boxShadow: "0 8px 32px rgba(255,149,0,0.4)",
            transition: "transform 0.2s",
          }}>
            {t.ctaBtn}
          </Link>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" as const }}>
            {[t.ctaTrust1, t.ctaTrust2, t.ctaTrust3].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3 4.3L6.3 11.3L2.7 7.7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER (Dark bg) ─── */}
      <footer style={{
        padding: "56px 24px 32px", background: "#0A0A0A",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="lp-footer-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32,
            marginBottom: 40,
          }}>
            {/* Column 1: Product */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 16, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                {t.footerProduct}
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                <Link href={`/${locale}/pricing`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}>{t.footerPricing}</Link>
                <Link href={`/${locale}/pricing`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}>{t.footerFeatures}</Link>
              </div>
            </div>
            {/* Column 2: Support */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 16, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                {t.footerSupport}
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                <Link href={`/${locale}/contact`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 14 }}>{t.footerHelp}</Link>
                <Link href={`/${locale}/contact`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 14 }}>{t.footerContact}</Link>
                <a href="https://wa.me/85298765432" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 14 }}>{t.footerWhatsApp}</a>
              </div>
            </div>
            {/* Column 3: Legal */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 16, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                {t.footerLegal}
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                <Link href={`/${locale}/terms`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 14 }}>{t.footerTerms}</Link>
                <Link href={`/${locale}/privacy`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: 14 }}>{t.footerPrivacy}</Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 24, textAlign: "center" as const,
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
              <span style={{ color: "#FF9500" }}>&#10022;</span> WoWlix
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 12 }}>
              {/* Instagram */}
              <a href="https://www.instagram.com/wowlix.hk" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.35)", transition: "color 0.2s" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/85298765432" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.35)", transition: "color 0.2s" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
