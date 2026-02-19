"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";

/* ─── i18n ─── */
const T = {
  "zh-HK": {
    heroBadge: "專為香港 IG 小店而設",
    heroH1a: "一條 Link",
    heroH1b: "將 Follower 變成生意",
    heroSub1: "0% 平台抽成・$0 起・2 分鐘開店",
    heroSub2: "落單、收款、庫存，一個 Link 搞掂晒",
    ctaPrimary: "免費開店 →",
    ctaSecondary: "睇定價",
    mockupStore: "Store Preview",
    mockupName: "maysshop",
    mockupDesc: "飾物・手作・代購",
    mockupProduct1: "玫瑰金手鏈",
    mockupPrice1: "$168",
    mockupProduct2: "極簡耳環",
    mockupPrice2: "$88",
    mockupCta: "立即選購",
  },
  en: {
    heroBadge: "Built for HK Instagram shops",
    heroH1a: "One Link",
    heroH1b: "Turn Followers into Sales",
    heroSub1: "0% commission · From $0 · 2 min setup",
    heroSub2: "Orders, payments, inventory — one link handles it all",
    ctaPrimary: "Start Free →",
    ctaSecondary: "See Pricing",
    mockupStore: "Store Preview",
    mockupName: "maysshop",
    mockupDesc: "Jewelry · Handmade · Buying service",
    mockupProduct1: "Rose Gold Bracelet",
    mockupPrice1: "$168",
    mockupProduct2: "Minimal Earrings",
    mockupPrice2: "$88",
    mockupCta: "Shop Now",
  },
};

/* ─── Phone Mockup ─── */
function PhoneMockup({ t }: { t: (typeof T)["zh-HK"] }) {
  return (
    <div className="hero-phone-wrap">
      {/* iPhone frame */}
      <div className="hero-phone-frame">
        {/* Dynamic Island */}
        <div className="hero-dynamic-island" />

        {/* Screen content — maysshop placeholder */}
        <div className="hero-phone-screen">
          {/* Status bar area (behind Dynamic Island) */}
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

          {/* Product cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "4px 12px" }}>
            {[
              { color: "#FFE0EB", name: t.mockupProduct1, price: t.mockupPrice1 },
              { color: "#E8DDD3", name: t.mockupProduct2, price: t.mockupPrice2 },
            ].map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ height: 64, background: p.color, opacity: 0.25 }} />
                <div style={{ padding: "5px 7px" }}>
                  <div style={{ color: "#fff", fontSize: 9, fontWeight: 600, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ color: "#FF9500", fontSize: 10, fontWeight: 700, marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{p.price}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div style={{ padding: "10px 12px" }}>
            <div style={{
              background: "#FF9500", borderRadius: 8, padding: "8px",
              textAlign: "center" as const, color: "#fff", fontSize: 11, fontWeight: 700,
            }}>
              {t.mockupCta}
            </div>
          </div>

          {/* Placeholder label */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.2)", fontSize: 11, fontWeight: 600,
            letterSpacing: "0.05em", paddingBottom: 16,
          }}>
            {t.mockupStore}
          </div>
        </div>
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

        /* ─── Section ─── */
        .hero-section {
          position: relative;
          overflow: hidden;
          padding: 48px 20px 64px;
          text-align: center;
          background: linear-gradient(180deg, #FFF8F0 0%, #FFFFFF 100%);
        }

        /* Subtle decorative glow */
        .hero-section::before {
          content: '';
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,149,0,0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        /* ─── Content container ─── */
        .hero-inner {
          position: relative;
          max-width: 640px;
          margin: 0 auto;
        }

        /* ─── Badge ─── */
        .hero-badge {
          display: inline-block;
          background: #FFF3E0;
          color: #E68600;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 20px;
          letter-spacing: 0.02em;
          animation: heroFadeInUp 0.6s ease-out both;
        }

        /* ─── Headline ─── */
        .hero-h1 {
          font-family: 'Noto Sans TC', 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(32px, 7vw, 56px);
          font-weight: 900;
          line-height: 1.15;
          color: #1A1A1A;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
          animation: heroFadeInUp 0.6s ease-out 0.08s both;
        }
        .hero-h1 .accent {
          color: #FF9500;
        }

        /* ─── Subtitle ─── */
        .hero-sub {
          font-family: 'Noto Sans TC', sans-serif;
          font-size: 17px;
          color: #6B7280;
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
        }
        .hero-cta-primary {
          display: inline-flex;
          align-items: center;
          background: #FF9500;
          color: #fff;
          border: none;
          padding: 16px 36px;
          border-radius: 14px;
          font-size: 17px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 8px 30px rgba(255,149,0,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
          min-height: 52px;
        }
        .hero-cta-primary:hover {
          transform: scale(1.02);
          box-shadow: 0 12px 36px rgba(255,149,0,0.35);
        }
        .hero-cta-secondary {
          display: inline-flex;
          align-items: center;
          background: transparent;
          color: #FF9500;
          border: 2px solid #FF9500;
          padding: 14px 32px;
          border-radius: 14px;
          font-size: 17px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
          min-height: 52px;
        }
        .hero-cta-secondary:hover {
          background: #FFF3E0;
          transform: scale(1.02);
        }

        /* ─── Phone mockup wrapper ─── */
        .hero-phone-wrap {
          margin: 48px auto 0;
          width: 260px;
          animation: heroFadeInUp 0.7s ease-out 0.35s both;
          transition: transform 0.3s;
        }
        .hero-phone-wrap:hover {
          transform: translateY(-8px);
        }

        /* ─── iPhone Frame ─── */
        .hero-phone-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 9 / 19.5;
          border-radius: 44px;
          border: 6px solid #1A1A1A;
          background: #000;
          overflow: hidden;
          box-shadow:
            0 25px 60px rgba(0,0,0,0.15),
            0 4px 12px rgba(0,0,0,0.08),
            inset 0 0 0 2px rgba(255,255,255,0.1);
        }

        /* ─── Dynamic Island ─── */
        .hero-dynamic-island {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 28px;
          background: #000;
          border-radius: 20px;
          z-index: 10;
        }

        /* ─── Screen ─── */
        .hero-phone-screen {
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, #1A1A1A 0%, #222 100%);
          display: flex;
          flex-direction: column;
        }

        /* ─── Desktop ─── */
        @media (min-width: 768px) {
          .hero-section {
            padding: 72px 40px 96px;
          }
          .hero-phone-wrap {
            width: 300px;
            margin-top: 56px;
          }
          .hero-sub {
            font-size: 18px;
          }
        }

        @media (min-width: 1024px) {
          .hero-section {
            padding: 80px 40px 120px;
          }
          .hero-inner {
            max-width: 720px;
          }
          .hero-phone-wrap {
            width: 320px;
            margin-top: 64px;
          }
        }
      `}</style>

      <div className="hero-inner">
        {/* Badge */}
        <div className="hero-badge">{t.heroBadge}</div>

        {/* Headline */}
        <h1 className="hero-h1">
          {t.heroH1a}
          <br />
          <span className="accent">{t.heroH1b}</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-sub">
          {t.heroSub1}
          <br />
          {t.heroSub2}
        </p>

        {/* CTAs */}
        <div className="hero-cta-row">
          <Link href={`/${locale}/start`} className="hero-cta-primary">
            {t.ctaPrimary}
          </Link>
          <Link href={`/${locale}/pricing`} className="hero-cta-secondary">
            {t.ctaSecondary}
          </Link>
        </div>

        {/* Phone Mockup */}
        <PhoneMockup t={t} />
      </div>
    </section>
  );
}
