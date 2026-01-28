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

  return (
    <section className="mt-4">
      <div className="-mx-4 px-4">
        <div
          ref={scrollerRef}
          className="flex gap-3 overflow-x-auto [-webkit-overflow-scrolling:touch] snap-x snap-mandatory"
        >
          {slides.map((s, i) => {
            const href = s.href;
            const Card = (
              <div
                data-hero-slide
                data-index={i}
                key={i}
                className="relative w-full shrink-0 snap-start overflow-hidden rounded-3xl bg-zinc-900"
              >
                <div className="relative h-[180px] w-full md:h-[260px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.imageUrl} alt={s.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <div className="text-white text-2xl font-bold leading-tight">{s.title}</div>
                  {s.subtitle ? <div className="mt-2 text-white/80 text-sm">{s.subtitle}</div> : null}
                  {s.cta && href ? (
                    <div className="mt-4">
                      <span className="inline-flex rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-zinc-900">
                        {s.cta}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            );

            return href ? <Link key={i} href={href} className="block">{Card}</Link> : Card;
          })}
        </div>

        {/* Dots */}
        {slides.length > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={
                  "h-1.5 rounded-full transition-all " +
                  (i === active ? "w-5 bg-zinc-900" : "w-1.5 bg-zinc-300")
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
