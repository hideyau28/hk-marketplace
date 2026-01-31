"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Slide = {
  title: string;
  subtitle?: string;
  cta?: string;
  href?: string;
  imageUrl: string;
};

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const fallbackUrl =
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=70";
  const [imgSrc, setImgSrc] = useState<Record<number, string>>({});
  const [hardFail, setHardFail] = useState<Record<number, boolean>>({});

  // Keep src map in sync when slides change
  useEffect(() => {
    setImgSrc((prev) => {
      const next: Record<number, string> = { ...prev };
      slides.forEach((s, i) => {
        if (!next[i]) next[i] = s.imageUrl;
      });
      return next;
    });
  }, [slides]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-hero-slide]"));
    if (items.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // pick the most visible
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (!best) return;
        const idx = Number((best.target as HTMLElement).dataset.index || 0);
        setActive(idx);
      },
      { root: el, threshold: [0.5, 0.75] }
    );

    items.forEach((it) => obs.observe(it));
    return () => obs.disconnect();
  }, [slides.length]);

  const handleImageError = (index: number) => {
    // First failure: swap to a known-good fallback URL.
    // Second failure: show gradient block.
    setImgSrc((prev) => {
      const current = prev[index];
      if (current && current !== fallbackUrl) return { ...prev, [index]: fallbackUrl };
      return prev;
    });

    setHardFail((prev) => {
      const current = imgSrc[index];
      if (current && current === fallbackUrl) return { ...prev, [index]: true };
      return prev;
    });
  };

  return (
    <section className="mt-4">
      {/* One-slide-per-screen carousel (no peek) */}
      <div className="overflow-hidden">
        <div
          ref={scrollerRef}
          className="flex w-full overflow-x-auto [-webkit-overflow-scrolling:touch] snap-x snap-mandatory"
        >
          {slides.map((s, i) => {
            const href = s.href;
            const isHardFail = !!hardFail[i];

            const Inner = (
              <div
                data-hero-slide
                data-index={i}
                className="relative w-full snap-start"
              >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <div className="relative h-[200px] w-full md:h-[280px]">
                    {!isHardFail ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgSrc[i] || s.imageUrl}
                          alt={s.title}
                          className="h-full w-full object-cover"
                          onError={() => handleImageError(i)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </>
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900" />
                    )}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="text-white text-2xl font-bold leading-tight">{s.title}</div>
                    {s.subtitle ? <div className="mt-1.5 text-white/80 text-sm">{s.subtitle}</div> : null}

                    {s.cta && href ? (
                      <div className="mt-4">
                        <span className="inline-flex rounded-full bg-olive-600 px-4 py-2 text-sm font-semibold text-white">
                          {s.cta}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );

            return href ? (
              <Link key={i} href={href} className="block w-full shrink-0">
                {Inner}
              </Link>
            ) : (
              <div key={i} className="w-full shrink-0">
                {Inner}
              </div>
            );
          })}
        </div>

        {/* Dots */}
        {slides.length > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5 px-4">
            {slides.map((_, i) => (
              <div
                key={i}
                className={
                  "h-1.5 rounded-full transition-all " +
                  (i === active ? "w-5 bg-olive-600" : "w-1.5 bg-zinc-300")
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
