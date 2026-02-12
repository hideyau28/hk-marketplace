"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

type Props = {
  url: string | null;
  brandColor: string | null;
  coverTemplate?: string | null;
};

// 6 款質感 gradient + pattern templates
function getCoverStyle(template: string | null | undefined, brandColor: string | null) {
  const color = brandColor || "#FF9500";

  switch (template) {
    case "warm":
      // 橙黃漸變 + subtle 放射光暈
      return {
        background: `
          radial-gradient(circle at 30% 20%, rgba(255, 200, 100, 0.4) 0%, transparent 50%),
          radial-gradient(circle at 70% 80%, rgba(255, 150, 50, 0.3) 0%, transparent 50%),
          linear-gradient(135deg, #FF9500 0%, #FFB84D 30%, #FF6F00 100%)
        `,
      };

    case "ocean":
      // 藍色漸變 + 波浪 SVG overlay
      return {
        background: `linear-gradient(135deg, #0077BE 0%, #00A0E3 50%, #004D7A 100%)`,
      };

    case "pastel":
      // 粉紫漸變 + 圓形 bokeh
      return {
        background: `
          radial-gradient(circle at 20% 30%, rgba(255, 182, 193, 0.4) 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(221, 160, 221, 0.4) 0%, transparent 40%),
          radial-gradient(circle at 50% 50%, rgba(230, 190, 255, 0.3) 0%, transparent 50%),
          linear-gradient(135deg, #FFB6C1 0%, #DDA0DD 50%, #E6BEFF 100%)
        `,
      };

    case "mono":
      // 黑灰漸變 + 細線幾何 pattern
      return {
        background: `linear-gradient(135deg, #1a1a1a 0%, #404040 50%, #0f0f0f 100%)`,
      };

    case "nature":
      // 綠色漸變 + 葉形 SVG overlay
      return {
        background: `linear-gradient(135deg, #2D5016 0%, #4A7C2C 40%, #6B9F3E 100%)`,
      };

    case "sunset":
      // 橙紅漸變 + 光暈 flare
      return {
        background: `
          radial-gradient(circle at 80% 30%, rgba(255, 100, 50, 0.6) 0%, transparent 50%),
          radial-gradient(circle at 20% 80%, rgba(255, 150, 0, 0.4) 0%, transparent 40%),
          linear-gradient(135deg, #FF4500 0%, #FF6347 40%, #FF8C00 100%)
        `,
      };

    default:
      // 原來的 brandColor gradient
      return {
        background: `linear-gradient(135deg, ${color} 0%, #0f0f0f 100%)`,
      };
  }
}

// SVG pattern overlays
function getPatternOverlay(template: string | null | undefined) {
  switch (template) {
    case "ocean":
      return (
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wave" x="0" y="0" width="100" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 Q 25 10, 50 20 T 100 20" fill="none" stroke="white" strokeWidth="1" />
              <path d="M0 30 Q 25 20, 50 30 T 100 30" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wave)" />
        </svg>
      );

    case "mono":
      return (
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="0.5" opacity="0.3" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="white" strokeWidth="0.5" opacity="0.3" />
        </svg>
      );

    case "nature":
      return (
        <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="leaves" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <ellipse cx="20" cy="40" rx="15" ry="25" fill="white" opacity="0.3" transform="rotate(30 20 40)" />
              <ellipse cx="60" cy="20" rx="12" ry="20" fill="white" opacity="0.25" transform="rotate(-20 60 20)" />
              <ellipse cx="50" cy="65" rx="18" ry="28" fill="white" opacity="0.2" transform="rotate(45 50 65)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#leaves)" />
        </svg>
      );

    default:
      return null;
  }
}

export default function CoverPhoto({ url, brandColor, coverTemplate }: Props) {
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
      {/* Bottom gradient fade into dark bg */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
    </div>
  );
}
