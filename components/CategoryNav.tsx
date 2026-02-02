"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import FilterPanel from "./FilterPanel";

type QuickPill = {
  key: string;
  label: string;
  labelEn: string;
  href: string;
};

const quickPills: QuickPill[] = [
  { key: "Air Jordan", label: "Air Jordan", labelEn: "Air Jordan", href: "/products?category=Air+Jordan" },
  { key: "Dunk", label: "Dunk / SB", labelEn: "Dunk / SB", href: "/products?category=Dunk+%2F+SB" },
  { key: "Air Force", label: "Air Force", labelEn: "Air Force", href: "/products?category=Air+Force" },
  { key: "Air Max", label: "Air Max", labelEn: "Air Max", href: "/products?category=Air+Max" },
  { key: "Running", label: "跑步", labelEn: "Running", href: "/products?category=Running" },
  { key: "Basketball", label: "籃球", labelEn: "Basketball", href: "/products?category=Basketball" },
];

type CategoryNavProps = {
  locale: Locale;
  filterTranslations?: {
    title: string;
    brand: string;
    category: string;
    reset: string;
    showResults: string;
  };
};

export default function CategoryNav({ locale, filterTranslations }: CategoryNavProps) {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handlePillClick = (pill: QuickPill) => {
    router.push(`/${locale}${pill.href}`);
  };

  const filterLabel = locale === "zh-HK" ? "篩選" : "Filter";

  const defaultFilterTranslations = {
    title: locale === "zh-HK" ? "篩選" : "Filter",
    brand: locale === "zh-HK" ? "品牌" : "Brand",
    category: locale === "zh-HK" ? "種類" : "Category",
    reset: locale === "zh-HK" ? "重置" : "Reset",
    showResults: locale === "zh-HK" ? "顯示 {count} 件結果" : "Show {count} results",
  };

  const t = filterTranslations || defaultFilterTranslations;

  return (
    <>
      <div className="sticky top-[57px] z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 [-webkit-overflow-scrolling:touch] scrollbar-hide">
            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="shrink-0 flex items-center gap-1.5 bg-olive-600 text-white rounded-full px-4 py-1.5 text-sm font-medium"
            >
              <SlidersHorizontal size={16} />
              <span>{filterLabel}</span>
              <ChevronDown size={14} />
            </button>

            {/* Quick Pills */}
            {quickPills.map((pill) => {
              const label = locale === "zh-HK" ? pill.label : pill.labelEn;
              return (
                <button
                  key={pill.key}
                  onClick={() => handlePillClick(pill)}
                  className="shrink-0 rounded-full px-4 py-1.5 text-sm bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {label}
                </button>
              );
            })}

            {/* Peek spacer */}
            <div className="w-4 shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        locale={locale}
        t={t}
      />
    </>
  );
}
