"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

/* ─── i18n ─── */
const T = {
  "zh-HK": {
    // Nav
    navPricing: "定價",
    navCta: "免費開店",
    // Hero
    heroBadge: "專為香港 IG 小店而設",
    heroH1a: "一條 Link",
    heroH1b: "將 Follower 變成生意",
    heroSub1: "0% 平台抽成・$0 起・2 分鐘開店",
    heroSub2: "落單、收款、庫存，一個 Link 搞掂晒",
    ctaPrimary: "免費開店 →",
    ctaSecondary: "睇定價",
    // Phone mockup
    miniStoreName: "My IG Shop",
    miniStoreDesc: "手作飾物・觀塘",
    miniP1: "玫瑰金手鏈",
    miniP1Price: "$168",
    miniP2: "極簡耳環",
    miniP2Price: "$88",
    miniP3: "珍珠頸鏈",
    miniP3Price: "$238",
    miniP4: "銀色戒指",
    miniP4Price: "$128",
    miniBtn: "Shop Now",
    float1: "新訂單！",
    float2: "PayMe 已收款",
    // How it works
    howTitle: "真係 2 分鐘",
    howSub: "三步就開到店",
    step1t: "影相上架",
    step1d: "手機影相，填個價，30 秒搞掂",
    step2t: "設定收款",
    step2d: "FPS・PayMe・AlipayHK 即刻用",
    step3t: "放入 IG Bio",
    step3d: "一條 Link，客人即刻落單",
    // Pain points
    painTitle: "做生意，可以唔使咁辛苦",
    pain1: "入數截圖對唔到單？",
    pain1r: "漏單、錯單、客人嬲",
    pain2: "DM 問價問到爆？",
    pain2r: "回覆慢就走客",
    pain3: "顏色尺碼一亂就超賣？",
    pain3r: "退款道歉冇停過",
    solutionTitle: "WoWlix 將落單、付款、庫存集中一個位",
    solutionDesc: "你只需要專心賣嘢同出貨",
    // Features
    featTitle: "你需要嘅，全部有齊",
    featSub: "唔多唔少，剛剛好",
    feat1t: "靚舖面",
    feat1d: "精選主題一鍵切換，你間鋪靚過 90% IG Shop",
    feat1detail: "Noir・Linen・Mochi・Petal 四款設計師主題",
    feat2t: "一鍵收錢",
    feat2d: "FPS・PayMe・AlipayHK，客人揀佢想用嘅方式",
    feat2detail: "後台即時睇到邊個付咗、邊個未付",
    feat3t: "庫存唔亂",
    feat3d: "顏色、尺碼一鍵管理，唔怕超賣",
    feat3detail: "波鞋碼、衫碼、戒指碼、自訂規格全支援",
    feat4t: "訂單一目了然",
    feat4d: "新單、未付款、已出貨，後台清清楚楚",
    feat4detail: "唔使再用 Excel 或者紙仔記",
    // Mini plans
    planTitle: "全部 0% 平台抽成",
    planSub: "你賺幾多就係幾多",
    planFreeName: "Free",
    planFreeDesc: "試水溫",
    planLiteName: "Lite",
    planLiteDesc: "認真副業",
    planLiteBadge: "最受歡迎",
    planProName: "Pro",
    planProDesc: "全職生意",
    planLink: "睇完整定價同功能比較 →",
    planPeriod: "/月",
    // Templates + Trust
    tmplTitle: "你嘅店，你話事",
    tmplSub: "4 款設計師主題，揀你鍾意嘅風格",
    trust1t: "WhatsApp 客服",
    trust1d: "工作日 2 小時內回覆",
    trust2t: "0% 平台抽成",
    trust2d: "靠月費營運，唔抽成",
    trust3t: "數據屬於你",
    trust3d: "隨時匯出，唔鎖你",
    // Final CTA
    ctaTitle: "仲用 Google Form 接單？",
    ctaSub: "2 分鐘開店・0% 平台抽成・$0 起步",
    ctaBtn: "免費開店 →",
    ctaNote: "唔使信用卡・隨時取消",
    // Footer
    footerPricing: "定價",
    footerTerms: "條款",
    footerPrivacy: "私隱",
    footerCopy: "© 2026 WoWlix by Flow Studio HK",
  },
  en: {
    navPricing: "Pricing",
    navCta: "Start Free",
    heroBadge: "Built for HK Instagram shops",
    heroH1a: "One Link",
    heroH1b: "Turn Followers into Sales",
    heroSub1: "0% commission · From $0 · 2 min setup",
    heroSub2: "Orders, payments, inventory — one link handles it all",
    ctaPrimary: "Start Free →",
    ctaSecondary: "See Pricing",
    miniStoreName: "My IG Shop",
    miniStoreDesc: "Handmade jewelry · Kwun Tong",
    miniP1: "Rose Gold Bracelet",
    miniP1Price: "$168",
    miniP2: "Minimal Earrings",
    miniP2Price: "$88",
    miniP3: "Pearl Necklace",
    miniP3Price: "$238",
    miniP4: "Silver Ring",
    miniP4Price: "$128",
    miniBtn: "Shop Now",
    float1: "New order!",
    float2: "PayMe received",
    howTitle: "Really 2 minutes",
    howSub: "3 steps to open your shop",
    step1t: "Photo & list",
    step1d: "Snap a photo, set a price, done in 30 seconds",
    step2t: "Set up payments",
    step2d: "FPS · PayMe · AlipayHK ready to go",
    step3t: "Add to IG Bio",
    step3d: "One link, customers order instantly",
    painTitle: "Running a business doesn't have to be this hard",
    pain1: "Can't match payment screenshots to orders?",
    pain1r: "Missing orders, wrong orders, angry customers",
    pain2: "DMs flooded with price inquiries?",
    pain2r: "Slow replies lose customers",
    pain3: "Colors & sizes mix up causing overselling?",
    pain3r: "Non-stop refunds and apologies",
    solutionTitle: "WoWlix centralizes orders, payments, and inventory",
    solutionDesc: "You just focus on selling and shipping",
    featTitle: "Everything you need",
    featSub: "Nothing more, nothing less",
    feat1t: "Beautiful Storefront",
    feat1d: "One-click designer themes — your shop looks better than 90% of IG shops",
    feat1detail: "4 designer themes: Noir · Linen · Mochi · Petal",
    feat2t: "One-click Payments",
    feat2d: "FPS · PayMe · AlipayHK — customers choose their method",
    feat2detail: "Dashboard shows who paid and who hasn't",
    feat3t: "Organized Inventory",
    feat3d: "Colors, sizes managed easily — no overselling",
    feat3detail: "Shoe sizes, clothing sizes, ring sizes, custom specs all supported",
    feat4t: "Orders at a Glance",
    feat4d: "New, unpaid, shipped — dashboard shows it all clearly",
    feat4detail: "No more Excel or paper notes",
    planTitle: "0% platform commission",
    planSub: "What you earn is what you keep",
    planFreeName: "Free",
    planFreeDesc: "Test the waters",
    planLiteName: "Lite",
    planLiteDesc: "Serious side hustle",
    planLiteBadge: "Most popular",
    planProName: "Pro",
    planProDesc: "Full-time business",
    planLink: "See full pricing & feature comparison →",
    planPeriod: "/mo",
    tmplTitle: "Your shop, your rules",
    tmplSub: "4 designer themes — pick your style",
    trust1t: "WhatsApp Support",
    trust1d: "Reply within 2 hours on workdays",
    trust2t: "0% Commission",
    trust2d: "Runs on subscription, no commission",
    trust3t: "Your Data Is Yours",
    trust3d: "Export anytime, never locked in",
    ctaTitle: "Still using Google Forms?",
    ctaSub: "2 min setup · 0% commission · From $0",
    ctaBtn: "Start Free →",
    ctaNote: "No credit card · Cancel anytime",
    footerPricing: "Pricing",
    footerTerms: "Terms",
    footerPrivacy: "Privacy",
    footerCopy: "© 2026 WoWlix by Flow Studio HK",
  },
};

/* ─── SVG Icons ─── */

// Steps icons
const IconCamera = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);
const IconCard = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const IconLink = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

// Pain icons
const IconX = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const IconDM = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="9" y1="10" x2="15" y2="10" />
  </svg>
);
const IconWarning = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Feature icons
const IconGrid = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IconDollar = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconCheck = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);
const IconDoc = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

// Trust icons
const IconChat = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconShield = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconKey = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

/* ─── Data ─── */

const STEP_ICONS = [IconCamera, IconCard, IconLink];

const PAIN_ICONS = [IconX, IconDM, IconWarning];

const FEATURE_ICONS = [IconGrid, IconDollar, IconCheck, IconDoc];

const TEMPLATES = [
  { name: "Noir", style_zhHK: "型格街頭風", style_en: "Urban street style", gradient: "linear-gradient(135deg, #1a1a1a, #2d2d2d)", text: "#fff", accent: "#FF9500" },
  { name: "Linen", style_zhHK: "溫暖手感風", style_en: "Warm handmade feel", gradient: "linear-gradient(135deg, #F5F0EB, #E8DDD3)", text: "#3D2E1E", accent: "#8B7355" },
  { name: "Mochi", style_zhHK: "清新甜美風", style_en: "Fresh & sweet", gradient: "linear-gradient(135deg, #FFF8F0, #FFE8CC)", text: "#5C3D00", accent: "#FF9500" },
  { name: "Petal", style_zhHK: "柔美花漾風", style_en: "Soft floral", gradient: "linear-gradient(135deg, #FFF0F5, #FFE0EB)", text: "#8B2252", accent: "#D4447C" },
];

const PLANS = [
  { price: 0, bg: "#fff", color: "#1A1A1A", border: "#E5E7EB" },
  { price: 78, bg: "#FFF3E0", color: "#1A1A1A", border: "#FF9500", highlight: true },
  { price: 198, bg: "#1A1A1A", color: "#fff", border: "#333" },
];

/* ─── Sub-components ─── */

function PhoneMockup({ t }: { t: (typeof T)["zh-HK"] }) {
  return (
    <div style={{ position: "relative", width: 260, maxWidth: "100%", height: 490, margin: "0 auto" }}>
      {/* Phone frame */}
      <div style={{
        width: "100%", height: "100%",
        background: "#1A1A1A",
        borderRadius: 40,
        padding: "12px 10px",
        boxShadow: "0 25px 80px rgba(0,0,0,0.25), 0 0 0 2px #333",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Notch */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 120, height: 24, background: "#1A1A1A", borderRadius: "0 0 16px 16px", zIndex: 2 }} />
        {/* Screen */}
        <div style={{
          width: "100%", height: "100%",
          background: "linear-gradient(180deg, #1A1A1A, #222)",
          borderRadius: 30,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column" as const,
        }}>
          {/* Store header */}
          <div style={{ padding: "32px 16px 12px", textAlign: "center" as const }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FF9500", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>W</div>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{t.miniStoreName}</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 2 }}>{t.miniStoreDesc}</div>
          </div>
          {/* Products grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "8px 12px", flex: 1 }}>
            {([
              { color: "#FFE0EB", name: t.miniP1, price: t.miniP1Price },
              { color: "#E8DDD3", name: t.miniP2, price: t.miniP2Price },
              { color: "#FFF3E0", name: t.miniP3, price: t.miniP3Price },
              { color: "#ECFDF5", name: t.miniP4, price: t.miniP4Price },
            ]).map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ height: 80, background: p.color, opacity: 0.3 }} />
                <div style={{ padding: "6px 8px" }}>
                  <div style={{ color: "#fff", fontSize: 10, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ color: "#FF9500", fontSize: 11, fontWeight: 700 }}>{p.price}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Bottom CTA */}
          <div style={{ padding: "8px 12px 16px" }}>
            <div style={{ background: "#FF9500", borderRadius: 10, padding: "10px", textAlign: "center" as const, color: "#fff", fontSize: 12, fontWeight: 700 }}>
              {t.miniBtn}
            </div>
          </div>
        </div>
      </div>
      {/* Floating notification — hidden on very small screens to avoid overflow */}
      <div className="hidden sm:flex" style={{
        position: "absolute", top: 60, right: -30,
        background: "#fff", borderRadius: 12, padding: "8px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        fontSize: 12, fontWeight: 600, color: "#1A1A1A",
        animation: "float 3s ease-in-out infinite",
        alignItems: "center", gap: 6,
      }}>
        <span style={{ color: "#FF9500" }}>$</span> {t.float1}
      </div>
      <div className="hidden sm:block" style={{
        position: "absolute", bottom: 80, left: -24,
        background: "#fff", borderRadius: 12, padding: "8px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        fontSize: 11, color: "#666",
        animation: "float 3s ease-in-out 1.5s infinite",
      }}>
        <span style={{ color: "#10B981", fontWeight: 700 }}>&#10003;</span> {t.float2}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, detail }: { icon: React.ReactNode; title: string; desc: string; detail: string }) {
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
      <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 15, color: "#555", lineHeight: 1.6, marginBottom: 8 }}>{desc}</p>
      <p style={{ fontSize: 13, color: "#999", lineHeight: 1.5 }}>{detail}</p>
    </div>
  );
}

/* ─── Main Component ─── */

export default function LandingPage({ locale = "zh-HK" }: { locale?: Locale }) {
  const t = T[locale] || T["en"];
  const isZH = locale === "zh-HK";

  return (
    <div style={{ fontFamily: "'DM Sans', 'Noto Sans TC', -apple-system, sans-serif", color: "#1A1A1A", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,500;9..40,700;9..40,800;9..40,900&family=Noto+Sans+TC:wght@400;500;700;900&display=swap');
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 640px) {
          .steps-list { flex-direction: column !important; align-items: stretch !important; }
          .trust-list { flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>

      {/* ─── NAV ─── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 24px", maxWidth: 1200, margin: "0 auto",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>
          <span style={{ color: "#FF9500" }}>&#10022;</span> WoWlix
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href={`/${locale}/pricing`} style={{ fontSize: 14, fontWeight: 600, color: "#666", textDecoration: "none" }}>{t.navPricing}</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}>
            <Link
              href="/zh-HK"
              style={{
                color: isZH ? "#1A1A1A" : "#AAA",
                fontWeight: isZH ? 700 : 400,
                textDecoration: "none",
                padding: "4px 2px",
                transition: "color 0.2s",
              }}
            >
              繁
            </Link>
            <span style={{ color: "#CCC", userSelect: "none" }}>/</span>
            <Link
              href="/en"
              style={{
                color: !isZH ? "#1A1A1A" : "#AAA",
                fontWeight: !isZH ? 700 : 400,
                textDecoration: "none",
                padding: "4px 2px",
                transition: "color 0.2s",
              }}
            >
              EN
            </Link>
          </div>
          <Link href={`/${locale}/start`} style={{
            background: "#FF9500", color: "#fff", border: "none",
            padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700,
            textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center",
          }}>{t.navCta}</Link>
        </div>
      </nav>

      {/* ─── SECTION 1: HERO ─── */}
      <section style={{
        padding: "60px 24px 80px",
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center", gap: 60,
        flexWrap: "wrap" as const, justifyContent: "center",
      }}>
        <div style={{ flex: 1, minWidth: 0, maxWidth: 520, animation: "fadeInUp 0.8s ease" }}>
          <div style={{
            display: "inline-block", background: "#FFF3E0", color: "#E68600",
            padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700, marginBottom: 20,
          }}>
            {t.heroBadge}
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900,
            lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.02em",
          }}>
            {t.heroH1a}
            <br />
            <span style={{ color: "#FF9500" }}>{t.heroH1b}</span>
          </h1>
          <p style={{ fontSize: 18, color: "#666", lineHeight: 1.7, marginBottom: 32, maxWidth: 440 }}>
            {t.heroSub1}
            <br />
            {t.heroSub2}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
            <Link href={`/${locale}/start`} style={{
              background: "#FF9500", color: "#fff", border: "none",
              padding: "16px 36px", borderRadius: 14, fontSize: 17, fontWeight: 700,
              textDecoration: "none", boxShadow: "0 8px 30px rgba(255,149,0,0.3)",
              transition: "all 0.2s", display: "inline-block",
            }}>{t.ctaPrimary}</Link>
            <Link href={`/${locale}/pricing`} style={{
              background: "transparent", color: "#FF9500",
              border: "2px solid #FF9500",
              padding: "14px 32px", borderRadius: 14, fontSize: 17, fontWeight: 700,
              textDecoration: "none", transition: "all 0.2s", display: "inline-block",
            }}>{t.ctaSecondary}</Link>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0, maxWidth: 400, animation: "fadeInUp 1s ease 0.2s both" }}>
          <PhoneMockup t={t} />
        </div>
      </section>

      {/* ─── SECTION 2: HOW IT WORKS ─── */}
      <section style={{ padding: "80px 24px", background: "#FAFAFA" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" as const }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>{t.howTitle}</h2>
          <p style={{ color: "#888", fontSize: 16, marginBottom: 48 }}>{t.howSub}</p>
          <div className="steps-list" style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" as const }}>
            {([
              { title: t.step1t, desc: t.step1d },
              { title: t.step2t, desc: t.step2d },
              { title: t.step3t, desc: t.step3d },
            ]).map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, flex: "1 1 200px", minWidth: 0, width: "100%" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: "#FFF3E0", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  position: "relative" as const,
                }}>
                  {STEP_ICONS[i]}
                  <div style={{
                    position: "absolute" as const, top: -6, left: -6,
                    width: 22, height: 22, borderRadius: "50%",
                    background: "#FF9500", color: "#fff",
                    fontSize: 11, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{i + 1}</div>
                </div>
                <div style={{ textAlign: "left" as const }}>
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
          <div style={{ textAlign: "center" as const, marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>
              {t.painTitle}
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
            {([
              { pain: t.pain1, result: t.pain1r },
              { pain: t.pain2, result: t.pain2r },
              { pain: t.pain3, result: t.pain3r },
            ]).map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "16px",
                background: "#FFF5F5", borderRadius: 16,
                border: "1px solid #FFE5E5",
              }}>
                <div style={{ flexShrink: 0, paddingTop: 2 }}>{PAIN_ICONS[i]}</div>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{p.pain}</span>
                  <br />
                  <span style={{ fontSize: 14, color: "#888" }}>{p.result}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 32, textAlign: "center" as const, padding: "24px",
            background: "#F0FFF4", borderRadius: 16, border: "1px solid #C6F6D5",
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#22543D" }}>
              {t.solutionTitle}
            </div>
            <div style={{ fontSize: 14, color: "#48BB78", marginTop: 4 }}>
              {t.solutionDesc}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: FEATURES ─── */}
      <section style={{ padding: "80px 24px", background: "#FAFAFA" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center" as const, marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>
              {t.featTitle}
            </h2>
            <p style={{ color: "#888", fontSize: 16 }}>{t.featSub}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: 20 }}>
            {([
              { title: t.feat1t, desc: t.feat1d, detail: t.feat1detail },
              { title: t.feat2t, desc: t.feat2d, detail: t.feat2detail },
              { title: t.feat3t, desc: t.feat3d, detail: t.feat3detail },
              { title: t.feat4t, desc: t.feat4d, detail: t.feat4detail },
            ]).map((f, i) => (
              <FeatureCard key={i} icon={FEATURE_ICONS[i]} title={f.title} desc={f.desc} detail={f.detail} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: MINI PLAN PREVIEW ─── */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" as const }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>
            {t.planTitle}
          </h2>
          <p style={{ color: "#888", fontSize: 16, marginBottom: 40 }}>{t.planSub}</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" as const, marginBottom: 32 }}>
            {([
              { name: t.planFreeName, desc: t.planFreeDesc },
              { name: t.planLiteName, desc: t.planLiteDesc },
              { name: t.planProName, desc: t.planProDesc },
            ]).map((plan, i) => {
              const p = PLANS[i];
              return (
                <div key={i} style={{
                  padding: "24px 20px",
                  background: p.bg,
                  color: p.color,
                  border: `2px solid ${p.border}`,
                  borderRadius: 20,
                  minWidth: 0,
                  flex: "1 1 100px",
                  maxWidth: 200,
                  transform: p.highlight ? "scale(1.05)" : "scale(1)",
                  boxShadow: p.highlight ? "0 8px 30px rgba(255,149,0,0.15)" : "none",
                  transition: "all 0.3s",
                  position: "relative" as const,
                }}>
                  {p.highlight && (
                    <div style={{
                      position: "absolute" as const, top: -10, left: "50%", transform: "translateX(-50%)",
                      background: "#FF9500", color: "#fff", padding: "2px 12px",
                      borderRadius: 10, fontSize: 11, fontWeight: 700,
                    }}>{t.planLiteBadge}</div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.6, marginBottom: 4 }}>{plan.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 2 }}>
                    <span style={{ fontSize: 14, opacity: 0.5 }}>$</span>
                    <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1 }}>{p.price}</span>
                    <span style={{ fontSize: 13, opacity: 0.5 }}>{t.planPeriod}</span>
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.5, marginTop: 4 }}>{plan.desc}</div>
                </div>
              );
            })}
          </div>
          <Link href={`/${locale}/pricing`} style={{
            color: "#FF9500", fontSize: 16, fontWeight: 700,
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
          }}>
            {t.planLink}
          </Link>
        </div>
      </section>

      {/* ─── SECTION 6: TRUST + TEMPLATES ─── */}
      <section style={{ padding: "80px 24px", background: "#FAFAFA" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center" as const, marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>
              {t.tmplTitle}
            </h2>
            <p style={{ color: "#888", fontSize: 16 }}>{t.tmplSub}</p>
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" as const, marginBottom: 48 }}>
            {TEMPLATES.map((tmpl, i) => (
              <div key={i} style={{
                flex: "1 1 140px", maxWidth: 200, minWidth: 140, borderRadius: 20, overflow: "hidden",
                border: "1px solid #E5E7EB", background: "#fff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                transition: "all 0.3s",
              }}>
                <div style={{
                  height: 200, background: tmpl.gradient,
                  display: "flex", flexDirection: "column" as const,
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
                <div style={{ padding: "12px 14px", textAlign: "center" as const }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{isZH ? tmpl.style_zhHK : tmpl.style_en}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div className="trust-list" style={{
            display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" as const,
            padding: "32px 24px",
            background: "#fff", borderRadius: 20, border: "1px solid #E5E7EB",
          }}>
            {([
              { icon: IconChat, title: t.trust1t, desc: t.trust1d },
              { icon: IconShield, title: t.trust2t, desc: t.trust2d },
              { icon: IconKey, title: t.trust3t, desc: t.trust3d },
            ]).map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 200px", minWidth: 0, width: "100%" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "#FFF3E0", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {item.icon}
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
        textAlign: "center" as const,
        position: "relative" as const, overflow: "hidden",
      }}>
        <div style={{
          position: "absolute" as const, top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(255,149,0,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
        <div style={{ position: "relative" as const }}>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900,
            color: "#fff", marginBottom: 12,
          }}>
            {t.ctaTitle}
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>
            {t.ctaSub}
          </p>
          <Link href={`/${locale}/start`} style={{
            background: "#FF9500", color: "#fff", border: "none",
            padding: "18px 48px", borderRadius: 14, fontSize: 20, fontWeight: 700,
            textDecoration: "none", display: "inline-block",
            boxShadow: "0 8px 30px rgba(255,149,0,0.4)",
          }}>
            {t.ctaBtn}
          </Link>
          <div style={{ marginTop: 20, fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
            {t.ctaNote}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        padding: "24px", textAlign: "center" as const,
        background: "#111", color: "rgba(255,255,255,0.3)", fontSize: 12,
      }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
          <Link href={`/${locale}/pricing`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "10px 12px", minHeight: 44, display: "inline-flex", alignItems: "center" }}>{t.footerPricing}</Link>
          <Link href={`/${locale}/terms`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "10px 12px", minHeight: 44, display: "inline-flex", alignItems: "center" }}>{t.footerTerms}</Link>
          <Link href={`/${locale}/privacy`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "10px 12px", minHeight: 44, display: "inline-flex", alignItems: "center" }}>{t.footerPrivacy}</Link>
        </div>
        {t.footerCopy}
      </footer>
    </div>
  );
}
