"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { ShoppingBag, Smartphone, RefreshCw, Award } from "lucide-react";
import type { Locale } from "@/lib/i18n";

/* ─── Inline SVG Icons (monoline, stroke #FF9500) ─── */

const ICONS: Record<string, React.ReactNode> = {
  smartphone: <Smartphone size={32} color="#FF9500" strokeWidth={2} />,
  refreshCw: <RefreshCw size={32} color="#FF9500" strokeWidth={2} />,
  award: <Award size={32} color="#FF9500" strokeWidth={2} />,
  package: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19" />
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  ),
  link: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  ),
  shoppingBag: <ShoppingBag size={28} color="#FF9500" strokeWidth={2} />,
};

/* ─── Data ─── */

function getPlans(isZh: boolean) {
  return [
    {
      name: "Free",
      price: 0,
      period: isZh ? "/月" : "/mo",
      subtitle: isZh ? "零成本試水溫" : "Zero cost to start",
      cta: isZh ? "免費開始" : "Start Free",
      ctaStyle: "outline" as const,
      features: isZh
        ? ["10 件商品", "每月 50 單", "FPS + PayMe + AlipayHK", "Mochi 店舖主題", "1 員工帳號（店主）"]
        : ["10 products", "50 orders/mo", "FPS + PayMe + AlipayHK", "Mochi theme", "1 staff account (owner)"],
      noFeatures: isZh
        ? ["WhatsApp 預填訊息", "優惠碼", "訂單匯出", "數據分析"]
        : ["WhatsApp prefill", "Coupons", "Order export", "Analytics"],
      footnote: isZh ? "永久免費・隨時升級" : "Free forever · upgrade anytime",
      bg: "white" as const,
      highlight: false,
    },
    {
      name: "Lite",
      price: 78,
      period: isZh ? "/月" : "/mo",
      subtitle: isZh ? "認真副業首選" : "For growing side hustles",
      cta: isZh ? "立即訂閱" : "Subscribe",
      ctaStyle: "primary" as const,
      badge: isZh ? "最受歡迎" : "Most popular",
      features: isZh
        ? ["50 件商品", "無限訂單", "FPS + PayMe + AlipayHK + 銀行過數", "全部主題（持續更新）", "WhatsApp 預填訊息", "優惠碼", "訂單 CSV 匯出", "基本數據分析", "2 員工帳號"]
        : ["50 products", "Unlimited orders", "FPS + PayMe + AlipayHK + Bank transfer", "All themes (updated)", "WhatsApp prefill", "Coupons", "Order CSV export", "Basic analytics", "2 staff accounts"],
      noFeatures: [] as string[],
      footnote: isZh ? "月繳・隨時取消・0% 平台抽成" : "Monthly · cancel anytime · 0% platform fee",
      bg: "warm" as const,
      highlight: true,
    },
    {
      name: "Pro",
      price: 198,
      period: isZh ? "/月" : "/mo",
      subtitle: isZh ? "全職生意必備" : "For full-time businesses",
      cta: isZh ? "免費試 14 日" : "Try 14 days free",
      ctaStyle: "dark" as const,
      features: isZh
        ? ["無限商品", "無限訂單", "全部收款方式", "全部主題（持續更新）", "WhatsApp 預填訊息", "優惠碼", "訂單 CSV 匯出", "進階數據分析 + 熱賣排行", "棄單挽回", "CRM 客戶庫", "自訂域名（需自備）", "移除 WoWlix branding", "3 員工帳號"]
        : ["Unlimited products", "Unlimited orders", "All payment methods", "All themes (updated)", "WhatsApp prefill", "Coupons", "Order CSV export", "Advanced analytics + bestseller ranking", "Abandoned cart recovery", "CRM customer database", "Custom domain (BYOD)", "Remove WoWlix branding", "3 staff accounts"],
      noFeatures: [] as string[],
      footnote: isZh ? "14 日免費試用・0% 平台抽成" : "14-day free trial · 0% platform fee",
      bg: "dark" as const,
      highlight: false,
    },
  ];
}

function getCompetitors(isZh: boolean) {
  return [
    { name: isZh ? "本地網店平台 A" : "Local Platform A", base: 499, rate: 0.008, color: "#94A3B8" },
    { name: isZh ? "海外網店平台" : "Global Platform", base: 195, rate: 0.02, color: "#94A3B8" },
    { name: isZh ? "本地網店平台 B" : "Local Platform B", base: 374, rate: 0.005, color: "#94A3B8" },
  ];
}

function getScenarios(isZh: boolean) {
  return [
    {
      icon: "smartphone",
      title: isZh ? "啱啱開始" : "Just starting",
      range: isZh ? "每月 10-30 單 / $3K-$8K" : "10-30 orders/mo / $3K-$8K",
      plan: "Free $0",
      desc: isZh ? "零成本開舖，試下市場反應先" : "Zero cost to open shop, test the market first",
      planColor: "#10B981",
    },
    {
      icon: "refreshCw",
      title: isZh ? "開始有回頭客" : "Getting repeat customers",
      range: isZh ? "每月 50-100 單 / $10K-$20K" : "50-100 orders/mo / $10K-$20K",
      plan: "Lite $78",
      desc: isZh ? "$78 = 一晚外賣錢，換走每晚跟單 1 小時" : "$78 = one takeout dinner, saves 1 hour of order management daily",
      planColor: "#FF9500",
    },
    {
      icon: "award",
      title: isZh ? "認真做品牌" : "Building a brand",
      range: isZh ? "每月 120-200 單 / $20K-$30K" : "120-200 orders/mo / $20K-$30K",
      plan: "Pro $198",
      desc: isZh ? "自訂域名 + CRM，唔再比人覺得係 IG 雜嘜檔" : "Custom domain + CRM, look like a real brand",
      planColor: "#1A1A1A",
    },
  ];
}

function getDemos(isZh: boolean) {
  return [
    { name: "Noir", desc: isZh ? "型格街頭風" : "Urban streetwear", gradient: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)", textColor: "#fff", accent: "#FF9500" },
    { name: "Linen", desc: isZh ? "溫暖手感風" : "Warm & natural", gradient: "linear-gradient(135deg, #F5F0EB 0%, #E8DDD3 100%)", textColor: "#3D2E1E", accent: "#8B7355" },
    { name: "Mochi", desc: isZh ? "清新甜美風" : "Fresh & sweet", gradient: "linear-gradient(135deg, #FFF8F0 0%, #FFE8CC 100%)", textColor: "#5C3D00", accent: "#FF9500" },
    { name: "Petal", desc: isZh ? "柔美花漾風" : "Soft & floral", gradient: "linear-gradient(135deg, #FFF0F5 0%, #FFE0EB 100%)", textColor: "#8B2252", accent: "#D4447C" },
  ];
}

function getFaqs(isZh: boolean) {
  return isZh ? [
    { q: "WoWlix 真係 0% 平台抽成？", a: "真係。WoWlix 不收任何交易抽成或隱藏費用。如果你日後使用信用卡收款，支付通道（如 Stripe）會收取標準手續費，但呢個係支付商收嘅，WoWlix 唔會額外加價。而家用 FPS / PayMe / AlipayHK 就真係 0 成本。" },
    { q: "Free Plan 有咩限制？", a: "10 件商品、每月 50 單。夠你試水溫。想上更多款式、要優惠碼同數據分析就升 Lite，$78 搞掂。" },
    { q: "我可以用 PayMe / FPS / AlipayHK 收錢？", a: "可以，Free plan 已經支援。客人結帳時揀付款方式，你後台確認收款就得。" },
    { q: "「棄單挽回」係咩？", a: "當客人落咗單但未付款，Pro plan 會自動整理成列表，你可以一鍵 WhatsApp 提醒佢哋完成付款。呢啲「差少少就買」嘅客人，追返一個就值回 plan 費。" },
    { q: "CRM 客戶庫包咩功能？", a: "記錄每個客人嘅購買紀錄、消費總額、標籤分類（如 VIP / 回頭客）。你可以篩選「買過蛋糕」嘅客人，一鍵匯出名單做推廣。" },
    { q: "同其他網店平台有咩分別？", a: "其他平台功能多但貴（$374-$499/月起步，仲要抽成 0.5-5%）。WoWlix 專做 IG 小店最需要嘅功能，$0 起步、0% 平台抽成。你唔需要 POS、直播、多國貨幣。你需要收錢、發貨、好睇嘅店面。" },
    { q: "我可以隨時取消？生意做大咗點算？", a: "月繳制，隨時取消，冇綁約。生意做大就升 Pro，$198 有 CRM + 自訂域名 + 無限商品。如果有日你需要 POS + 全渠道零售，我哋會幫你順利搬遷，唔鎖你嘅數據。" },
  ] : [
    { q: "Is WoWlix really 0% platform fee?", a: "Yes. WoWlix charges zero transaction fees or hidden costs. If you later use credit card payments, the payment gateway (e.g. Stripe) will charge standard processing fees, but WoWlix adds no extra charges. FPS / PayMe / AlipayHK is truly zero cost." },
    { q: "What are the Free plan limits?", a: "10 products, 50 orders/month. Enough to test the waters. Need more products, coupons, and analytics? Upgrade to Lite for $78." },
    { q: "Can I accept PayMe / FPS / AlipayHK?", a: "Yes, even on the Free plan. Customers select their payment method at checkout, and you confirm payment in the admin panel." },
    { q: "What is 'abandoned cart recovery'?", a: "When a customer places an order but doesn't pay, the Pro plan automatically creates a list so you can WhatsApp remind them to complete payment. Recovering just one customer pays for the plan." },
    { q: "What does the CRM include?", a: "Purchase history, total spending, customer tags (VIP / repeat). You can filter customers who bought specific items and export the list for marketing." },
    { q: "How is WoWlix different from other platforms?", a: "Other platforms are feature-rich but expensive ($374-$499/mo + 0.5-5% fees). WoWlix focuses on what IG shops actually need: $0 to start, 0% platform fee. You don't need POS or live streaming. You need payments, shipping, and a beautiful storefront." },
    { q: "Can I cancel anytime? What if my business grows?", a: "Monthly billing, cancel anytime, no lock-in. As you grow, upgrade to Pro for $198 with CRM + custom domain + unlimited products. If you ever need POS + omnichannel retail, we'll help you migrate smoothly." },
  ];
}

type FeatureRow = {
  name: string;
  free: string | boolean;
  lite: string | boolean;
  pro: string | boolean;
  highlight?: boolean;
};

function getFeatureTable(isZh: boolean): FeatureRow[] {
  return isZh ? [
    { name: "商品數量", free: "10", lite: "50", pro: "無限" },
    { name: "每月訂單", free: "50", lite: "無限", pro: "無限" },
    { name: "收款方式", free: "3 種", lite: "4 種", pro: "全部" },
    { name: "WhatsApp 預填訊息", free: false, lite: true, pro: true },
    { name: "優惠碼", free: false, lite: true, pro: true },
    { name: "棄單挽回", free: false, lite: false, pro: true },
    { name: "CRM 客戶庫", free: false, lite: false, pro: true },
    { name: "自訂域名", free: false, lite: false, pro: true },
    { name: "平台抽成", free: "0%", lite: "0%", pro: "0%", highlight: true },
  ] : [
    { name: "Products", free: "10", lite: "50", pro: "Unlimited" },
    { name: "Orders/month", free: "50", lite: "Unlimited", pro: "Unlimited" },
    { name: "Payment methods", free: "3", lite: "4", pro: "All" },
    { name: "WhatsApp prefill", free: false, lite: true, pro: true },
    { name: "Coupons", free: false, lite: true, pro: true },
    { name: "Abandoned cart recovery", free: false, lite: false, pro: true },
    { name: "CRM", free: false, lite: false, pro: true },
    { name: "Custom domain", free: false, lite: false, pro: true },
    { name: "Platform fee", free: "0%", lite: "0%", pro: "0%", highlight: true },
  ];
}

/* ─── Sub-components ─── */

function AnimatedNumber({ value, duration = 600 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const displayRef = useRef(0);

  useEffect(() => {
    const start = displayRef.current;
    let startTime: number | null = null;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.round(start + (value - start) * eased);
      displayRef.current = val;
      setDisplay(val);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

type Plan = ReturnType<typeof getPlans>[number];

function PlanCard({ plan, isZh }: { plan: Plan; isZh: boolean }) {
  const [hovered, setHovered] = useState(false);

  const bgStyles: Record<string, React.CSSProperties> = {
    white: { background: "#fff", color: "#1A1A1A", border: "1px solid #E5E7EB" },
    warm: {
      background: "linear-gradient(180deg, #FFF8F0 0%, #FFF3E0 100%)",
      color: "#1A1A1A",
      border: "2px solid #FF9500",
    },
    dark: {
      background: "linear-gradient(180deg, #1A1A1A 0%, #111 100%)",
      color: "#fff",
      border: "1px solid #333",
    },
  };
  const ctaStyles: Record<string, React.CSSProperties> = {
    outline: { background: "transparent", color: "#FF9500", border: "2px solid #FF9500" },
    primary: { background: "#FF9500", color: "#fff", border: "2px solid #FF9500" },
    dark: { background: "#fff", color: "#1A1A1A", border: "2px solid #fff" },
  };
  const style = bgStyles[plan.bg];
  const ctaStyle = ctaStyles[plan.ctaStyle];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...style,
        borderRadius: 20,
        padding: "36px 28px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transform: plan.highlight
          ? hovered
            ? "scale(1.05)"
            : "scale(1.03)"
          : hovered
          ? "scale(1.02)"
          : "scale(1)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: plan.highlight
          ? "0 20px 60px rgba(255, 149, 0, 0.15)"
          : hovered
          ? "0 12px 40px rgba(0,0,0,0.1)"
          : "0 4px 20px rgba(0,0,0,0.06)",
        flex: "1 1 280px",
        minWidth: 0,
        maxWidth: 380,
        overflow: "hidden",
      }}
    >
      {plan.badge && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: -32,
            background: "#FF9500",
            color: "#fff",
            padding: "4px 40px",
            fontSize: 12,
            fontWeight: 700,
            transform: "rotate(45deg)",
            letterSpacing: "0.05em",
          }}
        >
          {plan.badge}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 20,
          background: plan.bg === "dark" ? "#333" : "#FFF3E0",
          borderRadius: 20,
          padding: "3px 10px",
          fontSize: 11,
          fontWeight: 600,
          color: "#FF9500",
        }}
      >
        {isZh ? "0% 平台抽成" : "0% platform fee"}
      </div>
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 16, fontWeight: 600, opacity: 0.7, marginBottom: 4 }}>{plan.name}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
          <span style={{ fontSize: 14, opacity: 0.5 }}>$</span>
          <span style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{plan.price}</span>
          <span style={{ fontSize: 16, opacity: 0.5 }}>{plan.period}</span>
        </div>
        <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 24 }}>{plan.subtitle}</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {plan.features.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.5 }}>
            <span style={{ color: "#FF9500", flexShrink: 0, fontSize: 16 }}>✓</span>
            <span>{f}</span>
          </div>
        ))}
        {plan.noFeatures.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.5, opacity: 0.35 }}>
            <span style={{ flexShrink: 0, fontSize: 16 }}>✗</span>
            <span>{f}</span>
          </div>
        ))}
      </div>
      <button
        style={{
          ...ctaStyle,
          padding: "14px 24px",
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.2s",
          width: "100%",
          marginBottom: 12,
          minHeight: 48,
        }}
      >
        {plan.cta}
      </button>
      <div style={{ textAlign: "center", fontSize: 12, opacity: 0.5 }}>{plan.footnote}</div>
    </div>
  );
}

function Calculator({ isZh }: { isZh: boolean }) {
  const [gmv, setGmv] = useState(10000);
  const [usePro, setUsePro] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const COMPETITORS = getCompetitors(isZh);
  const wowlixCost = usePro ? 198 : 78;
  const costs = COMPETITORS.map((c) => ({
    ...c,
    total: c.base + gmv * c.rate,
    isWowlix: false,
  }));
  costs.push({
    name: usePro ? "WoWlix Pro" : "WoWlix Lite",
    base: wowlixCost,
    rate: 0,
    total: wowlixCost,
    color: "#FF9500",
    isWowlix: true,
  });
  costs.sort((a, b) => b.total - a.total);
  const maxCost = Math.max(...costs.map((c) => c.total));
  const mostExpensiveCompetitor = Math.max(...COMPETITORS.map((c) => c.base + gmv * c.rate));
  const saving = mostExpensiveCompetitor - wowlixCost;

  const marks = [5000, 10000, 20000, 30000, 50000];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <label style={{ fontSize: 16, fontWeight: 600, display: "block", marginBottom: 16 }}>
          {isZh ? "你每月大概做幾多生意？" : "How much revenue per month?"}
        </label>
        <div style={{ position: "relative", marginBottom: 8 }}>
          <input
            type="range"
            min={5000}
            max={50000}
            step={1000}
            value={gmv}
            onChange={(e) => setGmv(+e.target.value)}
            style={{ width: "100%", accentColor: "#FF9500", height: 8, cursor: "pointer" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.5 }}>
          {marks.map((m) => (
            <span key={m}>${(m / 1000).toFixed(0)}K</span>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: "#FF9500" }}>
            ${gmv.toLocaleString()}
          </span>
          <span style={{ fontSize: 16, opacity: 0.5 }}>{isZh ? "/月" : "/mo"}</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
        {[false, true].map((v) => (
          <button
            key={String(v)}
            onClick={() => setUsePro(v)}
            style={{
              padding: "10px 20px",
              borderRadius: 20,
              border: "none",
              background: usePro === v ? "#FF9500" : "#F3F4F6",
              color: usePro === v ? "#fff" : "#666",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s",
              minHeight: 44,
            }}
          >
            {v ? (isZh ? "用 Pro 比較" : "Compare Pro") : (isZh ? "用 Lite 比較" : "Compare Lite")}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {costs.map((c) => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 90,
                fontSize: 12,
                fontWeight: c.isWowlix ? 700 : 400,
                color: c.isWowlix ? "#FF9500" : "#666",
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {c.name}
            </div>
            <div
              style={{
                flex: 1,
                position: "relative",
                height: 36,
                background: "#F3F4F6",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(c.total / maxCost) * 100}%`,
                  background: c.isWowlix ? "linear-gradient(90deg, #FF9500, #FFB347)" : c.color,
                  borderRadius: 8,
                  transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: 12,
                  minWidth: 80,
                  position: "relative",
                }}
              >
                {c.isWowlix && (
                  <div
                    style={{
                      position: "absolute",
                      right: -2,
                      top: -2,
                      bottom: -2,
                      width: 4,
                      background: "#FF9500",
                      borderRadius: 2,
                      animation: "pulse 2s infinite",
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 14,
                  fontWeight: 700,
                  color: c.isWowlix ? "#FF9500" : "#374151",
                }}
              >
                ${Math.round(c.total).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 32,
          padding: 24,
          background: "#FFF3E0",
          borderRadius: 16,
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 4 }}>{isZh ? "每月最多慳" : "Max monthly savings"}</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#FF9500" }}>
          $
          <AnimatedNumber value={Math.max(0, Math.round(saving))} />
        </div>
        <div style={{ fontSize: 16, opacity: 0.6, marginTop: 4 }}>
          {isZh ? "一年慳" : "Annual savings"} <strong>${Math.max(0, Math.round(saving * 12)).toLocaleString()}</strong>
        </div>
      </div>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button
          onClick={() => setShowSources(!showSources)}
          style={{
            background: "none",
            border: "none",
            fontSize: 13,
            color: "#999",
            cursor: "pointer",
            textDecoration: "underline",
            minHeight: 44,
            padding: "10px 16px",
          }}
        >
          {showSources ? (isZh ? "收起計算方式及來源 ▴" : "Hide methodology ▴") : (isZh ? "計算方式及來源 ▾" : "Methodology & sources ▾")}
        </button>
        {showSources && (
          <div
            style={{
              marginTop: 12,
              padding: 20,
              background: "#F9FAFB",
              borderRadius: 12,
              fontSize: 13,
              color: "#666",
              textAlign: "left",
              lineHeight: 1.8,
            }}
          >
            <strong>{isZh ? "計算方式：" : "Formula: "}</strong>{isZh ? "月費 + (每月營業額 × 平台抽成率)" : "Monthly fee + (monthly revenue × platform fee rate)"}
            <br />
            <strong>{isZh ? "數據截至 2026 年 2 月，基於各平台官方公開定價頁：" : "Data as of Feb 2026, based on official pricing pages:"}</strong>
            <br />
            {isZh ? "• 本地網店平台 A = SHOPLINE Basic（$499/月 + 0.8% 流量維護費）" : "• Local Platform A = SHOPLINE Basic ($499/mo + 0.8% traffic fee)"}
            <br />
            {isZh ? "• 本地網店平台 B = Boutir Essential（$374/月，年繳月均價）" : "• Local Platform B = Boutir Essential ($374/mo annual avg)"}
            <br />
            {isZh ? "• 海外網店平台 = Shopify Basic（$195/月 + 2% 第三方支付費）" : "• Global Platform = Shopify Basic ($195/mo + 2% third-party payment fee)"}
            <br />
            <span style={{ opacity: 0.5 }}>{isZh ? "* 費用可能因方案、促銷或支付方式而有所不同" : "* Fees may vary by plan, promotion, or payment method"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function FAQ({ isZh }: { isZh: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const FAQS = getFaqs(isZh);
  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {FAQS.map((faq, i) => (
        <div key={i} style={{ borderBottom: "1px solid #E5E7EB" }}>
          <button
            onClick={() => setOpen(prev => prev === i ? null : i)}
            style={{
              width: "100%",
              padding: "16px 0",
              background: "none",
              border: "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 600,
              color: "#1A1A1A",
              textAlign: "left",
              gap: 12,
              minHeight: 48,
            }}
          >
            <span>{faq.q}</span>
            <span
              style={{
                fontSize: 20,
                color: "#FF9500",
                flexShrink: 0,
                transition: "transform 0.2s",
                transform: open === i ? "rotate(45deg)" : "rotate(0)",
              }}
            >
              +
            </span>
          </button>
          <div
            style={{
              maxHeight: open === i ? 1000 : 0,
              overflow: "hidden",
              transition: "max-height 0.4s ease",
            }}
          >
            <div style={{ paddingBottom: 20, fontSize: 15, lineHeight: 1.7, color: "#555" }}>{faq.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Main page ─── */

export default function PricingPage({ locale = "zh-HK" }: { locale?: Locale }) {
  const isZh = locale === "zh-HK";
  const PLANS = getPlans(isZh);
  const SCENARIOS = getScenarios(isZh);
  const DEMOS = getDemos(isZh);
  const FEATURE_TABLE = getFeatureTable(isZh);
  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Noto Sans TC', -apple-system, sans-serif",
        color: "#1A1A1A",
        overflowX: "hidden",
      }}
    >
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,400&family=Noto+Sans+TC:wght@400;500;700;900&display=swap");
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .pricing-page * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        .pricing-page input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: #e5e7eb;
          border-radius: 999px;
          outline: none;
          height: 8px;
          cursor: pointer;
        }
        .pricing-page input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ff9500;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(255, 149, 0, 0.4);
          border: 3px solid #fff;
        }
        .pricing-page input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ff9500;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(255, 149, 0, 0.4);
          border: 3px solid #fff;
        }
        .pricing-page input[type="range"]::-moz-range-track {
          background: #e5e7eb;
          border-radius: 999px;
          height: 8px;
        }
      `}</style>

      {/* NAV */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.85)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Link
          href="/"
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
        <Link
          href={`/${locale}/start`}
          style={{
            background: "#FF9500",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.2s",
            minHeight: 44,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {isZh ? "免費開店" : "Start Free"}
        </Link>
      </nav>

      {/* HERO */}
      <section
        style={{
          padding: "120px 24px 80px",
          textAlign: "center",
          background: "linear-gradient(180deg, #FFF8F0 0%, #FFFFFF 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(255,149,0,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -50,
            left: -50,
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(255,149,0,0.05) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto", animation: "fadeInUp 0.8s ease" }}>
          <div
            style={{
              display: "inline-flex",
              gap: 12,
              marginBottom: 24,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {(isZh ? ["0% 平台抽成", "$0 起", "2 分鐘開店"] : ["0% platform fee", "$0 start", "2-min setup"]).map((badge, i) => (
              <span
                key={i}
                style={{
                  background: i === 0 ? "#FF9500" : "#FFF3E0",
                  color: i === 0 ? "#fff" : "#E68600",
                  padding: "6px 16px",
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {badge}
              </span>
            ))}
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 6vw, 56px)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            {isZh ? "全港最平 IG 網店" : "The most affordable IG shop"}
            <br />
            <span style={{ color: "#FF9500" }}>{isZh ? "開店神器" : "builder in HK"}</span>
          </h1>
          <p style={{ fontSize: 18, color: "#666", maxWidth: 500, margin: "0 auto 32px", lineHeight: 1.6 }}>
            {isZh ? "仲用 Google Form 接單？" : "Still using Google Forms for orders?"}
            <br />
            {isZh ? "WoWlix 幫你慳時間、慳錢、專心賣嘢" : "WoWlix saves you time, money, and lets you focus on selling"}
          </p>
          <Link
            href={`/${locale}/start`}
            style={{
              display: "inline-block",
              background: "#FF9500",
              color: "#fff",
              border: "none",
              padding: "16px 40px",
              borderRadius: 14,
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 30px rgba(255,149,0,0.3)",
              transition: "all 0.2s",
              textDecoration: "none",
            }}
          >
            {isZh ? "免費開店 →" : "Start Free →"}
          </Link>

          {/* 3-Step Mini Flow */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 56 }}>
            {(isZh
              ? [
                  { icon: "package", label: "上貨", desc: "加商品、定價、上圖" },
                  { icon: "link", label: "分享 Link", desc: "放喺 IG Bio" },
                  { icon: "shoppingBag", label: "收單", desc: "客人自助落單付款" },
                ]
              : [
                  { icon: "package", label: "Upload", desc: "Add products, set price, upload images" },
                  { icon: "link", label: "Share Link", desc: "Put in IG Bio" },
                  { icon: "shoppingBag", label: "Get Orders", desc: "Customers self-serve checkout" },
                ]
            ).map((step, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ marginBottom: 8 }}>{ICONS[step.icon]}</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{step.label}</div>
                <div style={{ fontSize: 12, color: "#999" }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLAN CARDS */}
      <section style={{ padding: "80px 24px", background: "#FAFAFA" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, marginBottom: 8 }}>
              {isZh ? "揀個啱你嘅 Plan" : "Pick the right plan"}
            </h2>
            <p style={{ color: "#888", fontSize: 16 }}>{isZh ? "全部 plan 0% 平台抽成・月繳無綁約" : "All plans 0% platform fee · monthly, no lock-in"}</p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 20,
              justifyContent: "center",
              alignItems: "stretch",
              flexWrap: "wrap",
            }}
          >
            {PLANS.map((plan, i) => (
              <PlanCard key={i} plan={plan} isZh={isZh} />
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: "#999", marginTop: 24 }}>
            {isZh
              ? "* WoWlix 不收平台抽成。如使用信用卡等第三方支付，需支付通道手續費（由支付商收取，WoWlix 不額外加價）。"
              : "* WoWlix charges no platform fees. Third-party payment gateway fees (e.g. Stripe) are charged by the provider, not WoWlix."}
          </p>
        </div>
      </section>

      {/* SAVINGS CALCULATOR */}
      <section className="pricing-page" style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>
              {isZh ? "你每月可以慳幾多？" : "How much can you save?"}
            </h2>
            <p style={{ color: "#888", fontSize: 16 }}>{isZh ? "拉下 Slider，睇下用其他平台你實際要畀幾多" : "Drag the slider to compare actual costs on other platforms"}</p>
          </div>
          <Calculator isZh={isZh} />
        </div>
      </section>

      {/* SCENARIO CARDS */}
      <section style={{ padding: "80px 24px", background: "#FAFAFA" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>
              {isZh ? "邊個 Plan 啱你？" : "Which plan is right for you?"}
            </h2>
            <p style={{ color: "#888", fontSize: 16 }}>{isZh ? "搵到你嘅階段，即刻開始" : "Find your stage and get started"}</p>
          </div>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {SCENARIOS.map((s, i) => (
              <div
                key={i}
                style={{
                  flex: "1 1 260px",
                  maxWidth: 320,
                  background: "#fff",
                  borderRadius: 20,
                  padding: "32px 24px",
                  border: "1px solid #E5E7EB",
                  transition: "all 0.3s",
                  cursor: "default",
                }}
              >
                <div style={{ marginBottom: 12 }}>{ICONS[s.icon]}</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{s.title}</h3>
                <div style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>{s.range}</div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "6px 14px",
                    borderRadius: 20,
                    background:
                      s.planColor === "#1A1A1A"
                        ? "#1A1A1A"
                        : s.planColor === "#FF9500"
                        ? "#FFF3E0"
                        : "#ECFDF5",
                    color:
                      s.planColor === "#1A1A1A"
                        ? "#fff"
                        : s.planColor === "#FF9500"
                        ? "#E68600"
                        : "#059669",
                    fontSize: 14,
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  {s.plan}
                </div>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>
              {isZh ? "4 款精選主題" : "4 curated themes"}
            </h2>
            <p style={{ color: "#888", fontSize: 16 }}>{isZh ? "每間店都有自己嘅風格" : "Every shop has its own style"}</p>
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {DEMOS.map((d, i) => (
              <div
                key={i}
                style={{
                  flex: "1 1 150px",
                  maxWidth: 220,
                  minWidth: 150,
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "all 0.3s",
                  border: "1px solid #E5E7EB",
                }}
              >
                <div
                  style={{
                    height: 280,
                    background: d.gradient,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: d.accent,
                      opacity: 0.2,
                      marginBottom: 12,
                    }}
                  />
                  <div style={{ fontSize: 18, fontWeight: 800, color: d.textColor, marginBottom: 4 }}>
                    {d.name}
                  </div>
                  <div style={{ fontSize: 11, color: d.textColor, opacity: 0.6, marginBottom: 16 }}>
                    @{d.name.toLowerCase()}shop
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[1, 2].map((n) => (
                      <div
                        key={n}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          background:
                            d.textColor === "#fff"
                              ? "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)"
                              : `linear-gradient(135deg, ${d.accent}18 0%, ${d.accent}08 100%)`,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      padding: "6px 16px",
                      borderRadius: 6,
                      background: d.accent,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                    }}
                  >
                    Shop Now
                  </div>
                </div>
                <div style={{ padding: "16px 16px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: "#999" }}>{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE TABLE */}
      <section style={{ padding: "80px 24px", background: "#FAFAFA" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>{isZh ? "功能一覽" : "Feature comparison"}</h2>
          </div>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid #E5E7EB",
              minWidth: 480,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
                padding: "16px 24px",
                background: "#F9FAFB",
                borderBottom: "1px solid #E5E7EB",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <div></div>
              <div style={{ textAlign: "center" }}>Free</div>
              <div style={{ textAlign: "center", color: "#FF9500" }}>Lite $78</div>
              <div style={{ textAlign: "center" }}>Pro $198</div>
            </div>
            {/* Rows */}
            {FEATURE_TABLE.map((row, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
                  padding: "14px 24px",
                  borderBottom: i < FEATURE_TABLE.length - 1 ? "1px solid #F3F4F6" : "none",
                  background: row.highlight ? "#FFF3E0" : "transparent",
                  fontSize: 14,
                  alignItems: "center",
                }}
              >
                <div style={{ fontWeight: row.highlight ? 700 : 500 }}>{row.name}</div>
                {(["free", "lite", "pro"] as const).map((plan) => (
                  <div key={plan} style={{ textAlign: "center" }}>
                    {typeof row[plan] === "boolean" ? (
                      row[plan] ? (
                        <span style={{ color: "#FF9500", fontSize: 18 }}>✓</span>
                      ) : (
                        <span style={{ color: "#D1D5DB", fontSize: 18 }}>✗</span>
                      )
                    ) : (
                      <span
                        style={{
                          fontWeight: row.highlight ? 700 : 400,
                          color: row.highlight ? "#FF9500" : "inherit",
                        }}
                      >
                        {row[plan]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "80px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, marginBottom: 8 }}>{isZh ? "常見問題" : "FAQ"}</h2>
          </div>
          <FAQ isZh={isZh} />
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        style={{
          padding: "80px 24px",
          background: "linear-gradient(180deg, #1A1A1A 0%, #111 100%)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(255,149,0,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div style={{ position: "relative" }}>
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 900,
              color: "#fff",
              marginBottom: 12,
            }}
          >
            {isZh ? "仲用 Google Form 接單？" : "Still using Google Forms?"}
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>
            {isZh ? "2 分鐘開店・0% 平台抽成・$0 起步" : "2-min setup · 0% platform fee · $0 to start"}
          </p>
          <Link
            href={`/${locale}/start`}
            style={{
              display: "inline-block",
              background: "#FF9500",
              color: "#fff",
              border: "none",
              padding: "18px 48px",
              borderRadius: 14,
              fontSize: 20,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 30px rgba(255,149,0,0.4)",
              textDecoration: "none",
            }}
          >
            {isZh ? "免費開店 →" : "Start Free →"}
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        padding: "24px", textAlign: "center",
        background: "#111", color: "rgba(255,255,255,0.3)", fontSize: 12,
      }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
          <Link href={`/${locale}`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "10px 12px", minHeight: 44, display: "inline-flex", alignItems: "center" }}>
            {isZh ? "首頁" : "Home"}
          </Link>
          <Link href={`/${locale}/terms`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "10px 12px", minHeight: 44, display: "inline-flex", alignItems: "center" }}>
            {isZh ? "條款" : "Terms"}
          </Link>
          <Link href={`/${locale}/privacy`} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "10px 12px", minHeight: 44, display: "inline-flex", alignItems: "center" }}>
            {isZh ? "私隱" : "Privacy"}
          </Link>
        </div>
        © 2026 WoWlix by Flow Studio HK
      </footer>
    </div>
  );
}
