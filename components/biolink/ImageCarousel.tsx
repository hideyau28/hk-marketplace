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
      <div className={`${aspectClass} bg-zinc-100 flex items-center justify-center`}>
        <svg className="w-12 h-12 text-zinc-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
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
