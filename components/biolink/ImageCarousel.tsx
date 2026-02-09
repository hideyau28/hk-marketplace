"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  alt: string;
  /** Aspect ratio class, default aspect-square */
  aspectClass?: string;
  priority?: boolean;
  /** Called when expand icon is tapped, with current image index */
  onExpand?: (index: number) => void;
};

export default function ImageCarousel({
  images,
  alt,
  aspectClass = "aspect-square",
  priority = false,
  onExpand,
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
        {onExpand && (
          <button
            onClick={(e) => { e.stopPropagation(); onExpand(0); }}
            className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center z-10"
            aria-label="Expand image"
          >
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>
        )}
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
      {/* Expand icon */}
      {onExpand && (
        <button
          onClick={(e) => { e.stopPropagation(); onExpand(current); }}
          className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center z-10"
          aria-label="Expand image"
        >
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
      )}
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
