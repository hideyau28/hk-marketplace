"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { isWishlisted, toggleWishlist } from "@/lib/wishlist";
import { addToCart } from "@/lib/cart";
import { Badge } from "./Badge";
import { useCurrency } from "@/lib/currency";
import { useToast } from "@/components/Toast";

type ProductCardProps = {
  locale: Locale;
  p: {
    id: string;
    brand?: string;
    title?: string;
    image?: string;
    price?: number;
    originalPrice?: number | null;
    stock?: number;
    badges?: string[];
    badge?: string;
    sizes?: Record<string, number> | null;
  };
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

export default function ProductCard({ locale, p }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [showTooltip, setShowTooltip] = useState(false);
  const { format } = useCurrency();
  const { showToast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);

  // Get available sizes (stock > 0)
  const availableSizes = useMemo(() => {
    if (!p.sizes || typeof p.sizes !== "object") return [];
    return Object.entries(p.sizes)
      .filter(([, stock]) => stock > 0)
      .map(([size]) => size);
  }, [p.sizes]);

  // Calculate sale status
  const isOnSale = p.originalPrice != null && p.price != null && p.originalPrice > p.price;
  const discountPercent = isOnSale
    ? Math.round((1 - p.price! / p.originalPrice!) * 100)
    : 0;

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

  // Hide tooltip after 3s
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => setShowTooltip(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

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
    }
  };

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      showToast("請先揀尺碼");
      return;
    }

    addToCart({
      productId: p.id,
      title: selectedSize ? `${p.title} - ${selectedSize}` : p.title || "",
      unitPrice: p.price || 0,
      imageUrl: p.image,
      size: selectedSize || undefined,
    });

    showToast("✓ 已加入購物車");
    setSelectedSize("");
    setShowTooltip(false);
  };

  // Swipe up detection on image
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const swipeDistance = touchStartY.current - touchEndY;

    // Detect upward swipe (at least 50px)
    if (swipeDistance > 50) {
      e.preventDefault();
      e.stopPropagation();
      handleAddToCart();
    }
  };

  return (
    <div ref={cardRef} className="group flex flex-col h-full">
      <Link
        href={`/${locale}/product/${p.id}`}
        className={`flex flex-col rounded-2xl ${
          isOnSale
            ? "ring-1 ring-red-200 bg-red-50/30 dark:ring-red-900/50 dark:bg-red-950/20"
            : ""
        }`}
      >
        {/* Image container */}
        <div
          className="relative overflow-hidden rounded-2xl bg-zinc-100 aspect-square dark:bg-zinc-800"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
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

          {/* Swipe hint tooltip */}
          {showTooltip && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-zinc-900/90 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap z-10 animate-fade-in">
              ↑ 向上滑加入購物車
            </div>
          )}

          {/* Wishlist heart button */}
          <button
            onClick={handleWishlistClick}
            className={`absolute top-2 right-2 p-3 rounded-full bg-white/70 backdrop-blur shadow-sm hover:bg-white transition-colors dark:bg-zinc-800/70 dark:hover:bg-zinc-800 ${
              wishlisted ? "text-red-500" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-100"
            }`}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <HeartIcon filled={wishlisted} />
          </button>

          {p.stock === 0 && (
            <div className="absolute left-2 top-2 rounded-full bg-zinc-900/80 px-2 py-1 text-xs font-semibold text-white">
              Out of Stock
            </div>
          )}

          {/* Low stock badge with pulse animation */}
          {p.stock !== undefined && p.stock > 0 && p.stock <= 5 && (
            <div
              className="absolute left-2 top-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white"
              style={{
                animation: "lowStockPulse 8s ease-in-out infinite",
              }}
            >
              🔥 快將售罄
            </div>
          )}

          {/* Discount badge - only show when not low stock */}
          {isOnSale && p.stock !== 0 && !(p.stock !== undefined && p.stock > 0 && p.stock <= 5) && (
            <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
              -{discountPercent}%
            </div>
          )}
        </div>

        {/* Content */}
        <div className="pt-2.5">
          {/* Brand */}
          {p.brand ? (
            <div className="text-xs font-medium tracking-wide text-zinc-700 truncate dark:text-zinc-300">
              {p.brand}
            </div>
          ) : null}

          {/* Title */}
          <h3 className={"text-sm text-zinc-900 dark:text-zinc-100 font-medium line-clamp-2 leading-snug " + (p.brand ? "mt-0.5" : "")}>
            {p.title || "—"}
          </h3>
        </div>
      </Link>

      {/* Price row with size selector - outside Link to prevent navigation on select */}
      <div className="mt-auto pt-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 leading-tight">
          {isOnSale ? (
            <>
              <span className="text-sm text-zinc-400 line-through">{format(p.originalPrice!)}</span>
              <span className="text-base font-bold text-red-600">{format(p.price!)}</span>
            </>
          ) : (
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {p.price != null ? format(p.price) : "—"}
            </span>
          )}
        </div>

        {/* Size dropdown */}
        {availableSizes.length > 0 && (
          <div className="relative">
            <select
              value={selectedSize}
              onChange={handleSizeChange}
              onClick={(e) => e.stopPropagation()}
              className="appearance-none bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium px-2 py-1 pr-5 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-1 focus:ring-olive-500"
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
          </div>
        )}
      </div>

      {/* Badges */}
      {p.badges && p.badges.length > 0 && (
        <div className="mt-1.5 flex gap-1.5 flex-wrap">
          {p.badges.slice(0, 2).map((badge, idx) => (
            <Badge key={idx}>{badge}</Badge>
          ))}
        </div>
      )}

      {/* Legacy single badge support */}
      {!p.badges && p.badge && (
        <div className="mt-1.5">
          <Badge>{p.badge}</Badge>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
