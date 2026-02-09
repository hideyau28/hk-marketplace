"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import VideoEmbed from "./VideoEmbed";

type Props = {
  images: string[];
  alt: string;
  /** Aspect ratio class, default aspect-square */
  aspectClass?: string;
  priority?: boolean;
  /** 外部控制顯示邊張圖（用於雙維 variant 切換顏色） */
  activeIndex?: number;
  /** 如果有 videoUrl，會喺最後加一個 video slide */
  videoUrl?: string | null;
};

export default function ImageCarousel({
  images,
  alt,
  aspectClass = "aspect-square",
  priority = false,
  activeIndex,
  videoUrl,
}: Props) {
  const totalSlides = images.length + (videoUrl ? 1 : 0);
  const videoSlideIndex = videoUrl ? totalSlides - 1 : -1;

  const [current, setCurrent] = useState(0);

  // 外部 activeIndex 改變時 scroll 到對應圖片
  useEffect(() => {
    if (activeIndex !== undefined && activeIndex >= 0 && activeIndex < images.length) {
      setCurrent(activeIndex);
    }
  }, [activeIndex, images.length]);
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        if (diff > 0 && current < totalSlides - 1) {
          setCurrent((p) => p + 1);
        } else if (diff < 0 && current > 0) {
          setCurrent((p) => p - 1);
        }
      }
    },
    [current, totalSlides]
  );

  if (totalSlides === 0) {
    return (
      <div className={`${aspectClass} bg-zinc-800 flex items-center justify-center`}>
        <span className="text-zinc-600 text-2xl font-bold">{alt.charAt(0)}</span>
      </div>
    );
  }

  if (totalSlides === 1 && !videoUrl) {
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

  // Single video only, no images
  if (totalSlides === 1 && videoUrl) {
    return (
      <div className={`relative ${aspectClass} overflow-hidden`}>
        <VideoEmbed videoUrl={videoUrl} />
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
        {/* Video slide at end */}
        {videoUrl && (
          <div className="relative w-full h-full flex-shrink-0">
            {current === videoSlideIndex ? (
              <VideoEmbed videoUrl={videoUrl} />
            ) : (
              <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-white ml-1" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === current
                ? "bg-white w-3"
                : "bg-white/40"
            } ${i === videoSlideIndex ? "ring-1 ring-white/30" : ""}`}
            aria-label={i === videoSlideIndex ? "Video" : `Image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
