"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { hexToRgba, type CoverTemplate } from "@/lib/cover-templates";
import { useTemplate } from "@/lib/template-context";

// 根據 template token 生成 cover style
function getCoverStyle(tmpl: CoverTemplate) {
  switch (tmpl.id) {
    case "noir":
      // 暗黑漸變 + subtle 橙色光暈
      return {
        background: `
          radial-gradient(circle at 30% 20%, ${hexToRgba(tmpl.accent, 0.15)} 0%, transparent 50%),
          ${tmpl.headerGradient}
        `,
      };

    case "linen":
      // 米色漸變 + warm glow
      return {
        background: `
          radial-gradient(circle at 70% 30%, ${hexToRgba(tmpl.accent, 0.2)} 0%, transparent 50%),
          ${tmpl.headerGradient}
        `,
      };

    case "mochi":
      // 清新白綠漸變
      return {
        background: `
          radial-gradient(circle at 50% 50%, ${hexToRgba(tmpl.accent, 0.08)} 0%, transparent 60%),
          ${tmpl.headerGradient}
        `,
      };

    case "petal":
      // 粉紅漸變 + soft bokeh
      return {
        background: `
          radial-gradient(circle at 20% 40%, ${hexToRgba(tmpl.accent, 0.2)} 0%, transparent 40%),
          radial-gradient(circle at 80% 60%, ${hexToRgba(tmpl.accent, 0.12)} 0%, transparent 40%),
          ${tmpl.headerGradient}
        `,
      };

    default:
      // Fallback: use template gradient
      return {
        background: tmpl.headerGradient,
      };
  }
}

// SVG pattern overlays（部分 template 有紋理效果）
function getPatternOverlay(tmpl: CoverTemplate) {
  switch (tmpl.id) {
    case "noir":
      // 幾何格線
      return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-noir" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-noir)" />
        </svg>
      );

    case "linen":
      // 布紋質感
      return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="linen-tex" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="1" height="1" fill={tmpl.subtext} />
              <rect x="2" y="2" width="1" height="1" fill={tmpl.subtext} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#linen-tex)" />
        </svg>
      );

    default:
      return null;
  }
}

export default function CoverPhoto({ url }: { url: string | null }) {
  const tmpl = useTemplate();
  const ref = useRef<HTMLDivElement>(null);

  // Parallax effect on scroll
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      const y = window.scrollY;
      el.style.transform = `translateY(${y * 0.3}px)`;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const coverStyle = getCoverStyle(tmpl);
  const patternOverlay = getPatternOverlay(tmpl);

  // 渲染優先級：自訂 cover → template default banner → gradient fallback
  const bannerSrc = url || tmpl.defaultBanner;

  return (
    <div className="relative h-[200px] sm:h-[280px] overflow-hidden">
      <div ref={ref} className="absolute inset-0 will-change-transform">
        {bannerSrc ? (
          <Image
            src={bannerSrc}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <>
            <div className="w-full h-full" style={coverStyle} />
            {patternOverlay}
          </>
        )}
      </div>
      {/* Bottom gradient fade into page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-20" style={{ background: `linear-gradient(to top, ${tmpl.bg}, transparent)` }} />
    </div>
  );
}
