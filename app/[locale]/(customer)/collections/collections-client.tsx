"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";
import { getWishlist } from "@/lib/wishlist";

type Product = {
  id: string;
  brand?: string;
  title: string;
  image?: string;
  price: number;
  stock?: number;
  badges?: string[];
};

type CollectionsClientProps = {
  locale: Locale;
  allProducts: Product[];
};

export function CollectionsClient({ locale, allProducts }: CollectionsClientProps) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWishlistIds(getWishlist());

    const handleUpdate = () => {
      setWishlistIds(getWishlist());
    };

    window.addEventListener("wishlistUpdated", handleUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleUpdate);
  }, []);

  if (!mounted) {
    return <div className="mt-8 text-center text-zinc-500">Loading...</div>;
  }

  const wishlistedProducts = allProducts.filter((p) => wishlistIds.includes(p.id));

  if (wishlistedProducts.length === 0) {
    return (
      <div className="mt-12 text-center">
        <div className="text-6xl mb-4">💝</div>
        <h2 className="text-lg font-medium text-zinc-900">
          {locale === "zh-HK" ? "清單仲係空嘅" : "Your wishlist is empty"}
        </h2>
        <p className="mt-2 text-zinc-500 text-sm">
          {locale === "zh-HK"
            ? "撳商品上嘅心形圖示就可以加入清單"
            : "Tap the heart icon on products to save them here"}
        </p>
        <Link
          href={`/${locale}`}
          className="mt-6 inline-block rounded-full bg-olive-600 px-6 py-3 text-sm font-medium text-white hover:bg-olive-700 transition"
        >
          {locale === "zh-HK" ? "去逛逛" : "Browse products"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {wishlistedProducts.map((p) => (
        <ProductCard key={p.id} locale={locale} p={p} />
      ))}
    </div>
  );
}
