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

// Ensure link has locale prefix
function ensureLocalePrefix(href: string, locale: Locale): string {
  if (!href) return href;
  // Already has locale prefix
  if (href.startsWith(`/${locale}/`) || href.startsWith(`/${locale}`)) {
    return href;
  }
  // Absolute path without locale - add prefix
  if (href.startsWith("/")) {
    return `/${locale}${href}`;
  }
  // External URL or other - return as is
  return href;
}

export default function HeroCarouselCMS({
  slides,
  locale,
}: {
  slides: Slide[];
  locale: Locale;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="pt-4">
      <div className="px-4">
        <div className="relative overflow-hidden rounded-3xl">
        {/* Slides Container */}
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide) => {
            const Inner = (
              <div className="relative w-full shrink-0 aspect-[16/9]">
                {!slide.imageUrl && (
                  <div className="absolute inset-0 bg-gradient-to-br from-olive-600 to-olive-700" />
                )}
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

                {/* Content - NO button, just title and subtitle */}
                <div className="relative flex h-full flex-col items-center justify-center p-6 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="text-sm md:text-base text-white/90">
                      {slide.subtitle}
                    </p>
                  )}
                </div>
              </div>
            );

            // If buttonLink exists, wrap in Link with locale prefix
            return slide.buttonLink ? (
              <Link key={slide.key} href={ensureLocalePrefix(slide.buttonLink, locale)} className="block w-full shrink-0">
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
      </div>
    </section>
  );
}
