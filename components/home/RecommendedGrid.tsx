"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { isWishlisted, toggleWishlist } from "@/lib/wishlist";
import { useCurrency } from "@/lib/currency";
import SectionTitle from "./SectionTitle";

type Product = {
  id: string;
  brand: string;
  title: string;
  price: number;
  image: string;
};

export default function RecommendedGrid({
  locale,
  products,
  title,
  viewAllText,
}: {
  locale: Locale;
  products: Product[];
  title: string;
  viewAllText: string;
}) {
  const [wishlistState, setWishlistState] = useState<Record<string, boolean>>({});
  const { format: formatPrice } = useCurrency();

  useEffect(() => {
    const state: Record<string, boolean> = {};
    products.forEach((p) => {
      state[p.id] = isWishlisted(p.id);
    });
    setWishlistState(state);
  }, [products]);

  const handleWishlistToggle = (productId: string) => {
    toggleWishlist(productId);
    setWishlistState((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  if (products.length === 0) return null;

  return (
    <section className="py-6">
      <SectionTitle title={title} viewAllText={viewAllText} viewAllHref={`/${locale}`} />
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {products.slice(0, 6).map((product) => (
            <Link
              key={product.id}
              href={`/${locale}/product/${product.id}`}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow dark:bg-zinc-900"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="p-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.brand}</p>
                <h3 className="text-sm font-medium text-zinc-900 line-clamp-1 dark:text-zinc-100">
                  {product.title}
                </h3>
                <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {formatPrice(product.price)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleWishlistToggle(product.id);
                }}
                className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 backdrop-blur-sm dark:bg-zinc-900/90"
              >
                <svg
                  className={`h-4 w-4 ${
                    wishlistState[product.id]
                      ? "fill-red-500 text-red-500"
                      : "fill-none text-zinc-600 dark:text-zinc-400"
                  }`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
