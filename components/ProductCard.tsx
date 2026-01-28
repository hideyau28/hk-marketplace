"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { Badge } from "./Badge";

type ProductCardProps = {
  locale: Locale;
  imageAspect?: "square" | "landscape";
  p: {
    id: string;
    brand?: string;
    title?: string; // model/short description
    image?: string;
    price?: number;
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

export default function ProductCard({ locale, p, imageAspect = "square" }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(!wishlisted);
  };

  return (
    <Link
      href={`/${locale}/product/${p.id}`}
      className="group block"
    >
      {/* Image container */}
      <div
        className={
          "relative overflow-hidden rounded-2xl bg-zinc-100 " +
          (imageAspect === "landscape" ? "h-[160px]" : "aspect-square")
        }
      >
        {p.image ? (
          <img
            src={p.image}
            alt={p.title || "Product"}
            className={
              "h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 " +
              (imageAspect === "landscape" ? "origin-center" : "")
            }
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
          className={`absolute top-2 right-2 p-1 rounded-full bg-white/70 backdrop-blur shadow-sm hover:bg-white transition-colors ${
            wishlisted ? "text-red-500" : "text-zinc-500 hover:text-zinc-700"
          }`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <HeartIcon filled={wishlisted} />
        </button>
      </div>

      {/* Content (no frame) — 4 lines: brand / desc / price / badges */}
      <div className="pt-3">
        {/* 1) Brand (only show if present) */}
        {p.brand ? (
          <div className="text-xs font-medium tracking-wide text-zinc-700 truncate">
            {p.brand}
          </div>
        ) : null}

        {/* 2) Model / short description (2 lines) */}
        <h3 className={"text-sm text-zinc-900 font-medium line-clamp-2 min-h-[2.5rem] " + (p.brand ? "mt-1" : "") }>
          {p.title || "—"}
        </h3>

        {/* 3) Price */}
        <div className="mt-2 text-lg font-bold text-zinc-900">
          {p.price != null ? `HK$ ${p.price.toLocaleString()}` : "—"}
        </div>

        {/* 4) Badges - show up to 2 */}
        {p.badges && p.badges.length > 0 && (
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {p.badges.slice(0, 2).map((badge, idx) => (
              <Badge key={idx}>{badge}</Badge>
            ))}
          </div>
        )}

        {/* Legacy single badge support */}
        {!p.badges && p.badge && (
          <div className="mt-2">
            <Badge>{p.badge}</Badge>
          </div>
        )}
      </div>
    </Link>
  );
}
