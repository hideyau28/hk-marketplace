"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { isWishlisted, toggleWishlist } from "@/lib/wishlist";
import { addToCart } from "@/lib/cart";
import Toast from "./Toast";

type ProductCardProps = {
  locale: Locale;
  p: {
    id: string;
    brand?: string;
    title?: string;
    image?: string;
    price?: number;
    stock?: number;
    badges?: string[];
    promotionBadges?: string[];
    sizes?: Record<string, number> | null;
    badge?: string;
  };
};

// Badge color mapping
const BADGE_COLORS: Record<string, string> = {
  "快將售罄": "bg-red-500 text-white",
  "店長推介": "bg-amber-500 text-white",
  "今期熱賣": "bg-orange-500 text-white",
  "新品上架": "bg-green-500 text-white",
  "限時優惠": "bg-purple-500 text-white",
  "人氣之選": "bg-blue-500 text-white",
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
      />
    </svg>
  );
}

// Animated badge component
function AnimatedBadge({ badges }: { badges: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (badges.length <= 1) return;

    // Animation cycle: fade in 0.5s -> stay 2s -> fade out 0.5s -> pause 1s = 4s total
    const cycleTime = 4000;
    let fadeOutTimeout: NodeJS.Timeout;
    let nextBadgeTimeout: NodeJS.Timeout;

    const interval = setInterval(() => {
      // Start fade out
      setIsVisible(false);

      fadeOutTimeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % badges.length);
        // Small delay before fade in
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
  }, [badges.length]);

  if (badges.length === 0) return null;

  const currentBadge = badges[currentIndex];
  const colorClass = BADGE_COLORS[currentBadge] || "bg-zinc-700 text-white";

  return (
    <div
      className={`px-2 py-1 text-xs font-semibold rounded-lg shadow-sm transition-opacity duration-500 ${colorClass} ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {currentBadge}
    </div>
  );
}

export default function ProductCard({ locale, p }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Compute all badges to display (promotionBadges + auto "快將售罄")
  const displayBadges = useMemo(() => {
    const badges: string[] = [];

    // Add promotion badges
    if (p.promotionBadges && p.promotionBadges.length > 0) {
      badges.push(...p.promotionBadges);
    }

    // Add auto badge for low stock
    const isLowStock = p.stock !== undefined && p.stock !== null && p.stock > 0 && p.stock <= 5;
    if (isLowStock && !badges.includes("快將售罄")) {
      badges.push("快將售罄");
    }

    return badges;
  }, [p.promotionBadges, p.stock]);

  // Get available sizes from the sizes object
  const availableSizes = useMemo(() => {
    if (!p.sizes || typeof p.sizes !== "object") return [];
    return Object.keys(p.sizes);
  }, [p.sizes]);

  useEffect(() => {
    setWishlisted(isWishlisted(p.id));

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as { id?: string; wishlisted?: boolean } | undefined;
      if (detail?.id === p.id && typeof detail.wishlisted === "boolean") {
        setWishlisted(detail.wishlisted);
      }
    };

    window.addEventListener("wishlistUpdated", handleUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleUpdate);
  }, [p.id]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleWishlist(p.id);
    setWishlisted(newState);
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const size = e.target.value;
    setSelectedSize(size);

    if (size) {
      setShowTooltip(true);
      setShowAddButton(true);
      setTimeout(() => setShowTooltip(false), 2000);
    } else {
      setShowAddButton(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedSize) return;

    addToCart({
      productId: p.id,
      title: `${p.title} - ${selectedSize}`,
      unitPrice: p.price || 0,
      imageUrl: p.image,
    });

    setShowToast(true);
    setSelectedSize("");
    setShowAddButton(false);
  };

  return (
    <div className="group flex h-full flex-col">
      <Link
        href={`/${locale}/product/${p.id}`}
        className="flex flex-col transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
      >
        {/* Image container */}
        <div className="relative overflow-hidden rounded-2xl bg-zinc-100 aspect-square">
          {p.image ? (
            <img
              src={p.image}
              alt={p.title || "Product"}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-zinc-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Animated promotion badges - top left */}
          {displayBadges.length > 0 && (
            <div className="absolute top-2 left-2">
              <AnimatedBadge badges={displayBadges} />
            </div>
          )}

          {/* Wishlist heart button */}
          <button
            onClick={handleWishlistClick}
            className={`absolute top-2 right-2 p-1 rounded-full bg-white/70 backdrop-blur shadow-sm hover:bg-white transition-colors ${
              wishlisted ? "text-red-500" : "text-zinc-500 hover:text-zinc-700"
            }`}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <HeartIcon filled={wishlisted} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col pt-2.5">
          {/* Brand */}
          {p.brand && (
            <div className="text-xs font-medium tracking-wide text-zinc-700 truncate">
              {p.brand}
            </div>
          )}

          {/* Title */}
          <h3 className={"text-sm text-zinc-900 font-medium line-clamp-2 leading-snug " + (p.brand ? "mt-0.5" : "")}>
            {p.title || "—"}
          </h3>
        </div>
      </Link>

      {/* Price row with size selector */}
      <div className="mt-auto pt-1.5 flex items-center justify-between gap-2">
        <div className="text-base font-bold text-zinc-900 leading-tight">
          {p.price != null ? `$${p.price.toLocaleString()}` : "—"}
        </div>

        {/* Size dropdown and add button */}
        {availableSizes.length > 0 && (
          <div className="relative flex items-center gap-1">
            <select
              value={selectedSize}
              onChange={handleSizeChange}
              onClick={(e) => e.stopPropagation()}
              className="appearance-none bg-zinc-100 text-zinc-700 text-xs font-medium px-2 py-1 pr-5 rounded-lg cursor-pointer hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-1 focus:ring-olive-500"
            >
              <option value="">尺碼</option>
              {availableSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                點擊加入購物車
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add to cart button - shows after size selection */}
      {showAddButton && selectedSize && (
        <button
          onClick={handleAddToCart}
          className="mt-2 w-full bg-olive-600 text-white text-xs font-semibold py-2 rounded-xl hover:bg-olive-700 transition-colors animate-slide-up"
        >
          加入購物車
        </button>
      )}

      {/* Toast notification */}
      <Toast message="✓ 已加入購物車" show={showToast} onClose={() => setShowToast(false)} />

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
