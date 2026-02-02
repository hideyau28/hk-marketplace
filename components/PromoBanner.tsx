"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const STORAGE_KEY = "promo-banner-dismissed";

const PROMO_MESSAGES = [
  { emoji: "🎉", text: "訂單滿 $600 免運費！" },
  { emoji: "✓", text: "正品保證 — 每對鞋都係真貨" },
  { emoji: "💬", text: "WhatsApp 客服即時回覆" },
];

export default function PromoBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
  const touchStartX = useRef<number | null>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    setIsOpen(!dismissed);
  }, []);

  // Auto-rotate every 3 seconds
  useEffect(() => {
    if (!isOpen) return;

    const startAutoRotate = () => {
      autoRotateRef.current = setInterval(() => {
        setSlideDirection("left");
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % PROMO_MESSAGES.length);
          setIsAnimating(false);
        }, 300);
      }, 3000);
    };

    startAutoRotate();

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [isOpen]);

  const goToSlide = useCallback((direction: "left" | "right") => {
    if (isAnimating) return;

    // Reset auto-rotate timer
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }

    setSlideDirection(direction);
    setIsAnimating(true);

    setTimeout(() => {
      if (direction === "left") {
        setCurrentIndex((prev) => (prev + 1) % PROMO_MESSAGES.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + PROMO_MESSAGES.length) % PROMO_MESSAGES.length);
      }
      setIsAnimating(false);
    }, 300);

    // Restart auto-rotate
    autoRotateRef.current = setInterval(() => {
      setSlideDirection("left");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % PROMO_MESSAGES.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);
  }, [isAnimating]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Swipe threshold of 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToSlide("left");
      } else {
        goToSlide("right");
      }
    }

    touchStartX.current = null;
  };

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const currentMessage = PROMO_MESSAGES[currentIndex];

  return (
    <div
      className="sticky top-0 z-50 bg-olive-600 text-white overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
        {/* Message container with slide animation */}
        <div className="flex-1 relative h-5 overflow-hidden">
          <div
            className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${
              isAnimating
                ? slideDirection === "left"
                  ? "-translate-x-full opacity-0"
                  : "translate-x-full opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          >
            <p className="text-sm font-semibold text-center whitespace-nowrap">
              {currentMessage.emoji} {currentMessage.text}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close promotion banner"
          className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-1.5 pb-2">
        {PROMO_MESSAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (index !== currentIndex && !isAnimating) {
                setSlideDirection(index > currentIndex ? "left" : "right");
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsAnimating(false);
                }, 300);
              }
            }}
            className={`h-1.5 rounded-full transition-all duration-200 ${
              index === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
            }`}
            aria-label={`Go to message ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
