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

const FALLBACK_URL =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=70";

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
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
    const current = imgSrc[index];
    if (current && current !== FALLBACK_URL) {
      // First failure: swap to fallback
      setImgSrc((prev) => ({ ...prev, [index]: FALLBACK_URL }));
    } else {
      // Second failure: show gradient block
      setHardFail((prev) => ({ ...prev, [index]: true }));
    }
  };

  return (
    <section className="mt-4">
      {/* One-slide-per-screen carousel */}
      <div className="overflow-hidden">
        <div
          ref={scrollerRef}
          className="flex w-full overflow-x-auto [-webkit-overflow-scrolling:touch] snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {slides.map((s, i) => {
            const href = s.href;
            const isHardFail = !!hardFail[i];

            const SlideContent = (
              <div
                data-hero-slide
                data-index={i}
                className="relative w-full snap-start"
              >
                <div className="relative overflow-hidden rounded-3xl">
                  {/* Fixed height container */}
                  <div className="relative h-[200px] w-full md:h-[280px]">
                    {/* Background: image or gradient fallback */}
                    {!isHardFail ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imgSrc[i] || s.imageUrl}
                        alt={s.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={() => handleImageError(i)}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900" />
                    )}

                    {/* Consistent overlay for all slides */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

                    {/* Content: consistent positioning */}
                    <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                      <h2 className="text-white text-xl md:text-2xl font-bold leading-tight line-clamp-2">
                        {s.title}
                      </h2>
                      {s.subtitle && (
                        <p className="mt-1.5 text-white/80 text-sm line-clamp-1">
                          {s.subtitle}
                        </p>
                      )}
                      {s.cta && href && (
                        <div className="mt-4">
                          <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm">
                            {s.cta}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );

            return href ? (
              <Link key={i} href={href} className="block w-full shrink-0">
                {SlideContent}
              </Link>
            ) : (
              <div key={i} className="w-full shrink-0">
                {SlideContent}
              </div>
            );
          })}
        </div>

        {/* Dots indicator */}
        {slides.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5 px-4">
            {slides.map((_, i) => (
              <div
                key={i}
                className={
                  "h-1.5 rounded-full transition-all duration-200 " +
                  (i === active ? "w-5 bg-zinc-900" : "w-1.5 bg-zinc-300")
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
