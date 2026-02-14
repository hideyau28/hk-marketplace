"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { Locale } from "@/lib/i18n";

const T = {
  "zh-HK": {
    navPricing: "定價",
    navCta: "免費開店",
    heroBadge: "為香港小店而設",
    heroH1a: "粉絲即刻",
    heroH1b: "客人",
    heroH1prefix: "變",
    heroSub1: "Instagram 小店嘅最強武器。",
    heroSub2: "2 分鐘開店，一條連結搞掂所有嘢。",
    ctaPrimary: "免費開店",
    ctaGhost: "了解更多",
    stat1num: "2分鐘",
    stat1label: "開店時間",
    stat2label: "免費開始",
    stat3label: "手機操作",
    miniStoreName: "烏龍茶小店",
    miniStoreDesc: "手工烏龍茶 · 觀塘",
    miniP1: "高山烏龍茶",
    miniP2: "鐵觀音",
    miniP3: "茶壺套裝",
    miniP4: "禮盒裝",
    miniBtn: "加入購物車",
    float1: "🛒 新訂單！",
    float2: "📊 今日 128 瀏覽",
    float3: "💰 +$1,280",
    featLabel: "點解揀 WoWlix",
    featTitle1: "為香港小店",
    featTitle2: "度身訂造",
    feat1t: "2 分鐘開店",
    feat1d: "唔使識寫 code，填個名揀個風格，你嘅店就開好。",
    feat2t: "手機全操作",
    feat2d: "加貨、改價、睇單，全部喺手機搞掂。",
    feat3t: "靚到想 Screenshot",
    feat3d: "唔係 90 年代網店。你嘅店靚到客人會 share。",
    feat4t: "WhatsApp 整合",
    feat4d: "客人一 tap 就 WhatsApp 你。唔使來回 DM。",
    feat5t: "數據話你知",
    feat5d: "幾多人睇、幾多人買、邊件最旺，一目了然。",
    feat6t: "香港製造",
    feat6d: "我哋明白香港小店嘅需要。繁體中文、港幣、順豐。",
    pricingLabel: "定價",
    pricingTitle: "簡單透明",
    pricingDesc: "由免費開始，做大咗再升級。年繳送 2 個月。",
    planFree: "Free",
    planFreeDesc: "IG 小店入門",
    planFreePeriod: "/永久免費",
    planFreeF1: "最多 15 件商品",
    planFreeF2: "IG 購物連結頁面",
    planFreeF3: "手機管理",
    planFreeF4: "WhatsApp 落單",
    planFreeCta: "免費開始",
    planLite: "Lite",
    planLiteDesc: "成長中嘅小店",
    planLiteBadge: "最受歡迎",
    planLitePeriod: "/月",
    planLiteF1: "最多 50 件商品",
    planLiteF2: "Free 全部功能",
    planLiteF3: "購物車 + 線上結帳",
    planLiteF4: "訂單管理",
    planLiteF5: "基本數據分析",
    planLiteCta: "開始 14 日免費試用",
    planPro: "Pro",
    planProDesc: "專業小店",
    planProPeriod: "/月",
    planProF1: "無限商品",
    planProF2: "Lite 全部功能",
    planProF3: "進階數據分析",
    planProF4: "自訂封面同色調",
    planProF5: "優先支援",
    planProCta: "開始 14 日免費試用",
    proofLabel: "使用情境",
    proofTitle: "佢哋點用",
    proof1q: "「IG bio 放一條連結，客人自己揀款式落單。唔使再逐個 DM 報價。」",
    proof1name: "波鞋小店",
    proof1role: "IG 代購 · 旺角",
    proof2q: "「朝早加好貨，晏晝已經有單。用手機搞掂晒，唔使開電腦。」",
    proof2name: "手工飾品",
    proof2role: "IG 手作 · 深水埗",
    proof3q: "「客人話個頁面好靚，好似大品牌嘅網站。其實我用 2 分鐘開嘅。」",
    proof3name: "烘焙甜品",
    proof3role: "IG 接單 · 荃灣",
    faqLabel: "常見問題",
    faq1q: "免費版有咩限制？",
    faq1a: "免費版可以上架最多 15 件商品，包含 IG 購物連結頁面、WhatsApp 落單、手機管理。永久免費，唔使信用卡。",
    faq2q: "我可以之後升級嗎？",
    faq2a: "可以。隨時升級，所有商品同設定都會保留。升級即刻生效。",
    faq3q: "支援咩付款方式？",
    faq3a: "Free 用 WhatsApp 接單（面交 / 轉數快）。Lite 同 Pro 支援購物車 + 線上結帳。Full Store 推出後會支援信用卡收款。",
    faq4q: "可以用自己嘅 domain 嗎？",
    faq4a: "可以。Pro plan 支援自訂 domain（例如 shop.yourname.com）。",
    faq5q: "我用緊其他平台，點搬過嚟？",
    faq5a: "支援 CSV 批量匯入商品。如果需要幫手搬遷，我哋可以協助。",
    ctaTitle: "準備好開始？",
    ctaDesc: "免費開店，唔使信用卡。",
    footerAbout: "關於我們",
    footerPrivacy: "私隱政策",
    footerTerms: "使用條款",
  },
  en: {
    navPricing: "Pricing",
    navCta: "Start Free",
    heroBadge: "Built for HK small shops",
    heroH1a: "Turn followers",
    heroH1b: "customers",
    heroH1prefix: "into ",
    heroSub1: "The ultimate tool for Instagram shops.",
    heroSub2: "Set up in 2 minutes. One link for everything.",
    ctaPrimary: "Start Free",
    ctaGhost: "Learn more",
    stat1num: "2 min",
    stat1label: "Setup time",
    stat2label: "Start free",
    stat3label: "Mobile first",
    miniStoreName: "Oolong Tea Shop",
    miniStoreDesc: "Hand-crafted oolong · Kwun Tong",
    miniP1: "Alpine Oolong",
    miniP2: "Tieguanyin",
    miniP3: "Teapot Set",
    miniP4: "Gift Box",
    miniBtn: "Add to cart",
    float1: "🛒 New order!",
    float2: "📊 128 views today",
    float3: "💰 +$1,280",
    featLabel: "Why WoWlix",
    featTitle1: "Tailor-made for",
    featTitle2: "HK small shops",
    feat1t: "2-min setup",
    feat1d: "No coding. Just fill in your name, pick a style, and your shop is ready.",
    feat2t: "Mobile-first",
    feat2d: "Add products, change prices, check orders — all from your phone.",
    feat3t: "Beautiful design",
    feat3d: "Not a 90s website. Your shop looks so good customers will share it.",
    feat4t: "WhatsApp integration",
    feat4d: "Customers tap to WhatsApp you. No more back-and-forth DMs.",
    feat5t: "Data insights",
    feat5d: "Views, sales, top sellers — all at a glance.",
    feat6t: "Made in Hong Kong",
    feat6d: "We understand HK shops. Traditional Chinese, HKD, SF Express.",
    pricingLabel: "Pricing",
    pricingTitle: "Simple & transparent",
    pricingDesc: "Start free, upgrade as you grow. Annual billing saves 2 months.",
    planFree: "Free",
    planFreeDesc: "IG shop starter",
    planFreePeriod: "/forever free",
    planFreeF1: "Up to 15 products",
    planFreeF2: "IG shopping link page",
    planFreeF3: "Mobile management",
    planFreeF4: "WhatsApp orders",
    planFreeCta: "Start Free",
    planLite: "Lite",
    planLiteDesc: "Growing shops",
    planLiteBadge: "Most popular",
    planLitePeriod: "/mo",
    planLiteF1: "Up to 50 products",
    planLiteF2: "All Free features",
    planLiteF3: "Cart + online checkout",
    planLiteF4: "Order management",
    planLiteF5: "Basic analytics",
    planLiteCta: "Start 14-day free trial",
    planPro: "Pro",
    planProDesc: "Professional shops",
    planProPeriod: "/mo",
    planProF1: "Unlimited products",
    planProF2: "All Lite features",
    planProF3: "Advanced analytics",
    planProF4: "Custom cover & theme",
    planProF5: "Priority support",
    planProCta: "Start 14-day free trial",
    proofLabel: "Use cases",
    proofTitle: "How they use it",
    proof1q: '"I put one link in my IG bio and customers pick styles and order themselves. No more quoting in DMs."',
    proof1name: "Sneaker Shop",
    proof1role: "IG reseller · Mong Kok",
    proof2q: '"I upload products in the morning, get orders by afternoon. All from my phone."',
    proof2name: "Handmade Jewelry",
    proof2role: "IG maker · Sham Shui Po",
    proof3q: '"Customers say my page looks like a big brand\'s site. I set it up in 2 minutes."',
    proof3name: "Baking & Desserts",
    proof3role: "IG orders · Tsuen Wan",
    faqLabel: "FAQ",
    faq1q: "What are the Free plan limits?",
    faq1a: "Up to 15 products with IG shopping link page, WhatsApp orders, and mobile management. Free forever, no credit card required.",
    faq2q: "Can I upgrade later?",
    faq2a: "Yes. Upgrade anytime — all products and settings are preserved. Effective immediately.",
    faq3q: "What payment methods are supported?",
    faq3a: "Free plan uses WhatsApp orders (meetup / FPS). Lite and Pro support cart + online checkout. Credit card payments coming soon.",
    faq4q: "Can I use my own domain?",
    faq4a: "Yes. Pro plan supports custom domains (e.g. shop.yourname.com).",
    faq5q: "How do I migrate from another platform?",
    faq5a: "CSV bulk import is supported. We can also help with migration if needed.",
    ctaTitle: "Ready to start?",
    ctaDesc: "Start your shop free. No credit card needed.",
    footerAbout: "About",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
  },
};

export default function LandingPage({ locale = "zh-HK" }: { locale?: Locale }) {
  const t = T[locale] || T["en"];
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleFaq = (e: React.MouseEvent<HTMLDivElement>) => {
    const faqItem = e.currentTarget.parentElement;
    faqItem?.classList.toggle("open");
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --orange: #ff9500;
          --orange-dark: #e68600;
          --orange-light: #fff3e0;
          --orange-glow: rgba(255, 149, 0, 0.15);
          --black: #0a0a0a;
          --white: #fafafa;
          --gray-100: #f5f5f5;
          --gray-200: #e8e8e8;
          --gray-400: #999;
          --gray-600: #666;
          --gray-800: #333;
          --radius: 20px;
          --radius-sm: 12px;
          --radius-xs: 8px;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
          overflow-x: hidden;
        }

        body {
          font-family: "Outfit", "Noto Sans TC", sans-serif;
          background: var(--black);
          color: var(--white);
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        body::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 9999;
        }

        .ambient-glow {
          position: fixed;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          filter: blur(150px);
          opacity: 0.12;
          pointer-events: none;
          z-index: 0;
        }
        .glow-1 {
          background: var(--orange);
          top: -200px;
          right: -100px;
        }
        .glow-2 {
          background: #ff6b00;
          bottom: 30%;
          left: -200px;
          opacity: 0.08;
        }

        nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 20px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          backdrop-filter: blur(20px);
          background: rgba(10, 10, 10, 0.7);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s;
        }

        .nav-logo {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-logo span {
          color: var(--orange);
        }
        .nav-logo .brand-text {
          color: var(--white);
        }
        .nav-logo .brand-text span {
          color: var(--orange);
        }
        .nav-logo .spark {
          display: inline-block;
          font-size: 18px;
          animation: sparkle 2s ease-in-out infinite;
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2) rotate(15deg);
          }
        }

        .nav-cta {
          background: var(--orange);
          color: var(--black);
          border: none;
          padding: 12px 28px;
          border-radius: 100px;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
        }
        .nav-cta:hover {
          background: var(--white);
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(255, 149, 0, 0.3);
        }

        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 120px 40px 80px;
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .hero-text {
          position: relative;
          z-index: 2;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 149, 0, 0.1);
          border: 1px solid rgba(255, 149, 0, 0.25);
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          color: var(--orange);
          margin-bottom: 32px;
          animation: fadeUp 0.8s ease-out;
        }

        .hero-badge .dot {
          width: 6px;
          height: 6px;
          background: var(--orange);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        .hero h1 {
          font-size: clamp(42px, 6vw, 72px);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -2px;
          margin-bottom: 24px;
          animation: fadeUp 0.8s ease-out 0.1s both;
        }

        .hero h1 .highlight {
          background: linear-gradient(135deg, var(--orange), #ffb84d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 20px;
          line-height: 1.6;
          color: var(--gray-400);
          max-width: 480px;
          margin-bottom: 40px;
          font-weight: 300;
          animation: fadeUp 0.8s ease-out 0.2s both;
        }

        .hero-cta-group {
          display: flex;
          gap: 16px;
          align-items: center;
          animation: fadeUp 0.8s ease-out 0.3s both;
        }

        .btn-primary {
          background: var(--orange);
          color: var(--black);
          padding: 18px 40px;
          border-radius: 100px;
          font-size: 17px;
          font-weight: 700;
          text-decoration: none;
          font-family: inherit;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(255, 149, 0, 0.4);
        }
        .btn-primary .arrow {
          transition: transform 0.3s;
        }
        .btn-primary:hover .arrow {
          transform: translateX(4px);
        }

        .btn-ghost {
          color: var(--gray-400);
          padding: 18px 28px;
          font-size: 16px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.3s;
          cursor: pointer;
        }
        .btn-ghost:hover {
          color: var(--white);
        }

        .hero-stat {
          display: flex;
          gap: 40px;
          margin-top: 56px;
          animation: fadeUp 0.8s ease-out 0.4s both;
        }
        .hero-stat-item .num {
          font-size: 28px;
          font-weight: 800;
          color: var(--orange);
          font-family: "Space Mono", monospace;
        }
        .hero-stat-item .label {
          font-size: 13px;
          color: var(--gray-600);
          margin-top: 4px;
        }

        .hero-phone {
          position: relative;
          display: flex;
          justify-content: center;
          animation: fadeUp 1s ease-out 0.3s both;
        }

        .phone-frame {
          width: 300px;
          height: 620px;
          background: #1a1a1a;
          border-radius: 40px;
          border: 3px solid #333;
          overflow: hidden;
          position: relative;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.05),
            0 40px 80px rgba(0, 0, 0, 0.5),
            0 0 120px rgba(255, 149, 0, 0.08);
          transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
          transition: transform 0.5s;
        }
        .phone-frame:hover {
          transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
        }

        .phone-notch {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 28px;
          background: #1a1a1a;
          border-radius: 0 0 20px 20px;
          z-index: 10;
        }

        .phone-screen {
          width: 100%;
          height: 100%;
          background: var(--white);
          overflow-y: auto;
          scrollbar-width: none;
        }
        .phone-screen::-webkit-scrollbar {
          display: none;
        }

        .mini-store {
          padding: 0;
          color: var(--black);
        }
        .mini-cover {
          height: 100px;
          background: linear-gradient(135deg, #ff9500, #ff6b00, #ff9500);
          position: relative;
        }
        .mini-avatar {
          width: 56px;
          height: 56px;
          background: var(--white);
          border-radius: 50%;
          border: 3px solid var(--white);
          position: absolute;
          bottom: -28px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .mini-info {
          text-align: center;
          padding: 36px 16px 12px;
        }
        .mini-info h3 {
          font-size: 15px;
          font-weight: 700;
          color: var(--black);
        }
        .mini-info p {
          font-size: 11px;
          color: var(--gray-600);
          margin-top: 4px;
        }
        .mini-products {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 12px;
        }
        .mini-product {
          background: var(--gray-100);
          border-radius: 12px;
          overflow: hidden;
        }
        .mini-product-img {
          width: 100%;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }
        .mini-product-img.orange {
          background: linear-gradient(135deg, #fff3e0, #ffe0b2);
        }
        .mini-product-img.blue {
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
        }
        .mini-product-img.pink {
          background: linear-gradient(135deg, #fce4ec, #f8bbd0);
        }
        .mini-product-img.green {
          background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
        }
        .mini-product-info {
          padding: 8px 10px;
        }
        .mini-product-info .name {
          font-size: 11px;
          font-weight: 600;
          color: var(--black);
          line-height: 1.3;
        }
        .mini-product-info .price {
          font-size: 12px;
          font-weight: 700;
          color: var(--orange);
          margin-top: 2px;
          font-family: "Space Mono", monospace;
        }
        .mini-product-btn {
          margin: 4px 10px 10px;
          background: var(--orange);
          color: white;
          border: none;
          width: calc(100% - 20px);
          padding: 6px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
        }

        .phone-float {
          position: absolute;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          font-size: 13px;
          font-weight: 500;
          animation: float 4s ease-in-out infinite;
          white-space: nowrap;
        }
        .float-1 {
          top: 15%;
          right: -60px;
          animation-delay: 0s;
        }
        .float-2 {
          bottom: 30%;
          left: -80px;
          animation-delay: 1.5s;
        }
        .float-3 {
          top: 40%;
          right: -90px;
          animation-delay: 0.8s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        section {
          position: relative;
          z-index: 1;
        }
        .section-pad {
          padding: 120px 40px;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: var(--orange);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 20px;
          font-family: "Space Mono", monospace;
        }
        .section-label::before {
          content: "";
          display: block;
          width: 24px;
          height: 2px;
          background: var(--orange);
        }

        .section-title {
          font-size: clamp(32px, 4.5vw, 52px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
        }

        .section-desc {
          font-size: 18px;
          color: var(--gray-400);
          max-width: 560px;
          line-height: 1.6;
          font-weight: 300;
        }

        .features {
          background: var(--black);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 60px;
        }

        .feature-card {
          background: #161616;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius);
          padding: 36px 32px;
          transition: all 0.3s;
        }
        .feature-card:hover {
          border-color: rgba(255, 149, 0, 0.15);
          background: #1a1a1a;
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 149, 0, 0.1);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          margin-bottom: 20px;
        }

        .feature-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .feature-card p {
          font-size: 14px;
          color: var(--gray-400);
          line-height: 1.6;
        }

        .pricing {
          background: #0f0f0f;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 60px;
        }

        .price-card {
          background: #161616;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius);
          padding: 40px 32px;
          position: relative;
          transition: all 0.3s;
        }
        .price-card:hover {
          transform: translateY(-4px);
        }

        .price-card.popular {
          border-color: var(--orange);
          background: linear-gradient(
            180deg,
            rgba(255, 149, 0, 0.06) 0%,
            #161616 50%
          );
        }

        .price-popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--orange);
          color: var(--black);
          font-size: 12px;
          font-weight: 700;
          padding: 4px 16px;
          border-radius: 100px;
          white-space: nowrap;
        }

        .price-name {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .price-desc {
          font-size: 13px;
          color: var(--gray-400);
          margin-bottom: 24px;
        }

        .price-amount {
          font-family: "Space Mono", monospace;
          margin-bottom: 28px;
        }
        .price-amount .currency {
          font-size: 16px;
          color: var(--gray-400);
          vertical-align: top;
        }
        .price-amount .number {
          font-size: 48px;
          font-weight: 700;
          letter-spacing: -2px;
        }
        .price-amount .period {
          font-size: 14px;
          color: var(--gray-400);
        }

        .price-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }
        .price-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: var(--gray-200);
        }
        .price-features .check {
          color: var(--orange);
          font-size: 14px;
        }

        .price-cta {
          width: 100%;
          padding: 14px;
          border-radius: 100px;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          text-decoration: none;
          display: block;
          text-align: center;
        }
        .price-cta.fill {
          background: var(--orange);
          color: var(--black);
        }
        .price-cta.fill:hover {
          box-shadow: 0 8px 30px rgba(255, 149, 0, 0.3);
        }
        .price-cta.outline {
          background: transparent;
          color: var(--white);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .price-cta.outline:hover {
          border-color: var(--orange);
          color: var(--orange);
        }

        .social-proof {
          background: var(--black);
        }

        .proof-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 60px;
        }

        .proof-card {
          background: #161616;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius);
          padding: 32px;
        }

        .proof-card .quote {
          font-size: 15px;
          line-height: 1.7;
          color: var(--gray-200);
          margin-bottom: 20px;
          font-style: italic;
        }

        .proof-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .proof-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .proof-avatar.a {
          background: linear-gradient(135deg, #ffe0b2, #ffcc80);
        }
        .proof-avatar.b {
          background: linear-gradient(135deg, #b2dfdb, #80cbc4);
        }
        .proof-avatar.c {
          background: linear-gradient(135deg, #f8bbd0, #f48fb1);
        }
        .proof-name {
          font-size: 14px;
          font-weight: 600;
        }
        .proof-role {
          font-size: 12px;
          color: var(--gray-400);
        }

        .faq {
          background: #0f0f0f;
        }

        .faq-list {
          max-width: 720px;
          margin: 60px auto 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          background: #161616;
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-sm);
          overflow: hidden;
          transition: border-color 0.3s;
        }
        .faq-item:hover {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .faq-q {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          user-select: none;
        }
        .faq-q .icon {
          font-size: 20px;
          color: var(--orange);
          transition: transform 0.3s;
        }
        .faq-item.open .faq-q .icon {
          transform: rotate(45deg);
        }

        .faq-a {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease;
        }
        .faq-item.open .faq-a {
          max-height: 200px;
        }

        .faq-a-inner {
          padding: 0 24px 20px;
          font-size: 14px;
          color: var(--gray-400);
          line-height: 1.7;
        }

        .cta-final {
          background: var(--black);
          text-align: center;
          padding: 120px 40px;
          position: relative;
          overflow: hidden;
        }

        .cta-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: var(--orange);
          border-radius: 50%;
          filter: blur(200px);
          opacity: 0.1;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .cta-final h2 {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 900;
          letter-spacing: -2px;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .cta-final p {
          font-size: 18px;
          color: var(--gray-400);
          margin-bottom: 40px;
          position: relative;
          z-index: 1;
        }

        footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-brand {
          font-size: 18px;
          font-weight: 700;
        }
        .footer-brand span {
          color: var(--orange);
        }

        .footer-links {
          display: flex;
          gap: 28px;
        }
        .footer-links a {
          color: var(--gray-400);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
        }
        .footer-links a:hover {
          color: var(--white);
        }

        .footer-copy {
          font-size: 13px;
          color: var(--gray-600);
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          nav {
            padding: 16px 20px;
          }
          .nav-cta {
            padding: 10px 20px;
            font-size: 14px;
          }

          .hero {
            padding: 100px 20px 60px;
          }
          .hero-content {
            grid-template-columns: 1fr;
            gap: 48px;
            text-align: center;
          }
          .hero-subtitle {
            margin: 0 auto 32px;
          }
          .hero-cta-group {
            justify-content: center;
            flex-wrap: wrap;
          }
          .hero-stat {
            justify-content: center;
          }
          .hero-phone {
            order: -1;
          }

          .phone-frame {
            width: 240px;
            height: 500px;
            transform: none;
          }
          .phone-float {
            display: none;
          }

          .section-pad {
            padding: 80px 20px;
          }

          .features-grid,
          .pricing-grid,
          .proof-grid {
            grid-template-columns: 1fr;
          }

          footer {
            flex-direction: column;
            gap: 20px;
            text-align: center;
            padding: 40px 20px;
          }
        }
      `}</style>

      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>

      <nav>
        <div className="nav-logo">
          <span className="spark">✦</span>
          <span className="brand-text">
            <span>W</span>o<span>W</span>lix
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href={`/${locale}/pricing`} style={{ color: "var(--gray-400)", textDecoration: "none", fontSize: "15px", fontWeight: 500, transition: "color 0.3s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--white)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--gray-400)"; }}
          >
            {t.navPricing}
          </Link>
          <Link href={`/${locale}/start`} className="nav-cta">
            {t.navCta}
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="dot"></span>
              {t.heroBadge}
            </div>
            <h1>
              {t.heroH1a}
              <br />
              {t.heroH1prefix}<span className="highlight">{t.heroH1b}</span>
            </h1>
            <p className="hero-subtitle">
              {t.heroSub1}
              <br />{t.heroSub2}
            </p>
            <div className="hero-cta-group">
              <Link href={`/${locale}/start`} className="btn-primary">
                {t.ctaPrimary} <span className="arrow">→</span>
              </Link>
              <a href="#features" className="btn-ghost">
                {t.ctaGhost}
              </a>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-item">
                <div className="num">{t.stat1num}</div>
                <div className="label">{t.stat1label}</div>
              </div>
              <div className="hero-stat-item">
                <div className="num">$0</div>
                <div className="label">{t.stat2label}</div>
              </div>
              <div className="hero-stat-item">
                <div className="num">100%</div>
                <div className="label">{t.stat3label}</div>
              </div>
            </div>
          </div>

          <div className="hero-phone">
            <div className="phone-frame">
              <div className="phone-notch"></div>
              <div className="phone-screen">
                <div className="mini-store">
                  <div className="mini-cover">
                    <div className="mini-avatar">🍵</div>
                  </div>
                  <div className="mini-info">
                    <h3>{t.miniStoreName}</h3>
                    <p>{t.miniStoreDesc}</p>
                  </div>
                  <div className="mini-products">
                    <div className="mini-product">
                      <div className="mini-product-img orange">🍵</div>
                      <div className="mini-product-info">
                        <div className="name">{t.miniP1}</div>
                        <div className="price">$128</div>
                      </div>
                      <button className="mini-product-btn">{t.miniBtn}</button>
                    </div>
                    <div className="mini-product">
                      <div className="mini-product-img green">🌿</div>
                      <div className="mini-product-info">
                        <div className="name">{t.miniP2}</div>
                        <div className="price">$98</div>
                      </div>
                      <button className="mini-product-btn">{t.miniBtn}</button>
                    </div>
                    <div className="mini-product">
                      <div className="mini-product-img blue">🫖</div>
                      <div className="mini-product-info">
                        <div className="name">{t.miniP3}</div>
                        <div className="price">$380</div>
                      </div>
                      <button className="mini-product-btn">{t.miniBtn}</button>
                    </div>
                    <div className="mini-product">
                      <div className="mini-product-img pink">🎁</div>
                      <div className="mini-product-info">
                        <div className="name">{t.miniP4}</div>
                        <div className="price">$268</div>
                      </div>
                      <button className="mini-product-btn">{t.miniBtn}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="phone-float float-1">{t.float1}</div>
            <div className="phone-float float-2">{t.float2}</div>
            <div className="phone-float float-3">{t.float3}</div>
          </div>
        </div>
      </section>

      <section className="features section-pad" id="features">
        <div className="container">
          <div className="section-label reveal">{t.featLabel}</div>
          <h2 className="section-title reveal">
            {t.featTitle1}
            <br />
            {t.featTitle2}
          </h2>
          <div className="features-grid">
            <div className="feature-card reveal">
              <div className="feature-icon">⚡</div>
              <h3>{t.feat1t}</h3>
              <p>{t.feat1d}</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon">📱</div>
              <h3>{t.feat2t}</h3>
              <p>{t.feat2d}</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon">🎨</div>
              <h3>{t.feat3t}</h3>
              <p>{t.feat3d}</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon">💬</div>
              <h3>{t.feat4t}</h3>
              <p>{t.feat4d}</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon">📊</div>
              <h3>{t.feat5t}</h3>
              <p>{t.feat5d}</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon">🇭🇰</div>
              <h3>{t.feat6t}</h3>
              <p>{t.feat6d}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing section-pad" id="pricing">
        <div className="container">
          <div className="section-label reveal">{t.pricingLabel}</div>
          <h2 className="section-title reveal">{t.pricingTitle}</h2>
          <p className="section-desc reveal">
            {t.pricingDesc}
          </p>

          <div className="pricing-grid">
            <div className="price-card reveal">
              <div className="price-name">{t.planFree}</div>
              <div className="price-desc">{t.planFreeDesc}</div>
              <div className="price-amount">
                <span className="currency">$</span>
                <span className="number">0</span>
                <span className="period">{t.planFreePeriod}</span>
              </div>
              <ul className="price-features">
                <li>
                  <span className="check">✓</span> {t.planFreeF1}
                </li>
                <li>
                  <span className="check">✓</span> {t.planFreeF2}
                </li>
                <li>
                  <span className="check">✓</span> {t.planFreeF3}
                </li>
                <li>
                  <span className="check">✓</span> {t.planFreeF4}
                </li>
              </ul>
              <Link href={`/${locale}/start`} className="price-cta outline">
                {t.planFreeCta}
              </Link>
            </div>

            <div className="price-card popular reveal">
              <div className="price-popular-badge">{t.planLiteBadge}</div>
              <div className="price-name">{t.planLite}</div>
              <div className="price-desc">{t.planLiteDesc}</div>
              <div className="price-amount">
                <span className="currency">$</span>
                <span className="number">38</span>
                <span className="period">{t.planLitePeriod}</span>
              </div>
              <ul className="price-features">
                <li>
                  <span className="check">✓</span> {t.planLiteF1}
                </li>
                <li>
                  <span className="check">✓</span> {t.planLiteF2}
                </li>
                <li>
                  <span className="check">✓</span> {t.planLiteF3}
                </li>
                <li>
                  <span className="check">✓</span> {t.planLiteF4}
                </li>
                <li>
                  <span className="check">✓</span> {t.planLiteF5}
                </li>
              </ul>
              <Link href={`/${locale}/start`} className="price-cta fill">
                {t.planLiteCta}
              </Link>
            </div>

            <div className="price-card reveal">
              <div className="price-name">{t.planPro}</div>
              <div className="price-desc">{t.planProDesc}</div>
              <div className="price-amount">
                <span className="currency">$</span>
                <span className="number">79</span>
                <span className="period">{t.planProPeriod}</span>
              </div>
              <ul className="price-features">
                <li>
                  <span className="check">✓</span> {t.planProF1}
                </li>
                <li>
                  <span className="check">✓</span> {t.planProF2}
                </li>
                <li>
                  <span className="check">✓</span> {t.planProF3}
                </li>
                <li>
                  <span className="check">✓</span> {t.planProF4}
                </li>
                <li>
                  <span className="check">✓</span> {t.planProF5}
                </li>
              </ul>
              <Link href={`/${locale}/start`} className="price-cta outline">
                {t.planProCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="social-proof section-pad">
        <div className="container">
          <div className="section-label reveal">{t.proofLabel}</div>
          <h2 className="section-title reveal">{t.proofTitle}</h2>

          <div className="proof-grid">
            <div className="proof-card reveal">
              <div className="quote">{t.proof1q}</div>
              <div className="proof-author">
                <div className="proof-avatar a">👟</div>
                <div>
                  <div className="proof-name">{t.proof1name}</div>
                  <div className="proof-role">{t.proof1role}</div>
                </div>
              </div>
            </div>
            <div className="proof-card reveal">
              <div className="quote">{t.proof2q}</div>
              <div className="proof-author">
                <div className="proof-avatar b">💍</div>
                <div>
                  <div className="proof-name">{t.proof2name}</div>
                  <div className="proof-role">{t.proof2role}</div>
                </div>
              </div>
            </div>
            <div className="proof-card reveal">
              <div className="quote">{t.proof3q}</div>
              <div className="proof-author">
                <div className="proof-avatar c">🧁</div>
                <div>
                  <div className="proof-name">{t.proof3name}</div>
                  <div className="proof-role">{t.proof3role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="faq section-pad">
        <div className="container">
          <div
            className="section-label reveal"
            style={{ textAlign: "center", justifyContent: "center" }}
          >
            {t.faqLabel}
          </div>
          <h2
            className="section-title reveal"
            style={{ textAlign: "center" }}
          >
            FAQ
          </h2>

          <div className="faq-list">
            <div className="faq-item reveal">
              <div className="faq-q" onClick={toggleFaq}>
                {t.faq1q}
                <span className="icon">+</span>
              </div>
              <div className="faq-a">
                <div className="faq-a-inner">{t.faq1a}</div>
              </div>
            </div>
            <div className="faq-item reveal">
              <div className="faq-q" onClick={toggleFaq}>
                {t.faq2q}
                <span className="icon">+</span>
              </div>
              <div className="faq-a">
                <div className="faq-a-inner">{t.faq2a}</div>
              </div>
            </div>
            <div className="faq-item reveal">
              <div className="faq-q" onClick={toggleFaq}>
                {t.faq3q}
                <span className="icon">+</span>
              </div>
              <div className="faq-a">
                <div className="faq-a-inner">{t.faq3a}</div>
              </div>
            </div>
            <div className="faq-item reveal">
              <div className="faq-q" onClick={toggleFaq}>
                {t.faq4q}
                <span className="icon">+</span>
              </div>
              <div className="faq-a">
                <div className="faq-a-inner">{t.faq4a}</div>
              </div>
            </div>
            <div className="faq-item reveal">
              <div className="faq-q" onClick={toggleFaq}>
                {t.faq5q}
                <span className="icon">+</span>
              </div>
              <div className="faq-a">
                <div className="faq-a-inner">{t.faq5a}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-final">
        <div className="cta-glow"></div>
        <div className="container reveal">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaDesc}</p>
          <Link
            href={`/${locale}/start`}
            className="btn-primary"
            style={{ fontSize: "18px", padding: "20px 48px" }}
          >
            {t.ctaPrimary} <span className="arrow">→</span>
          </Link>
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <span>W</span>o<span>W</span>lix
        </div>
        <div className="footer-links">
          <a href="#">{t.footerAbout}</a>
          <a href="#">{t.footerPrivacy}</a>
          <a href="#">{t.footerTerms}</a>
          <a href="https://instagram.com/wowlix.hk">Instagram</a>
        </div>
        <div className="footer-copy">© 2026 Flow Studio HK</div>
      </footer>
    </>
  );
}
