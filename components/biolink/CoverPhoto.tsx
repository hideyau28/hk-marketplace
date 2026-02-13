"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { getCoverTemplate, resolveTemplateId } from "@/lib/cover-templates";
import { useTemplate } from "@/lib/template-context";

type Props = {
  url: string | null;
  brandColor: string | null;
  coverTemplate?: string | null;
};

// 根據 template token 生成 cover style
function getCoverStyle(rawTemplate: string | null | undefined, brandColor: string | null) {
  const tmpl = getCoverTemplate(rawTemplate);
  const resolved = resolveTemplateId(rawTemplate);

  switch (resolved) {
    case "noir":
      // 暗黑漸變 + subtle 橙色光暈
      return {
        background: `
          radial-gradient(circle at 30% 20%, rgba(255, 149, 0, 0.15) 0%, transparent 50%),
          ${tmpl.headerGradient}
        `,
      };

    case "linen":
      // 米色漸變 + warm glow
      return {
        background: `
          radial-gradient(circle at 70% 30%, rgba(196, 154, 108, 0.2) 0%, transparent 50%),
          ${tmpl.headerGradient}
        `,
      };

    case "mochi":
      // 清新白綠漸變
      return {
        background: `
          radial-gradient(circle at 50% 50%, rgba(45, 106, 79, 0.08) 0%, transparent 60%),
          ${tmpl.headerGradient}
        `,
      };

    case "petal":
      // 粉紅漸變 + soft bokeh
      return {
        background: `
          radial-gradient(circle at 20% 40%, rgba(199, 125, 145, 0.2) 0%, transparent 40%),
          radial-gradient(circle at 80% 60%, rgba(248, 228, 232, 0.3) 0%, transparent 40%),
          ${tmpl.headerGradient}
        `,
      };

    default:
      // Fallback: use brandColor or template gradient
      return {
        background: tmpl.headerGradient,
      };
  }
}

// SVG pattern overlays（部分 template 有紋理效果）
function getPatternOverlay(rawTemplate: string | null | undefined) {
  const resolved = resolveTemplateId(rawTemplate);

  switch (resolved) {
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
              <rect width="1" height="1" fill="#8C7B6B" />
              <rect x="2" y="2" width="1" height="1" fill="#8C7B6B" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#linen-tex)" />
        </svg>
      );

    default:
      return null;
  }
}

export default function CoverPhoto({ url, brandColor, coverTemplate }: Props) {
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

  const coverStyle = getCoverStyle(coverTemplate, brandColor);
  const patternOverlay = getPatternOverlay(coverTemplate);

  return (
    <div className="relative h-[200px] overflow-hidden">
      <div ref={ref} className="absolute inset-0 will-change-transform">
        {url ? (
          <Image
            src={url}
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
