"use client";

import { useState, useEffect } from "react";
import type { Locale } from "@/lib/i18n";
import type { Translations } from "@/lib/translations";

const brands = [
  "Nike",
  "Adidas",
  "Puma",
  "Under Armour",
  "New Balance",
  "The North Face",
  "Columbia",
  "ASICS",
];

export default function BrandFilter({
  locale,
  t,
  onBrandChange,
}: {
  locale: Locale;
  t: Translations;
  onBrandChange: (brand: string | null) => void;
}) {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const handleBrandClick = (brand: string) => {
    const newBrand = selectedBrand === brand ? null : brand;
    setSelectedBrand(newBrand);
    onBrandChange(newBrand);
  };

  return (
    <section className="mt-8">
      <div className="mb-4 px-4">
        <h2 className="text-zinc-900 text-lg font-semibold dark:text-zinc-100">
          {t.home.popularBrands}
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 [-webkit-overflow-scrolling:touch]">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => handleBrandClick(brand)}
            className={`flex-shrink-0 px-6 py-3 rounded-full font-medium text-sm transition-all ${
              selectedBrand === brand
                ? "bg-olive-600 text-white border-2 border-olive-600"
                : "bg-white text-zinc-900 border-2 border-zinc-200 hover:border-olive-600 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-800"
            }`}
          >
            {brand}
          </button>
        ))}
      </div>
    </section>
  );
}
