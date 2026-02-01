"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type FilterPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  t: {
    title: string;
    brand: string;
    category: string;
    reset: string;
    showResults: string;
  };
};

const CATEGORY_LABELS: Record<string, Record<Locale, string>> = {
  Shoes: { "zh-HK": "鞋款", en: "Shoes" },
  Tops: { "zh-HK": "上衣", en: "Tops" },
  Pants: { "zh-HK": "褲裝", en: "Pants" },
  Jackets: { "zh-HK": "外套", en: "Jackets" },
  Socks: { "zh-HK": "襪", en: "Socks" },
  Accessories: { "zh-HK": "配件", en: "Accessories" },
};

export default function FilterPanel({ isOpen, onClose, locale, t }: FilterPanelProps) {
  const router = useRouter();
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Fetch filter options on mount
  useEffect(() => {
    if (isOpen) {
      fetch("/api/products/filter-options")
        .then((res) => res.json())
        .then((data) => {
          setBrands(data.brands || []);
          setCategories(data.categories || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  // Fetch count when selection changes
  const fetchCount = useCallback(async () => {
    const params = new URLSearchParams();
    if (selectedBrands.length > 0) {
      params.set("brand", selectedBrands.join(","));
    }
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    }
    const url = `/api/products/filter-counts${params.toString() ? `?${params}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setCount(data.count || 0);
  }, [selectedBrands, selectedCategories]);

  useEffect(() => {
    if (isOpen) {
      fetchCount();
    }
  }, [isOpen, fetchCount]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const reset = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (selectedBrands.length > 0) {
      params.set("brand", selectedBrands.join(","));
    }
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    }
    const queryString = params.toString();
    router.push(`/${locale}/products${queryString ? `?${queryString}` : ""}`);
    onClose();
  };

  const getCategoryLabel = (cat: string) => {
    return CATEGORY_LABELS[cat]?.[locale] || cat;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-zinc-900 rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {t.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="text-center text-zinc-500 py-8">Loading...</div>
          ) : (
            <>
              {/* Brand Section */}
              {brands.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    {t.brand}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => toggleBrand(brand)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          selectedBrands.includes(brand)
                            ? "bg-olive-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Section */}
              {categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    {t.category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          selectedCategories.includes(category)
                            ? "bg-olive-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {getCategoryLabel(category)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            onClick={reset}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            {t.reset}
          </button>
          <button
            onClick={applyFilters}
            className="bg-olive-600 text-white rounded-full px-6 py-2 text-sm font-medium hover:bg-olive-700 transition-colors"
          >
            {t.showResults.replace("{count}", String(count))}
          </button>
        </div>
      </div>
    </>
  );
}
