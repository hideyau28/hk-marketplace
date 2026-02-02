"use client";

import { useEffect, useState } from "react";

// Badge color mapping
const BADGE_COLORS: Record<string, string> = {
  "快將售罄": "bg-red-500 text-white",
  "店長推介": "bg-amber-500 text-white",
  "今期熱賣": "bg-orange-500 text-white",
  "新品上架": "bg-green-500 text-white",
  "限時優惠": "bg-purple-500 text-white",
  "人氣之選": "bg-blue-500 text-white",
};

type ProductBadgesProps = {
  promotionBadges: string[];
  isLowStock: boolean;
};

export function AnimatedProductBadges({ promotionBadges, isLowStock }: ProductBadgesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Combine promotion badges with auto low stock badge
  const allBadges = [...promotionBadges];
  if (isLowStock && !allBadges.includes("快將售罄")) {
    allBadges.push("快將售罄");
  }

  useEffect(() => {
    if (allBadges.length <= 1) return;

    // Animation cycle: fade in 0.5s -> stay 2s -> fade out 0.5s -> pause 1s = 4s total
    const cycleTime = 4000;
    let fadeOutTimeout: NodeJS.Timeout;
    let nextBadgeTimeout: NodeJS.Timeout;

    const interval = setInterval(() => {
      setIsVisible(false);

      fadeOutTimeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % allBadges.length);
        nextBadgeTimeout = setTimeout(() => {
          setIsVisible(true);
        }, 100);
      }, 500);
    }, cycleTime);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeOutTimeout);
      clearTimeout(nextBadgeTimeout);
    };
  }, [allBadges.length]);

  if (allBadges.length === 0) return null;

  const currentBadge = allBadges[currentIndex];
  const colorClass = BADGE_COLORS[currentBadge] || "bg-zinc-700 text-white";

  return (
    <div className="absolute top-3 left-3 flex flex-col gap-2">
      <div
        className={`px-3 py-1.5 text-sm font-semibold rounded-xl shadow-lg transition-opacity duration-500 ${colorClass} ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {currentBadge}
      </div>
    </div>
  );
}

export default function ProductDetailClient() {
  return null;
}
