"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

type Props = {
  url: string | null;
  brandColor: string | null;
};

export default function CoverPhoto({ url, brandColor }: Props) {
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

  const fallbackGradient = `linear-gradient(135deg, ${brandColor || "#FF9500"} 0%, #0f0f0f 100%)`;

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
          <div className="w-full h-full" style={{ background: fallbackGradient }} />
        )}
      </div>
      {/* Bottom gradient fade into dark bg */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
    </div>
  );
}
