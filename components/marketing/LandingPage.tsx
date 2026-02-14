"use client";

import Link from "next/link";
import { useState } from "react";

/* ─── Types ─── */

type LandingLocale = "zh-HK" | "en";

interface LandingPageProps {
  locale?: LandingLocale;
}

/* ─── Bilingual Text ─── */

const T = {
  "zh-HK": {
    nav: { pricing: "定價", startFree: "免費開店" },
    hero: {
      badge: "專為香港 IG 小店而設",
      h1Line1: "一條 Link",
      h1Line2: "將 Follower 變成生意",
      subtitle1: "0% 平台抽成・$0 起・2 分鐘開店",
      subtitle2: "落單、收款、庫存，一個 Link 搞掂晒",
      cta: "免費開店 →",
      ctaSecondary: "睇定價",
    },
    howItWorks: {
      title: "真係 2 分鐘",
      subtitle: "三步就開到店",
    },
    steps: [
      { title: "影相上架", desc: "手機影相，填個價，30 秒搞掂" },
      { title: "設定收款", desc: "FPS・PayMe・AlipayHK 即刻用" },
      { title: "放入 IG Bio", desc: "一條 Link，客人即刻落單" },
    ],
    painTitle: "做生意，可以唔使咁辛苦",
    pains: [
      { pain: "入數截圖對唔到單？", result: "漏單、錯單、客人嬲" },
      { pain: "DM 問價問到爆？", result: "回覆慢就走客" },
      { pain: "顏色尺碼一亂就超賣？", result: "退款道歉冇停過" },
    ],
    painSolution: "WoWlix 將落單、付款、庫存集中一個位",
    painSolutionSub: "你只需要專心賣嘢同出貨",
    featuresTitle: "你需要嘅，全部有齊",
    featuresSub: "唔多唔少，剛剛好",
    features: [
      { title: "靚舖面", desc: "精選主題一鍵切換，你間鋪靚過 90% IG Shop", detail: "Noir・Linen・Mochi・Petal 四款設計師主題" },
      { title: "一鍵收錢", desc: "FPS・PayMe・AlipayHK，客人揀佢想用嘅方式", detail: "後台即時睇到邊個付咗、邊個未付" },
      { title: "庫存唔亂", desc: "顏色、尺碼一鍵管理，唔怕超賣", detail: "波鞋碼、衫碼、戒指碼、自訂規格全支援" },
      { title: "訂單一目了然", desc: "新單、未付款、已出貨，後台清清楚楚", detail: "唔使再用 Excel 或者紙仔記" },
    ],
    plansTitle: "全部 0% 平台抽成",
    plansSub: "你賺幾多就係幾多",
    plansMini: [
      { name: "Free", price: 0, desc: "試水溫" },
      { name: "Lite", price: 78, desc: "認真副業" },
      { name: "Pro", price: 198, desc: "全職生意" },
    ],
    plansLink: "睇完整定價同功能比較 →",
    mostPopular: "最受歡迎",
    trustTitle: "你嘅店，你話事",
    trustSub: "4 款設計師主題，揀你鍾意嘅風格",
    templateStyles: ["型格街頭風", "溫暖手感風", "清新甜美風", "柔美花漾風"],
    trustItems: [
      { title: "WhatsApp 客服", desc: "工作日 2 小時內回覆" },
      { title: "0% 平台抽成", desc: "靠月費營運，唔抽成" },
      { title: "數據屬於你", desc: "隨時匯出，唔鎖你" },
    ],
    ctaTitle: "仲用 Google Form 接單？",
    ctaSub: "2 分鐘開店・0% 平台抽成・$0 起步",
    ctaButton: "免費開店 →",
    ctaNote: "唔使信用卡・隨時取消",
    footerPricing: "定價",
    footerTerms: "條款",
    footerPrivacy: "私隱",
    phone: {
      storeName: "My IG Shop",
      storeDesc: "手作飾物・觀塘",
      products: [
        { name: "玫瑰金手鏈", price: "$168" },
        { name: "極簡耳環", price: "$88" },
        { name: "珍珠頸鏈", price: "$238" },
        { name: "銀色戒指", price: "$128" },
      ],
      floatOrder: "新訂單！",
      floatPaid: "PayMe 已收款",
    },
  },
  en: {
    nav: { pricing: "Pricing", startFree: "Start Free" },
    hero: {
      badge: "Made for Hong Kong IG Shops",
      h1Line1: "One Link",
      h1Line2: "Turn Followers into Sales",
      subtitle1: "0% platform fee · From $0 · 2-min setup",
      subtitle2: "Orders, payments, stock — one link does it all",
      cta: "Start Free →",
      ctaSecondary: "See Pricing",
    },
    howItWorks: {
      title: "Really just 2 minutes",
      subtitle: "3 steps to your store",
    },
    steps: [
      { title: "Snap & List", desc: "Take a photo, set a price, done in 30 seconds" },
      { title: "Set Up Payments", desc: "FPS · PayMe · AlipayHK — ready instantly" },
      { title: "Add to IG Bio", desc: "One link, customers order instantly" },
    ],
    painTitle: "Running a business shouldn't be this hard",
    pains: [
      { pain: "Can't match payments to orders?", result: "Lost orders, angry customers" },
      { pain: "Drowning in price-check DMs?", result: "Slow replies = lost sales" },
      { pain: "Overselling wrong sizes/colors?", result: "Non-stop refunds & apologies" },
    ],
    painSolution: "WoWlix centralises orders, payments & stock in one place",
    painSolutionSub: "You just focus on selling and shipping",
    featuresTitle: "Everything you need",
    featuresSub: "No more, no less",
    features: [
      { title: "Beautiful Storefront", desc: "Switch themes in one tap — look better than 90% of IG shops", detail: "4 designer themes: Noir · Linen · Mochi · Petal" },
      { title: "Easy Payments", desc: "FPS · PayMe · AlipayHK — customers choose how to pay", detail: "See who's paid and who hasn't, in real time" },
      { title: "Stock Control", desc: "Manage sizes & colors easily, no overselling", detail: "Sneaker, clothing, ring sizes + custom specs" },
      { title: "Clear Orders", desc: "New, unpaid, shipped — all clear in the dashboard", detail: "No more Excel sheets or paper notes" },
    ],
    plansTitle: "0% Platform Fee on All Plans",
    plansSub: "What you earn is what you keep",
    plansMini: [
      { name: "Free", price: 0, desc: "Try it out" },
      { name: "Lite", price: 78, desc: "Serious side hustle" },
      { name: "Pro", price: 198, desc: "Full-time business" },
    ],
    plansLink: "See full pricing & feature comparison →",
    mostPopular: "Most Popular",
    trustTitle: "Your store, your rules",
    trustSub: "4 designer themes — pick your style",
    templateStyles: ["Street Edge", "Warm Craft", "Fresh Sweet", "Soft Petal"],
    trustItems: [
      { title: "WhatsApp Support", desc: "Reply within 2h on weekdays" },
      { title: "0% Platform Fee", desc: "Subscription-based, no commission" },
      { title: "Your Data", desc: "Export anytime, no lock-in" },
    ],
    ctaTitle: "Still using Google Forms for orders?",
    ctaSub: "2-min setup · 0% platform fee · Start from $0",
    ctaButton: "Start Free →",
    ctaNote: "No credit card required · Cancel anytime",
    footerPricing: "Pricing",
    footerTerms: "Terms",
    footerPrivacy: "Privacy",
    phone: {
      storeName: "My IG Shop",
      storeDesc: "Handmade Jewellery · Kwun Tong",
      products: [
        { name: "Rose Gold Bracelet", price: "$168" },
        { name: "Minimal Earrings", price: "$88" },
        { name: "Pearl Necklace", price: "$238" },
        { name: "Silver Ring", price: "$128" },
      ],
      floatOrder: "New order!",
      floatPaid: "PayMe received",
    },
  },
};

/* ─── SVG Icons ─── */

const STEP_ICONS = [
  // Camera / photo
  <svg key="step-0" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>,
  // Payment card
  <svg key="step-1" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>,
  // Link
  <svg key="step-2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>,
];

const PAIN_ICONS = [
  <svg key="pain-0" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>,
  <svg key="pain-1" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="9" y1="10" x2="15" y2="10" />
  </svg>,
  <svg key="pain-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>,
];

const FEATURE_ICONS = [
  // Grid / storefront
  <svg key="feat-0" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>,
  // Dollar / payments
  <svg key="feat-1" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>,
  // Checkbox / stock
  <svg key="feat-2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>,
  // Document / orders
  <svg key="feat-3" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>,
];

const TRUST_ICONS = [
  <svg key="trust-0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  <svg key="trust-1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  <svg key="trust-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>,
];

/* ─── Template Data ─── */

const TEMPLATES = [
  { name: "Noir", gradient: "linear-gradient(135deg, #1a1a1a, #2d2d2d)", text: "#fff", accent: "#FF9500" },
  { name: "Linen", gradient: "linear-gradient(135deg, #F5F0EB, #E8DDD3)", text: "#3D2E1E", accent: "#8B7355" },
  { name: "Mochi", gradient: "linear-gradient(135deg, #FFF8F0, #FFE8CC)", text: "#5C3D00", accent: "#FF9500" },
  { name: "Petal", gradient: "linear-gradient(135deg, #FFF0F5, #FFE0EB)", text: "#8B2252", accent: "#D4447C" },
];

const PLAN_COLORS = [
  { bg: "#fff", color: "#1A1A1A", border: "#E5E7EB" },
  { bg: "#FFF3E0", color: "#1A1A1A", border: "#FF9500" },
  { bg: "#1A1A1A", color: "#fff", border: "#333" },
];

/* ─── Sub-components ─── */

function PhoneMockup({ locale }: { locale: LandingLocale }) {
  const t = T[locale].phone;
  return (
    <div style={{ position: "relative", width: 280, height: 520, margin: "0 auto" }}>
      <div style={{
        width: "100%", height: "100%",
        background: "#1A1A1A",
        borderRadius: 40,
        padding: "12px 10px",
        boxShadow: "0 25px 80px rgba(0,0,0,0.25), 0 0 0 2px #333",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 120, height: 24, background: "#1A1A1A", borderRadius: "0 0 16px 16px", zIndex: 2 }} />
        <div style={{
          width: "100%", height: "100%",
          background: "linear-gradient(180deg, #1A1A1A, #222)",
          borderRadius: 30,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ padding: "32px 16px 12px", textAlign: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FF9500", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>W</div>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{t.storeName}</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 2 }}>{t.storeDesc}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "8px 12px", flex: 1 }}>
            {[
              { color: "#FFE0EB", ...t.products[0] },
              { color: "#E8DDD3", ...t.products[1] },
              { color: "#FFF3E0", ...t.products[2] },
              { color: "#ECFDF5", ...t.products[3] },
            ].map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ height: 80, background: p.color, opacity: 0.3 }} />
                <div style={{ padding: "6px 8px" }}>
                  <div style={{ color: "#fff", fontSize: 10, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ color: "#FF9500", fontSize: 11, fontWeight: 700 }}>{p.price}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: "8px 12px 16px" }}>
            <div style={{ background: "#FF9500", borderRadius: 10, padding: "10px", textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
              Shop Now
            </div>
          </div>
        </div>
      </div>
      <div style={{
        position: "absolute", top: 60, right: -30,
        background: "#fff", borderRadius: 12, padding: "8px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        fontSize: 12, fontWeight: 600, color: "#1A1A1A",
        animation: "lp-float 3s ease-in-out infinite",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ color: "#FF9500" }}>$</span> {t.floatOrder}
      </div>
      <div style={{
        position: "absolute", bottom: 80, left: -24,
        background: "#fff", borderRadius: 12, padding: "8px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        fontSize: 11, color: "#666",
        animation: "lp-float 3s ease-in-out 1.5s infinite",
      }}>
        <span style={{ color: "#10B981", fontWeight: 700 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        {t.floatPaid}
      </div>
    </div>
  );
}

function FeatureCard({ feature, icon }: { feature: { title: string; desc: string; detail: string }; icon: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#FFF8F0" : "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 20,
        padding: "28px 24px",
        transition: "all 0.3s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 40px rgba(255,149,0,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
        cursor: "default",
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: "#FFF3E0", display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{feature.title}</h3>
      <p style={{ fontSize: 15, color: "#555", lineHeight: 1.6, marginBottom: 8 }}>{feature.desc}</p>
      <p style={{ fontSize: 13, color: "#999", lineHeight: 1.5 }}>{feature.detail}</p>
    </div>
  );
}

/* ─── Main Component ─── */

export default function LandingPage({ locale = "zh-HK" }: LandingPageProps) {
  const t = T[locale];
  const prefix = `/${locale}`;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Noto Sans TC', -apple-system, sans-serif", color: "#1A1A1A", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,500;9..40,700;9..40,800;9..40,900&family=Noto+Sans+TC:wght@400;500;700;900&display=swap');
        @keyframes lp-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes lp-fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* ─── NAV ─── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 24px", maxWidth: 1200, margin: "0 auto",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF9500" style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }}>
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
          <span style={{ color: "#FF9500" }}>W</span>o<span style={{ color: "#FF9500" }}>W</span>lix
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href={`${prefix}/pricing`} style={{ fontSize: 14, fontWeight: 600, color: "#666", textDecoration: "none" }}>{t.nav.pricing}</Link>
          <Link href={`${prefix}/start`} style={{
            background: "#FF9500", color: "#fff", border: "none",
            padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700,
            textDecoration: "none",
          }}>{t.nav.startFree}</Link>
        </div>
      </nav>

      {/* ─── SECTION 1: HERO ─── */}
      <section style={{
        padding: "60px 24px 80px",
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center", gap: 60,
        flexWrap: "wrap", justifyContent: "center",
      }}>
        <div style={{ flex: 1, minWidth: 320, maxWidth: 520, animation: "lp-fadeInUp 0.8s ease" }}>
          <div style={{
            display: "inline-block", background: "#FFF3E0", color: "#E68600",
            padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 20,
          }}>
            {t.hero.badge}
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900,
            lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.02em",
          }}>
            {t.hero.h1Line1}
            <br />
            <span style={{ color: "#FF9500" }}>{t.hero.h1Line2}</span>
          </h1>
          <p style={{ fontSize: 18, color: "#666", lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
            {t.hero.subtitle1}
            <br />
            {t.hero.subtitle2}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href={`${prefix}/start`} style={{
              background: "#FF9500", color: "#fff", border: "none",
              padding: "16px 36px", borderRadius: 14, fontSize: 17, fontWeight: 700,
              textDecoration: "none", boxShadow: "0 8px 30px rgba(255,149,0,0.3)",
              transition: "all 0.2s", display: "inline-block",
            }}>{t.hero.cta}</Link>
            <Link href={`${prefix}/pricing`} style={{
              background: "transparent", color: "#FF9500",
              border: "2px solid #FF9500",
              padding: "14px 32px", borderRadius: 14, fontSize: 17, fontWeight: 700,
              textDecoration: "none", transition: "all 0.2s", display: "inline-block",
            }}>{t.hero.ctaSecondary}</Link>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 300, maxWidth: 400, animation: "lp-fadeInUp 1s ease 0.2s both" }}>
          <PhoneMockup locale={locale} />
        </div>
      </section>

      {/* ─── SECTION 2: HOW IT WORKS ─── */}
      <section style={{ padding: "80px 24px", background: "#FAFAFA" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>{t.howItWorks.title}</h2>
          <p style={{ color: "#888", fontSize: 16, marginBottom: 48 }}>{t.howItWorks.subtitle}</p>
          <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
            {t.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 200 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: "#FFF3E0", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  position: "relative",
                }}>
                  {STEP_ICONS[i]}
                  <div style={{
                    position: "absolute", top: -6, left: -6,
                    width: 22, height: 22, borderRadius: "50%",
                    background: "#FF9500", color: "#fff",
                    fontSize: 11, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{i + 1}</div>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: PAIN POINTS ─── */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>
              {t.painTitle}
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {t.pains.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "20px 24px",
                background: "#FFF5F5", borderRadius: 16,
                border: "1px solid #FFE5E5",
              }}>
                {PAIN_ICONS[i]}
                <div>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{p.pain}</span>
                  <span style={{ fontSize: 15, color: "#888", marginLeft: 8 }}>{p.result}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 32, textAlign: "center", padding: "24px",
            background: "#F0FFF4", borderRadius: 16, border: "1px solid #C6F6D5",
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#22543D" }}>
              {t.painSolution}
            </div>
            <div style={{ fontSize: 14, color: "#48BB78", marginTop: 4 }}>
              {t.painSolutionSub}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: FEATURES ─── */}
      <section style={{ padding: "80px 24px", background: "#FAFAFA" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>
              {t.featuresTitle}
            </h2>
            <p style={{ color: "#888", fontSize: 16 }}>{t.featuresSub}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {t.features.map((f, i) => (
              <FeatureCard key={i} feature={f} icon={FEATURE_ICONS[i]} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: MINI PLAN PREVIEW ─── */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>
            {t.plansTitle}
          </h2>
          <p style={{ color: "#888", fontSize: 16, marginBottom: 40 }}>{t.plansSub}</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            {t.plansMini.map((plan, i) => {
              const c = PLAN_COLORS[i];
              const highlight = i === 1;
              return (
                <div key={i} style={{
                  padding: "24px 28px",
                  background: c.bg,
                  color: c.color,
                  border: `2px solid ${c.border}`,
                  borderRadius: 20,
                  minWidth: 160,
                  flex: 1,
                  maxWidth: 200,
                  transform: highlight ? "scale(1.05)" : "scale(1)",
                  boxShadow: highlight ? "0 8px 30px rgba(255,149,0,0.15)" : "none",
                  transition: "all 0.3s",
                  position: "relative",
                }}>
                  {highlight && (
                    <div style={{
                      position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                      background: "#FF9500", color: "#fff", padding: "2px 12px",
                      borderRadius: 10, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                    }}>{t.mostPopular}</div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.6, marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2 }}>
                    <span style={{ fontSize: 14, opacity: 0.5 }}>$</span>
                    <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>{plan.price}</span>
                    <span style={{ fontSize: 13, opacity: 0.5 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.5, marginTop: 4 }}>{plan.desc}</div>
                </div>
              );
            })}
          </div>
          <Link href={`${prefix}/pricing`} style={{
            color: "#FF9500", fontSize: 16, fontWeight: 700,
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            {t.plansLink}
          </Link>
        </div>
      </section>

      {/* ─── SECTION 6: TRUST + TEMPLATES ─── */}
      <section style={{ padding: "80px 24px", background: "#FAFAFA" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>
              {t.trustTitle}
            </h2>
            <p style={{ color: "#888", fontSize: 16 }}>{t.trustSub}</p>
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
            {TEMPLATES.map((tmpl, i) => (
              <div key={i} style={{
                width: 180, borderRadius: 20, overflow: "hidden",
                border: "1px solid #E5E7EB", background: "#fff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                transition: "all 0.3s",
              }}>
                <div style={{
                  height: 200, background: tmpl.gradient,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", padding: 16,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: tmpl.accent, opacity: 0.3, marginBottom: 8,
                  }} />
                  <div style={{ fontSize: 16, fontWeight: 800, color: tmpl.text }}>{tmpl.name}</div>
                  <div style={{ fontSize: 10, color: tmpl.text, opacity: 0.5, marginTop: 2 }}>@{tmpl.name.toLowerCase()}shop</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                    {[1, 2].map(n => (
                      <div key={n} style={{
                        width: 44, height: 44, borderRadius: 6,
                        background: tmpl.text === "#fff" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                      }} />
                    ))}
                  </div>
                  <div style={{
                    marginTop: 10, width: "80%", height: 24, borderRadius: 6,
                    background: tmpl.accent, opacity: 0.8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, color: "#fff", fontWeight: 700,
                  }}>Shop Now</div>
                </div>
                <div style={{ padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{t.templateStyles[i]}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Trust bar */}
          <div style={{
            display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap",
            padding: "32px 24px",
            background: "#fff", borderRadius: 20, border: "1px solid #E5E7EB",
          }}>
            {t.trustItems.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 200 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "#FFF3E0", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {TRUST_ICONS[i]}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: FINAL CTA ─── */}
      <section style={{
        padding: "80px 24px",
        background: "linear-gradient(180deg, #1A1A1A, #111)",
        textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(255,149,0,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
        <div style={{ position: "relative" }}>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900,
            color: "#fff", marginBottom: 12,
          }}>
            {t.ctaTitle}
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>
            {t.ctaSub}
          </p>
          <Link href={`${prefix}/start`} style={{
            background: "#FF9500", color: "#fff", border: "none",
            padding: "18px 48px", borderRadius: 14, fontSize: 20, fontWeight: 700,
            textDecoration: "none", display: "inline-block",
            boxShadow: "0 8px 30px rgba(255,149,0,0.4)",
          }}>
            {t.ctaButton}
          </Link>
          <div style={{ marginTop: 20, fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
            {t.ctaNote}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        padding: "24px", textAlign: "center",
        background: "#111", color: "rgba(255,255,255,0.3)", fontSize: 12,
      }}>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 8 }}>
          <Link href={`${prefix}/pricing`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{t.footerPricing}</Link>
          <a href="/terms" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{t.footerTerms}</a>
          <a href="/privacy" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{t.footerPrivacy}</a>
        </div>
        © 2026 WoWlix by Flow Studio HK
      </footer>
    </div>
  );
}
