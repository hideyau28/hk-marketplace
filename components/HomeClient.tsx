"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import ProductRail from "@/components/ProductRail";
import BrandFilter from "@/components/BrandFilter";

type Product = {
  id: string;
  brand: string;
  title: string;
  price: number;
  image: string;
  stock?: number;
  badges: any[];
};

export default function HomeClient({
  locale,
  allProducts,
  t,
}: {
  locale: Locale;
  allProducts: Product[];
  t: any;
}) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const filteredProducts = selectedBrand
    ? allProducts.filter((p) => p.brand === selectedBrand)
    : allProducts;

  // Split into rails
  const rail1 = filteredProducts.slice(0, 8);
  const rail2 = filteredProducts.slice(8, 16);
  const rail3 = filteredProducts.slice(16, 24);
  const rail4 = filteredProducts.slice(24, 32);

  return (
    <>
      <BrandFilter locale={locale} t={t} onBrandChange={setSelectedBrand} />

      {selectedBrand && (
        <div className="px-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {t.home.filteringBy}
            </span>
            <span className="px-3 py-1 bg-olive-100 text-olive-700 rounded-full text-sm font-medium">
              {selectedBrand}
            </span>
            <button
              onClick={() => setSelectedBrand(null)}
              className="text-sm text-zinc-500 hover:text-zinc-700 underline dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {t.home.clear}
            </button>
          </div>
        </div>
      )}

      {rail1.length > 0 && (
        <ProductRail
          locale={locale}
          title={selectedBrand ? `${selectedBrand} Products` : t.home.recentlyViewed}
          products={rail1}
          size="sm"
        />
      )}

      {rail2.length > 0 && (
        <ProductRail locale={locale} title={t.home.forYou} products={rail2} size="lg" />
      )}

      {rail3.length > 0 && (
        <ProductRail
          locale={locale}
          title={t.home.trending}
          products={rail3}
          size="sm"
        />
      )}

      {rail4.length > 0 && (
        <ProductRail
          locale={locale}
          title={t.home.newArrivals}
          products={rail4}
          size="lg"
        />
      )}
    </>
  );
}
