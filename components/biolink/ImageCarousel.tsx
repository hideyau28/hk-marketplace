"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  alt: string;
  /** Aspect ratio class, default aspect-square */
  aspectClass?: string;
  priority?: boolean;
};

export default function ImageCarousel({
  images,
  alt,
  aspectClass = "aspect-square",
  priority = false,
}: Props) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        if (diff > 0 && current < images.length - 1) {
          setCurrent((p) => p + 1);
        } else if (diff < 0 && current > 0) {
          setCurrent((p) => p - 1);
        }
      }
    },
    [current, images.length]
  );

  if (images.length === 0) {
    return (
      <div className={`${aspectClass} bg-zinc-800 flex items-center justify-center`}>
        <span className="text-zinc-600 text-2xl font-bold">{alt.charAt(0)}</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={`relative ${aspectClass} overflow-hidden`}>
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
          sizes="(max-width: 480px) 100vw, 240px"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${aspectClass} overflow-hidden touch-pan-y`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, i) => (
          <div key={src} className="relative w-full h-full flex-shrink-0">
            <Image
              src={src}
              alt={`${alt} ${i + 1}`}
              fill
              className="object-cover"
              priority={priority && i === 0}
              loading={i === 0 ? undefined : "lazy"}
              sizes="(max-width: 480px) 100vw, 240px"
            />
          </div>
        ))}
      </div>
      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === current ? "bg-white w-3" : "bg-white/40"
            }`}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
