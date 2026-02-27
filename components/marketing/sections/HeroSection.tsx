"use client";

import { useState, useEffect } from "react";
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
    ctaSecondary: "睇定價",
    trustBadge1: "0% 佣金",
    trustBadge2: "免費開始",
    trustBadge3: "2 分鐘開店",
  },
  en: {
    heroBadge: "\uD83D\uDD25 Built for HK Instagram Sellers",
    heroH1a: "One Link",
    heroH1b: "Turn Followers",
    heroH1c: "into Sales",
    heroSub1: "Set up your shop in as fast as 2 minutes.",
    heroSub2: "Turn your IG Bio Link into a real online store.",
    ctaPrimary: "Start Free →",
    ctaSecondary: "View Pricing",
    trustBadge1: "0% Commission",
    trustBadge2: "Free to Start",
    trustBadge3: "2 Min Setup",
  },
};

/* ─── Demo store screenshots for phone carousel ─── */
const DEMO_SCREENS = [
  { slug: "petitfleur", src: "/demos/petitfleur.png" },
  { slug: "hypedrops", src: "/demos/hypedrops.png" },
  { slug: "nichiyori", src: "/demos/nichiyori.png" },
  { slug: "greenday", src: "/demos/greenday.png" },
];

/* ─── Phone Mockup (auto-carousel) ─── */
function PhoneMockup() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % DEMO_SCREENS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-phone-wrap">
      <div className="hero-phone-frame">
        {/* Dynamic Island */}
        <div className="hero-dynamic-island" />

        {/* Screenshot — fades on each store change */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={idx}
          src={DEMO_SCREENS[idx].src}
          alt={DEMO_SCREENS[idx].slug}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
            animation: "phoneFadeIn 0.5s ease-out",
          }}
        />

        {/* Dot indicators */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 5,
            zIndex: 5,
          }}
        >
          {DEMO_SCREENS.map((_, i) => (
            <div
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: i === idx ? "#FF9500" : "rgba(255,255,255,0.35)",
                transition: "background 0.3s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating notifications */}
      <div className="hero-float hero-float-1">
        <span style={{ fontSize: 12 }}>🔔</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>
          新訂單！
        </span>
      </div>
      <div className="hero-float hero-float-2">
        <span style={{ fontSize: 14 }}>💰</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
          PayMe 待確認
        </span>
      </div>
      <div className="hero-float hero-float-3">
        <span style={{ fontSize: 12 }}>📦</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#FF9500" }}>
          新訂單 +1
        </span>
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
        @keyframes phoneFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatIn1 {
          from { opacity: 0; transform: translate(-20px, 10px) scale(0.8); }
          to   { opacity: 1; transform: translate(0, 0) scale(1); }
        }
        @keyframes floatIn2 {
          from { opacity: 0; transform: translate(20px, 10px) scale(0.8); }
          to   { opacity: 1; transform: translate(0, 0) scale(1); }
        }
        @keyframes floatIn3 {
          from { opacity: 0; transform: translate(-16px, 8px) scale(0.8); }
          to   { opacity: 1; transform: translate(0, 0) scale(1); }
        }
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        /* ─── Section ─── */
        .hero-section {
          position: relative;
          z-index: 0; /* contain child stacking contexts below nav (z-index: 100) */
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
          padding: 18px 44px;
          border-radius: 14px;
          font-size: 19px;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 8px 32px rgba(255,149,0,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
          min-height: 56px;
        }
        .hero-cta-primary:hover {
          transform: scale(1.03);
          box-shadow: 0 12px 40px rgba(255,149,0,0.45);
        }
        .hero-cta-secondary {
          display: inline-flex;
          align-items: center;
          background: transparent;
          color: #FF9500;
          border: 2px solid #FF9500;
          padding: 17px 36px;
          border-radius: 14px;
          font-size: 17px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s, border-color 0.2s;
          min-height: 56px;
        }
        .hero-cta-secondary:hover {
          background: rgba(255,149,0,0.08);
          border-color: #E68600;
          transform: scale(1.02);
        }

        /* ─── Trust badges ─── */
        .hero-trust-badges {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 16px;
          animation: heroFadeInUp 0.6s ease-out 0.2s both;
        }
        .hero-trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.02em;
        }
        .hero-trust-check {
          color: #FF9500;
          font-size: 15px;
          flex-shrink: 0;
        }

        /* ─── Phone mockup wrapper ─── */
        .hero-phone-wrap {
          position: relative;
          width: 260px;
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
            0 0 80px rgba(255,149,0,0.3);
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
          top: 22%;
          left: -60px;
          animation: floatIn1 0.6s ease-out 1s both, subtleFloat 3s ease-in-out 1.6s infinite;
        }
        .hero-float-2 {
          bottom: 32%;
          right: -60px;
          padding: 10px 18px;
          animation: floatIn2 0.6s ease-out 1.3s both, subtleFloat 3s ease-in-out 2.2s infinite;
        }
        .hero-float-2 span:last-child {
          font-size: 13px;
          font-weight: 700;
        }
        .hero-float-3 {
          bottom: 14%;
          left: -50px;
          animation: floatIn3 0.6s ease-out 1.6s both, subtleFloat 3s ease-in-out 2.6s infinite;
        }

        /* ─── Tablet ─── */
        @media (min-width: 768px) {
          .hero-section {
            padding: 80px 40px 100px;
          }
          .hero-phone-wrap {
            width: 300px;
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
          .hero-float-3 {
            left: -70px;
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
            gap: 40px;
          }
          .hero-text {
            max-width: 520px;
            flex: 1;
          }
          .hero-cta-row {
            justify-content: flex-start;
          }
          .hero-trust-badges {
            justify-content: flex-start;
          }
          .hero-phone-wrap {
            width: 340px;
            flex-shrink: 0;
          }
          .hero-float-1 {
            left: -90px;
          }
          .hero-float-2 {
            right: -90px;
          }
          .hero-float-3 {
            left: -80px;
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

          <div className="hero-trust-badges">
            <span className="hero-trust-badge">
              <span className="hero-trust-check">✓</span> {t.trustBadge1}
            </span>
            <span className="hero-trust-badge">
              <span className="hero-trust-check">✓</span> {t.trustBadge2}
            </span>
            <span className="hero-trust-badge">
              <span className="hero-trust-check">✓</span> {t.trustBadge3}
            </span>
          </div>

          <div className="hero-cta-row">
            <Link href={`/${locale}/start`} className="hero-cta-primary">
              {t.ctaPrimary}
            </Link>
            <Link href={`/${locale}/pricing`} className="hero-cta-secondary">
              {t.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Phone Mockup — auto-carousel of 4 demo stores */}
        <PhoneMockup />
      </div>
    </section>
  );
}
