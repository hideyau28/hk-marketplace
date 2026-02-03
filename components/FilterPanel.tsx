"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type FilterPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  t: {
    title: string;
    category: string;
    reset: string;
    showResults: string;
  };
};

const CATEGORY_LABELS: Record<string, Record<Locale, string>> = {
  "Air Jordan": { "zh-HK": "Air Jordan", en: "Air Jordan" },
  "Dunk / SB": { "zh-HK": "Dunk / SB", en: "Dunk / SB" },
  "Air Max": { "zh-HK": "Air Max", en: "Air Max" },
  "Air Force": { "zh-HK": "Air Force", en: "Air Force" },
  "Running": { "zh-HK": "Running", en: "Running" },
  "Basketball": { "zh-HK": "Basketball", en: "Basketball" },
  Shoes: { "zh-HK": "鞋款", en: "Shoes" },
  Tops: { "zh-HK": "上衣", en: "Tops" },
  Pants: { "zh-HK": "褲裝", en: "Pants" },
  Jackets: { "zh-HK": "外套", en: "Jackets" },
  Socks: { "zh-HK": "襪", en: "Socks" },
  Accessories: { "zh-HK": "配件", en: "Accessories" },
};

// Predefined size lists
const MENS_SIZES = ["US 7", "US 7.5", "US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 10.5", "US 11", "US 11.5", "US 12", "US 13"];
const WOMENS_SIZES = ["US 5", "US 5.5", "US 6", "US 6.5", "US 7", "US 7.5", "US 8", "US 8.5", "US 9", "US 9.5", "US 10"];
const KIDS_SIZES = ["GS (3.5Y-7Y)", "PS (10.5C-3Y)", "TD (2C-10C)"];

// Price ranges
const PRICE_RANGES = [
  { label: "$0-500", min: 0, max: 500 },
  { label: "$500-800", min: 500, max: 800 },
  { label: "$800-1200", min: 800, max: 1200 },
  { label: "$1200+", min: 1200, max: null },
];

// ShoeType mapping
const SHOE_TYPE_MAP: Record<string, string[]> = {
  adult: ["adult"],
  womens: ["womens"],
  kids: ["grade_school", "preschool", "toddler"],
};

export default function FilterPanel({ isOpen, onClose, locale, t }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedShoeType, setSelectedShoeType] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number | null } | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const isZh = locale === "zh-HK";
  const isSearchPage = pathname?.includes("/search");

  // Fetch filter options on mount
  useEffect(() => {
    if (isOpen) {
      fetch("/api/products/filter-options")
        .then((res) => res.json())
        .then((data) => {
          setCategories(data.categories || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  // Fetch count when selection changes
  const fetchCount = useCallback(async () => {
    const params = new URLSearchParams();

    // Include search query if on search page
    const existingQuery = searchParams?.get("q");
    if (isSearchPage && existingQuery) {
      params.set("q", existingQuery);
    }

    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    }
    if (selectedShoeType) {
      const types = SHOE_TYPE_MAP[selectedShoeType] || [];
      if (types.length > 0) {
        params.set("shoeType", types.join(","));
      }
    }
    if (selectedPriceRange) {
      params.set("minPrice", String(selectedPriceRange.min));
      if (selectedPriceRange.max !== null) {
        params.set("maxPrice", String(selectedPriceRange.max));
      }
    }
    if (selectedSizes.length > 0) {
      params.set("sizes", selectedSizes.join(","));
    }
    const url = `/api/products/filter-counts${params.toString() ? `?${params}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setCount(data.count || 0);
  }, [selectedCategories, selectedShoeType, selectedPriceRange, selectedSizes, searchParams, isSearchPage]);

  useEffect(() => {
    if (isOpen) {
      fetchCount();
    }
  }, [isOpen, fetchCount]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const selectShoeType = (type: string) => {
    if (selectedShoeType === type) {
      setSelectedShoeType(null);
      setSelectedSizes([]); // Clear sizes when deselecting shoe type
    } else {
      setSelectedShoeType(type);
      setSelectedSizes([]); // Clear sizes when changing shoe type
    }
  };

  const selectPriceRange = (range: { min: number; max: number | null }) => {
    if (selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max) {
      setSelectedPriceRange(null);
    } else {
      setSelectedPriceRange(range);
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const reset = () => {
    setSelectedCategories([]);
    setSelectedShoeType(null);
    setSelectedPriceRange(null);
    setSelectedSizes([]);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    // Preserve search query if on search page
    const existingQuery = searchParams?.get("q");
    if (isSearchPage && existingQuery) {
      params.set("q", existingQuery);
    }

    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    }
    if (selectedShoeType) {
      const types = SHOE_TYPE_MAP[selectedShoeType] || [];
      if (types.length > 0) {
        params.set("shoeType", types.join(","));
      }
    }
    if (selectedPriceRange) {
      params.set("minPrice", String(selectedPriceRange.min));
      if (selectedPriceRange.max !== null) {
        params.set("maxPrice", String(selectedPriceRange.max));
      }
    }
    if (selectedSizes.length > 0) {
      params.set("sizes", selectedSizes.join(","));
    }
    const queryString = params.toString();

    // Stay on current page (search or products)
    const targetPath = isSearchPage ? `/${locale}/search` : `/${locale}/products`;
    const newUrl = `${targetPath}${queryString ? `?${queryString}` : ""}`;

    // Close panel first for better UX
    onClose();

    // Navigate and refresh to ensure server component re-renders
    router.push(newUrl);
    router.refresh();
  };

  const getCategoryLabel = (cat: string) => {
    return CATEGORY_LABELS[cat]?.[locale] || cat;
  };

  // Get sizes based on selected shoe type
  const getAvailableSizes = () => {
    if (!selectedShoeType) return [];
    switch (selectedShoeType) {
      case "adult":
        return MENS_SIZES;
      case "womens":
        return WOMENS_SIZES;
      case "kids":
        return KIDS_SIZES;
      default:
        return [];
    }
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
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-zinc-900 rounded-t-2xl max-h-[80vh] flex flex-col animate-slide-up">
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
              {/* 對象 (ShoeType) Section */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {isZh ? "對象" : "Target"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "adult", label: isZh ? "男裝" : "Men" },
                    { key: "womens", label: isZh ? "女裝" : "Women" },
                    { key: "kids", label: isZh ? "童裝" : "Kids" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => selectShoeType(item.key)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedShoeType === item.key
                          ? "bg-olive-600 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Section */}
              {categories.length > 0 && (
                <div className="mb-6">
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

              {/* 價錢範圍 (Price Range) Section */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {isZh ? "價錢範圍" : "Price Range"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => selectPriceRange({ min: range.min, max: range.max })}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max
                          ? "bg-olive-600 text-white"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 尺碼 (Size) Section - Only show when shoe type is selected */}
              {selectedShoeType && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    {isZh ? "尺碼" : "Size"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableSizes().map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-2 py-1 text-xs rounded-full transition-colors ${
                          selectedSizes.includes(size)
                            ? "bg-olive-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {size}
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
