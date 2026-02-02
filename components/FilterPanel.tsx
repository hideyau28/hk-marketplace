"use client";

import { useState, useCallback } from "react";
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

/* Gender / shoeType mapping */
const GENDER_OPTIONS: {
  key: string;
  values: string[];
  label: Record<Locale, string>;
}[] = [
  { key: "men", values: ["adult"], label: { "zh-HK": "男裝", en: "Men" } },
  { key: "women", values: ["womens"], label: { "zh-HK": "女裝", en: "Women" } },
  {
    key: "kids",
    values: ["grade_school", "preschool", "toddler"],
    label: { "zh-HK": "童裝", en: "Kids" },
  },
];

/* Category labels */
const CATEGORY_OPTIONS = [
  { key: "Air Jordan", label: { "zh-HK": "Air Jordan", en: "Air Jordan" } },
  { key: "Dunk / SB", label: { "zh-HK": "Dunk / SB", en: "Dunk / SB" } },
  { key: "Air Force", label: { "zh-HK": "Air Force", en: "Air Force" } },
  { key: "Air Max", label: { "zh-HK": "Air Max", en: "Air Max" } },
  { key: "Running", label: { "zh-HK": "跑步", en: "Running" } },
  { key: "Basketball", label: { "zh-HK": "籃球", en: "Basketball" } },
  { key: "Lifestyle", label: { "zh-HK": "休閒", en: "Lifestyle" } },
];

/* Price range presets (HKD) */
const PRICE_RANGES = [
  { key: "0-500", min: 0, max: 500, label: { "zh-HK": "$500 以下", en: "Under $500" } },
  { key: "500-800", min: 500, max: 800, label: { "zh-HK": "$500 – $800", en: "$500 – $800" } },
  { key: "800-1200", min: 800, max: 1200, label: { "zh-HK": "$800 – $1,200", en: "$800 – $1,200" } },
  { key: "1200+", min: 1200, max: 99999, label: { "zh-HK": "$1,200 以上", en: "$1,200+" } },
];

/* Section heading component */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
      {children}
    </h3>
  );
}

/* Pill button component */
function PillButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
        selected
          ? "bg-olive-600 text-white"
          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}

export default function FilterPanel({ isOpen, onClose, locale, t }: FilterPanelProps) {
  const router = useRouter();

  /* Selected state */
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);

  /* Build query params */
  const buildParams = useCallback(() => {
    const params = new URLSearchParams();

    if (selectedGenders.length > 0) {
      const shoeTypes = selectedGenders.flatMap(
        (g) => GENDER_OPTIONS.find((o) => o.key === g)?.values || []
      );
      params.set("shoeType", shoeTypes.join(","));
    }

    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","));
    }

    if (selectedPriceRange) {
      const range = PRICE_RANGES.find((r) => r.key === selectedPriceRange);
      if (range) {
        params.set("minPrice", String(range.min));
        params.set("maxPrice", String(range.max));
      }
    }

    return params;
  }, [selectedGenders, selectedCategories, selectedPriceRange]);

  /* Toggle helpers */
  const toggle = <T,>(
    list: T[],
    item: T,
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    setter((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

  const togglePriceRange = (key: string) => {
    setSelectedPriceRange((prev) => (prev === key ? null : key));
  };

  /* Reset all */
  const reset = () => {
    setSelectedGenders([]);
    setSelectedCategories([]);
    setSelectedPriceRange(null);
  };

  /* Apply & navigate */
  const applyFilters = () => {
    const params = buildParams();
    const queryString = params.toString();
    router.push(`/${locale}/products${queryString ? `?${queryString}` : ""}`);
    onClose();
  };

  const activeCount =
    selectedGenders.length +
    selectedCategories.length +
    (selectedPriceRange ? 1 : 0);

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
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {t.title}
            </h2>
            {activeCount > 0 && (
              <span className="bg-olive-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* 1) Gender / shoeType */}
          <div>
            <SectionHeading>
              {locale === "zh-HK" ? "對象" : "For"}
            </SectionHeading>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((opt) => (
                <PillButton
                  key={opt.key}
                  label={opt.label[locale]}
                  selected={selectedGenders.includes(opt.key)}
                  onClick={() => toggle(selectedGenders, opt.key, setSelectedGenders)}
                />
              ))}
            </div>
          </div>

          {/* 2) Category */}
          <div>
            <SectionHeading>
              {locale === "zh-HK" ? "系列" : "Collection"}
            </SectionHeading>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <PillButton
                  key={cat.key}
                  label={cat.label[locale]}
                  selected={selectedCategories.includes(cat.key)}
                  onClick={() => toggle(selectedCategories, cat.key, setSelectedCategories)}
                />
              ))}
            </div>
          </div>

          {/* 3) Price Range */}
          <div>
            <SectionHeading>
              {locale === "zh-HK" ? "價格" : "Price"}
            </SectionHeading>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range) => (
                <PillButton
                  key={range.key}
                  label={range.label[locale]}
                  selected={selectedPriceRange === range.key}
                  onClick={() => togglePriceRange(range.key)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 safe-area-bottom">
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
            {locale === "zh-HK" ? "顯示結果" : "Show Results"}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
