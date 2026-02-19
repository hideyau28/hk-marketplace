"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";

/* ─── i18n ─── */
const T = {
  "zh-HK": {
    heroBadge: "\uD83D\uDD25 專為香港 IG 店主而設",
    heroH1a: "一條 Link",
    heroH1b: "將 Follower",
    heroH1c: "變成生意",
    heroSub1: "最快 2 分鐘開好網店。",
    heroSub2: "將你嘅 IG Bio Link 變成一間真正嘅網上商店。",
    ctaPrimary: "免費開店 →",
    ctaSecondary: "了解更多",
    trustLine: "✦ 0% 佣金 · 免費開始 · 2 分鐘開店",
    mockupName: "maysshop",
    mockupDesc: "飾物・手作・代購",
    mockupProduct1: "玫瑰金手鏈",
    mockupPrice1: "$168",
    mockupProduct2: "極簡耳環",
    mockupPrice2: "$88",
    mockupProduct3: "珍珠頸鏈",
    mockupPrice3: "$238",
    mockupProduct4: "銀色戒指",
    mockupPrice4: "$128",
    mockupCta: "立即選購",
  },
  en: {
    heroBadge: "\uD83D\uDD25 Built for HK Instagram Sellers",
    heroH1a: "One Link",
    heroH1b: "Turn Followers",
    heroH1c: "into Sales",
    heroSub1: "Set up your shop in as fast as 2 minutes.",
    heroSub2: "Turn your IG Bio Link into a real online store.",
    ctaPrimary: "Start Free →",
    ctaSecondary: "Learn More",
    trustLine: "✦ 0% Commission · Free to Start · 2 Min Setup",
    mockupName: "maysshop",
    mockupDesc: "Jewelry · Handmade · Buying service",
    mockupProduct1: "Rose Gold Bracelet",
    mockupPrice1: "$168",
    mockupProduct2: "Minimal Earrings",
    mockupPrice2: "$88",
    mockupProduct3: "Pearl Necklace",
    mockupPrice3: "$238",
    mockupProduct4: "Silver Ring",
    mockupPrice4: "$128",
    mockupCta: "Shop Now",
  },
};

/* ─── Phone Mockup ─── */
function PhoneMockup({ t }: { t: (typeof T)["zh-HK"] }) {
  return (
    <div className="hero-phone-wrap">
      <div className="hero-phone-frame">
        {/* Dynamic Island */}
        <div className="hero-dynamic-island" />

        {/* Screen content */}
        <div className="hero-phone-screen">
          <div style={{ height: 48 }} />

          {/* Store header */}
          <div style={{ textAlign: "center" as const, padding: "8px 16px 12px" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "#FF9500", margin: "0 auto 6px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 16,
            }}>
              M
            </div>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
              {t.mockupName}
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 2 }}>
              {t.mockupDesc}
            </div>
          </div>

          {/* Product grid 2x2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: "4px 10px" }}>
            {[
              { color: "#FFE0EB", name: t.mockupProduct1, price: t.mockupPrice1 },
              { color: "#E8DDD3", name: t.mockupProduct2, price: t.mockupPrice2 },
              { color: "#D1E8FF", name: t.mockupProduct3, price: t.mockupPrice3 },
              { color: "#E8E0FF", name: t.mockupProduct4, price: t.mockupPrice4 },
            ].map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ height: 48, background: p.color, opacity: 0.2 }} />
                <div style={{ padding: "4px 6px" }}>
                  <div style={{ color: "#fff", fontSize: 8, fontWeight: 600, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{
                    color: "#FF9500", fontSize: 9, fontWeight: 700, marginTop: 1,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{p.price}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div style={{ padding: "8px 10px" }}>
            <div style={{
              background: "#FF9500", borderRadius: 8, padding: "7px",
              textAlign: "center" as const, color: "#fff", fontSize: 10, fontWeight: 700,
            }}>
              {t.mockupCta}
            </div>
          </div>
        </div>
      </div>

      {/* Floating notifications */}
      <div className="hero-float hero-float-1">
        <span style={{ fontSize: 12 }}>🔔</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>新訂單！</span>
      </div>
      <div className="hero-float hero-float-2">
        <span style={{ fontSize: 12 }}>💰</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>PayMe 已收款</span>
      </div>
    </div>
  );
}

/* ─── HeroSection ─── */
export default function HeroSection({ locale = "zh-HK" }: { locale?: Locale }) {
  const t = T[locale] || T["en"];

  return (
    <section className="hero-section">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Plus+Jakarta+Sans:wght@600;700;800&family=JetBrains+Mono:wght@700&display=swap');

        @keyframes heroFadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes heroPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes floatIn1 {
          from { opacity: 0; transform: translate(-20px, 10px) scale(0.8); }
          to   { opacity: 1; transform: translate(0, 0) scale(1); }
        }
        @keyframes floatIn2 {
          from { opacity: 0; transform: translate(20px, 10px) scale(0.8); }
          to   { opacity: 1; transform: translate(0, 0) scale(1); }
        }

        /* ─── Section ─── */
        .hero-section {
          position: relative;
          overflow: hidden;
          background: #0D0D0D;
          padding: 64px 20px 80px;
        }

        /* Subtle radial glow */
        .hero-section::before {
          content: '';
          position: absolute;
          top: -200px;
          right: -100px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,149,0,0.06) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .hero-section::after {
          content: '';
          position: absolute;
          bottom: -200px;
          left: -100px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255,149,0,0.04) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        /* ─── Content layout ─── */
        .hero-inner {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 48px;
        }

        .hero-text {
          max-width: 560px;
        }

        /* ─── Badge ─── */
        .hero-badge {
          display: inline-block;
          background: rgba(255,149,0,0.12);
          color: #FF9500;
          padding: 8px 18px;
          border-radius: 24px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 24px;
          letter-spacing: 0.02em;
          border: 1px solid rgba(255,149,0,0.2);
          animation: heroFadeInUp 0.6s ease-out both;
        }

        /* ─── Headline ─── */
        .hero-h1 {
          font-family: 'Noto Sans TC', 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(36px, 8vw, 64px);
          font-weight: 900;
          line-height: 1.12;
          color: #FFFFFF;
          letter-spacing: -0.02em;
          margin-bottom: 20px;
          animation: heroFadeInUp 0.6s ease-out 0.08s both;
        }
        .hero-h1 .accent {
          color: #FF9500;
        }

        /* ─── Subtitle ─── */
        .hero-sub {
          font-family: 'Noto Sans TC', sans-serif;
          font-size: 16px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          margin-bottom: 32px;
          letter-spacing: 0.02em;
          animation: heroFadeInUp 0.6s ease-out 0.16s both;
        }

        /* ─── CTA row ─── */
        .hero-cta-row {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          animation: heroFadeInUp 0.6s ease-out 0.24s both;
          margin-bottom: 24px;
        }
        .hero-cta-primary {
          display: inline-flex;
          align-items: center;
          background: #FF9500;
          color: #fff;
          border: none;
          padding: 16px 36px;
          border-radius: 12px;
          font-size: 17px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 8px 32px rgba(255,149,0,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
          min-height: 52px;
        }
        .hero-cta-primary:hover {
          transform: scale(1.03);
          box-shadow: 0 12px 40px rgba(255,149,0,0.45);
        }
        .hero-cta-secondary {
          display: inline-flex;
          align-items: center;
          background: transparent;
          color: #fff;
          border: 1.5px solid rgba(255,255,255,0.3);
          padding: 15px 32px;
          border-radius: 12px;
          font-size: 17px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s, border-color 0.2s;
          min-height: 52px;
        }
        .hero-cta-secondary:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.5);
          transform: scale(1.02);
        }

        /* ─── Trust line ─── */
        .hero-trust-line {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.04em;
          animation: heroFadeInUp 0.6s ease-out 0.32s both;
        }

        /* ─── Phone mockup wrapper ─── */
        .hero-phone-wrap {
          position: relative;
          width: 240px;
          animation: heroFadeInUp 0.7s ease-out 0.35s both;
          transition: transform 0.4s ease;
        }
        .hero-phone-wrap:hover {
          transform: translateY(-8px);
        }

        /* ─── iPhone Frame ─── */
        .hero-phone-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 9 / 19.5;
          border-radius: 40px;
          border: 5px solid #2A2A2A;
          background: #000;
          overflow: hidden;
          box-shadow:
            0 30px 80px rgba(0,0,0,0.5),
            0 4px 16px rgba(0,0,0,0.3),
            inset 0 0 0 1px rgba(255,255,255,0.08),
            0 0 80px rgba(255,149,0,0.08);
        }

        /* ─── Dynamic Island ─── */
        .hero-dynamic-island {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 90px;
          height: 26px;
          background: #000;
          border-radius: 20px;
          z-index: 10;
        }

        /* ─── Screen ─── */
        .hero-phone-screen {
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, #1A1A1A 0%, #111 100%);
          display: flex;
          flex-direction: column;
        }

        /* ─── Floating notifications ─── */
        .hero-float {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(30,30,30,0.9);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          backdrop-filter: blur(12px);
          white-space: nowrap;
        }
        .hero-float-1 {
          top: 25%;
          left: -60px;
          animation: floatIn1 0.6s ease-out 1s both, heroFloat 3s ease-in-out 1.6s infinite;
        }
        .hero-float-2 {
          bottom: 30%;
          right: -60px;
          animation: floatIn2 0.6s ease-out 1.3s both, heroFloat 3s ease-in-out 2s infinite;
        }

        /* ─── Tablet ─── */
        @media (min-width: 768px) {
          .hero-section {
            padding: 80px 40px 100px;
          }
          .hero-phone-wrap {
            width: 280px;
          }
          .hero-sub {
            font-size: 18px;
          }
          .hero-float-1 {
            left: -80px;
          }
          .hero-float-2 {
            right: -80px;
          }
        }

        /* ─── Desktop: side-by-side layout ─── */
        @media (min-width: 1024px) {
          .hero-section {
            padding: 100px 40px 120px;
          }
          .hero-inner {
            flex-direction: row;
            text-align: left;
            align-items: center;
            justify-content: space-between;
            gap: 60px;
          }
          .hero-text {
            max-width: 520px;
            flex: 1;
          }
          .hero-cta-row {
            justify-content: flex-start;
          }
          .hero-trust-line {
            text-align: left;
          }
          .hero-phone-wrap {
            width: 300px;
            flex-shrink: 0;
          }
          .hero-float-1 {
            left: -90px;
          }
          .hero-float-2 {
            right: -90px;
          }
        }
      `}</style>

      <div className="hero-inner">
        {/* Text block */}
        <div className="hero-text">
          <div className="hero-badge">{t.heroBadge}</div>

          <h1 className="hero-h1">
            {t.heroH1a}
            <br />
            <span className="accent">{t.heroH1b}</span>
            <br />
            {t.heroH1c}
          </h1>

          <p className="hero-sub">
            {t.heroSub1}
            <br />
            {t.heroSub2}
          </p>

          <div className="hero-cta-row">
            <Link href="/admin/register" className="hero-cta-primary">
              {t.ctaPrimary}
            </Link>
            <a href="#how-it-works" className="hero-cta-secondary">
              {t.ctaSecondary}
            </a>
          </div>

          <div className="hero-trust-line">
            {t.trustLine}
          </div>
        </div>

        {/* Phone Mockup */}
        <PhoneMockup t={t} />
      </div>
    </section>
  );
}
