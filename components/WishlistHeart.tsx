"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const WISHLIST_KEY = "hk-wishlist";

function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

function setWishlist(ids: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
}

type Props = {
  productId: string;
  size?: "sm" | "md";
};

export default function WishlistHeart({ productId, size = "md" }: Props) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setIsWishlisted(getWishlist().includes(productId));
  }, [productId]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = getWishlist();
    let updated: string[];
    if (current.includes(productId)) {
      updated = current.filter((id) => id !== productId);
      setIsWishlisted(false);
    } else {
      updated = [...current, productId];
      setIsWishlisted(true);
    }
    setWishlist(updated);
    // Dispatch event for other components to sync
    window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: updated }));
  };

  const circleSize = size === "sm" ? "w-6 h-6" : "w-7 h-7";
  const iconSize = size === "sm" ? 14 : 18;

  return (
    <button
      onClick={toggle}
      className={`absolute top-2 right-2 ${circleSize} bg-white/90 dark:bg-zinc-800/90 rounded-full flex items-center justify-center shadow-sm z-10 transition-transform hover:scale-110 active:scale-95`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={iconSize}
        className={
          isWishlisted
            ? "text-red-500 fill-red-500"
            : "text-zinc-400"
        }
      />
    </button>
  );
}
