"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  startIndex?: number;
  onClose: () => void;
};

export default function ImageLightbox({ images, startIndex = 0, onClose }: Props) {
  const [current, setCurrent] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // Touch tracking refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const initialPinchDist = useRef(0);
  const initialScale = useRef(1);
  const isPinching = useRef(false);
  const isDragging = useRef(false);
  const lastTranslate = useRef({ x: 0, y: 0 });

  // Lock body scroll when lightbox is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Reset zoom when switching images
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    lastTranslate.current = { x: 0, y: 0 };
  }, [current]);

  const goTo = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < images.length) setCurrent(idx);
    },
    [images.length]
  );

  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);

  // Pinch distance helper
  const getPinchDist = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch start
        isPinching.current = true;
        initialPinchDist.current = getPinchDist(e.touches);
        initialScale.current = scale;
      } else if (e.touches.length === 1) {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        if (scale > 1) {
          isDragging.current = true;
        }
      }
    },
    [scale]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isPinching.current && e.touches.length === 2) {
        // Pinch zoom
        const dist = getPinchDist(e.touches);
        const newScale = Math.min(
          4,
          Math.max(1, initialScale.current * (dist / initialPinchDist.current))
        );
        setScale(newScale);
        if (newScale <= 1) {
          setTranslate({ x: 0, y: 0 });
          lastTranslate.current = { x: 0, y: 0 };
        }
      } else if (isDragging.current && e.touches.length === 1 && scale > 1) {
        // Pan while zoomed
        const dx = e.touches[0].clientX - touchStartX.current;
        const dy = e.touches[0].clientY - touchStartY.current;
        setTranslate({
          x: lastTranslate.current.x + dx,
          y: lastTranslate.current.y + dy,
        });
      }
    },
    [scale]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (isPinching.current) {
        isPinching.current = false;
        if (scale <= 1) {
          setScale(1);
          setTranslate({ x: 0, y: 0 });
          lastTranslate.current = { x: 0, y: 0 };
        }
        return;
      }

      if (isDragging.current) {
        isDragging.current = false;
        lastTranslate.current = { ...translate };
        return;
      }

      // Swipe detection (only when not zoomed)
      if (scale <= 1 && e.changedTouches.length === 1) {
        const diffX = touchStartX.current - e.changedTouches[0].clientX;
        const diffY = touchStartY.current - e.changedTouches[0].clientY;

        // Only swipe if horizontal movement > vertical (avoid accidental swipes)
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX > 0) goNext();
          else goPrev();
        }
      }
    },
    [scale, translate, goNext, goPrev]
  );

  // Double-tap to zoom/reset
  const lastTap = useRef(0);
  const handleTap = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        // Double tap — toggle zoom
        if (scale > 1) {
          setScale(1);
          setTranslate({ x: 0, y: 0 });
          lastTranslate.current = { x: 0, y: 0 };
        } else {
          setScale(2);
        }
      }
      lastTap.current = now;
    },
    [scale]
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
      {/* Header: close + counter */}
      <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-2 z-10">
        <span className="text-white/70 text-sm font-medium">
          {current + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Image area */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
      >
        <div
          className="relative w-full h-full transition-transform duration-200"
          style={{
            transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
          }}
        >
          <Image
            key={images[current]}
            src={images[current]}
            alt={`Image ${current + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
      </div>

      {/* Bottom dots */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-[env(safe-area-inset-bottom,16px)] pt-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? "w-4 h-2 bg-white"
                  : "w-2 h-2 bg-white/30"
              }`}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
