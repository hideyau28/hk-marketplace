"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Slide = {
  key: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
};

export default function HeroCarouselCMS({
  slides,
  locale,
}: {
  slides: Slide[];
  locale: Locale;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate every 5 seconds - NO scrollIntoView, just update index
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="mt-4">
      <div className="relative overflow-hidden rounded-3xl">
        {/* Slides Container - NO scroll-snap, use transform instead */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide) => {
            const Inner = (
              <div className="relative w-full shrink-0 h-48 md:h-72">
                {/* Background Image */}
                {slide.imageUrl && (
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority={activeIndex === 0}
                  />
                )}

                {/* Dark Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />

                {/* Content */}
                <div className="relative flex h-full flex-col items-center justify-center p-6 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="text-sm md:text-base text-white/90 mb-4">
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
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === activeIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
