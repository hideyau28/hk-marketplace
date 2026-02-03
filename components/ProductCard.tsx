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
  // For grid layouts - makes card fill container width
  fillWidth?: boolean;
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

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
}

export default function ProductCard({ locale, p, fillWidth = false }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [showCartIcon, setShowCartIcon] = useState(false);
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
      setShowCartIcon(true);
    } else {
      setShowCartIcon(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
    setShowCartIcon(false);
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
      if (selectedSize) {
        handleAddToCart(e as unknown as React.MouseEvent);
      }
    }
  };

  // Card width classes based on fillWidth prop
  const cardWidthClass = fillWidth
    ? "w-full"
    : "w-[160px] min-w-[160px] max-w-[160px] md:w-[180px] md:min-w-[180px] md:max-w-[180px]";

  return (
    <div
      ref={cardRef}
      className={`group flex flex-col h-full ${cardWidthClass} rounded-2xl overflow-hidden border border-zinc-200/50 bg-white shadow-sm dark:bg-zinc-900 dark:border-zinc-800 ${
        isOnSale
          ? "ring-1 ring-red-200 bg-red-50/30 dark:ring-red-900/50 dark:bg-red-950/20"
          : ""
      }`}
    >
      {/* Image container - with cart icon outside Link to prevent navigation */}
      <div className="relative">
        <Link href={`/${locale}/product/${p.id}`}>
          <div
            className="relative overflow-hidden bg-zinc-100 aspect-square dark:bg-zinc-800"
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
        </Link>

        {/* Wishlist heart button - outside Link */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 p-2 rounded-full bg-white/70 backdrop-blur shadow-sm hover:bg-white transition-colors dark:bg-zinc-800/70 dark:hover:bg-zinc-800 z-10 ${
            wishlisted ? "text-red-500" : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-100"
          }`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon filled={wishlisted} />
        </button>

        {/* Cart icon - outside Link to prevent navigation */}
        {showCartIcon && selectedSize && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#6B7A2F] text-white flex items-center justify-center shadow-lg hover:bg-[#5a6827] transition-all animate-fade-in z-10"
            aria-label="Add to cart"
          >
            <CartIcon />
          </button>
        )}
      </div>

      {/* Content - title links to product, price/size outside Link */}
      <div className="flex flex-col flex-1 p-2.5">
        {/* Brand */}
        {p.brand ? (
          <div className="text-xs font-medium tracking-wide text-zinc-500 truncate dark:text-zinc-400">
            {p.brand}
          </div>
        ) : null}

        {/* Title - wrapped in Link */}
        <Link href={`/${locale}/product/${p.id}`}>
          <h3 className="text-xs text-zinc-900 dark:text-zinc-100 font-medium line-clamp-2 leading-tight min-h-[2rem] mt-0.5 hover:text-olive-600 transition-colors">
            {p.title || "—"}
          </h3>
        </Link>

        {/* Price row with size selector - OUTSIDE Link to prevent navigation */}
        <div
          className="mt-auto pt-2 flex items-center justify-between gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col leading-tight">
            {isOnSale ? (
              <>
                <span className="text-[10px] text-zinc-400 line-through">{format(p.originalPrice!)}</span>
                <span className="text-sm font-bold text-red-600">{format(p.price!)}</span>
              </>
            ) : (
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {p.price != null ? format(p.price) : "—"}
              </span>
            )}
          </div>

          {/* Size dropdown - completely outside Link */}
          {availableSizes.length > 0 && (
            <div
              className="relative"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <select
                value={selectedSize}
                onChange={handleSizeChange}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="appearance-none bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-medium px-1.5 py-1 pr-4 rounded-md cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-1 focus:ring-olive-500"
              >
                <option value="">尺碼 ▼</option>
                {availableSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      {p.badges && p.badges.length > 0 && (
        <div className="px-2.5 pb-2 flex gap-1 flex-wrap">
          {p.badges.slice(0, 2).map((badge, idx) => (
            <Badge key={idx}>{badge}</Badge>
          ))}
        </div>
      )}

      {/* Legacy single badge support */}
      {!p.badges && p.badge && (
        <div className="px-2.5 pb-2">
          <Badge>{p.badge}</Badge>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
