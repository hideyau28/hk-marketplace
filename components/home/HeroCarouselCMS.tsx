"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Slide = {
  key: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
};

const gradients = [
  "from-olive-700 to-olive-900",
  "from-zinc-800 to-zinc-950",
  "from-blue-700 to-blue-900",
  "from-zinc-900 to-black",
  "from-teal-700 to-teal-900",
];

export default function HeroCarouselCMS({
  slides,
  locale,
}: {
  slides: Slide[];
  locale: Locale;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || slides.length === 0) return;

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

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const nextIndex = (active + 1) % slides.length;
      const items = Array.from(el.querySelectorAll<HTMLElement>("[data-hero-slide]"));
      if (items[nextIndex]) {
        items[nextIndex].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [active, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="mt-4">
      <div className="overflow-hidden">
        <div
          ref={scrollerRef}
          className="flex w-full overflow-x-auto [-webkit-overflow-scrolling:touch] snap-x snap-mandatory scrollbar-hide"
        >
          {slides.map((slide, i) => {
            const gradient = gradients[i % gradients.length];
            const Inner = (
              <div
                data-hero-slide
                data-index={i}
                className="relative w-full snap-start"
              >
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient}`}>
                  <div className="relative h-48 md:h-72 w-full flex flex-col items-center justify-center p-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {slide.title}
                    </h2>
                    {slide.subtitle && (
                      <p className="text-sm md:text-base text-white/80 mb-4">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.buttonText && slide.buttonLink && (
                      <span className="inline-flex rounded-full bg-white px-6 py-2 text-sm font-semibold text-zinc-900 hover:bg-white/90 transition-colors">
                        {slide.buttonText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );

            return slide.buttonLink ? (
              <Link key={slide.key} href={slide.buttonLink} className="block w-full shrink-0">
                {Inner}
              </Link>
            ) : (
              <div key={slide.key} className="w-full shrink-0">
                {Inner}
              </div>
            );
          })}
        </div>

        {/* Dot Indicators */}
        {slides.length > 1 && (
          <div className="mt-3 flex justify-center gap-2 px-4">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === active ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
