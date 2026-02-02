"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { isWishlisted, toggleWishlist } from "@/lib/wishlist";
import { Badge } from "./Badge";
import { useCurrency } from "@/lib/currency";

type ProductCardProps = {
  locale: Locale;
  // (reserved) imageAspect could be extended later; currently always square
  p: {
    id: string;
    brand?: string;
    title?: string; // model/short description
    image?: string;
    price?: number;
    originalPrice?: number | null;
    stock?: number;
    badges?: string[];
    // legacy single badge support
    badge?: string;
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
  const { format } = useCurrency();

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

  return (
    <Link
      href={`/${locale}/product/${p.id}`}
      className={`group flex flex-col h-full rounded-2xl ${
        isOnSale
          ? "ring-1 ring-red-200 bg-red-50/30 dark:ring-red-900/50 dark:bg-red-950/20"
          : ""
      }`}
    >
      {/* Image container */}
      <div
        className="relative overflow-hidden rounded-2xl bg-zinc-100 aspect-square dark:bg-zinc-800"
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

      {/* Content (no frame) — 4 lines: brand / desc / price / badges */}
      <div className="pt-2.5">
        {/* 1) Brand (only show if present) */}
        {p.brand ? (
          <div className="text-xs font-medium tracking-wide text-zinc-700 truncate dark:text-zinc-300">
            {p.brand}
          </div>
        ) : null}

        {/* 2) Model / short description (2 lines) */}
        <h3 className={"text-sm text-zinc-900 dark:text-zinc-100 font-medium line-clamp-2 leading-snug " + (p.brand ? "mt-0.5" : "")}>
          {p.title || "—"}
        </h3>

        {/* 3) Price */}
        <div className="mt-1.5 flex items-center gap-2 leading-tight">
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

        {/* 4) Badges - show up to 2 */}
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
      </div>
    </Link>
  );
}
