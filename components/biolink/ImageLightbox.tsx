"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type Props = {
  images: string[];
  initialIndex: number;
  onClose: () => void;
};

function getTouchDistance(touches: React.TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function ImageLightbox({ images, initialIndex, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const touchStartX = useRef(0);
  const pinchStartDist = useRef(0);
  const pinchStartScale = useRef(1);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
    }
    if (e.touches.length === 2) {
      pinchStartDist.current = getTouchDistance(e.touches);
      pinchStartScale.current = scale;
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches);
      const newScale = pinchStartScale.current * (dist / pinchStartDist.current);
      setScale(Math.max(1, Math.min(newScale, 4)));
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Reset scale on single finger release
    if (e.touches.length === 0 && scale > 1 && e.changedTouches.length === 1) {
      // Only swipe when not zoomed
      if (scale <= 1.1) {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          if (diff > 0 && currentIndex < images.length - 1) {
            setCurrentIndex(prev => prev + 1);
          } else if (diff < 0 && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
          }
        }
      }
      setScale(1);
      return;
    }
    // Swipe detection (not zoomed)
    if (e.touches.length === 0 && scale <= 1.1) {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentIndex < images.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else if (diff < 0 && currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
      }
    }
  }, [currentIndex, images.length, scale]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/95"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Image container */}
      <div
        className="relative w-full h-full flex items-center justify-center touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
          draggable={false}
        />
      </div>

      {/* Desktop navigation arrows */}
      {currentIndex > 0 && (
        <button
          onClick={() => setCurrentIndex(prev => prev - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors hidden md:flex"
          aria-label="Previous"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      {currentIndex < images.length - 1 && (
        <button
          onClick={() => setCurrentIndex(prev => prev + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors hidden md:flex"
          aria-label="Next"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex ? "bg-white w-4" : "bg-white/40"
              }`}
              aria-label={`Image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
