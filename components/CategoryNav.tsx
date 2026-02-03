"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import FilterPanel from "./FilterPanel";

type CategoryNavProps = {
  locale: Locale;
  filterTranslations?: {
    title: string;
    category: string;
    reset: string;
    showResults: string;
  };
};

// Inner component that uses useSearchParams (must be wrapped in Suspense)
function CategoryNavInner({ locale, filterTranslations }: CategoryNavProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isZh = locale === "zh-HK";

  const defaultFilterTranslations = {
    title: isZh ? "篩選" : "Filter",
    category: isZh ? "種類" : "Category",
    reset: isZh ? "重置" : "Reset",
    showResults: isZh ? "顯示 {count} 件結果" : "Show {count} results",
  };

  const t = filterTranslations || defaultFilterTranslations;

  // Read current URL params
  const currentShoeType = searchParams?.get("shoeType") || "";
  const currentBadge = searchParams?.get("badge") || "";
  const currentSale = searchParams?.get("sale") || "";

  // Check if each pill is active
  const isHotActive = currentBadge === "今期熱賣";
  const isSaleActive = currentSale === "true";
  const isMenActive = currentShoeType === "adult";
  const isWomenActive = currentShoeType === "womens";
  const isKidsActive = currentShoeType.includes("grade_school") || currentShoeType.includes("preschool") || currentShoeType.includes("toddler");

  // Toggle filter: if already active, remove it; otherwise add it
  const toggleFilter = (paramName: string, paramValue: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    const currentValue = params.get(paramName);

    // For shoeType pills: they are mutually exclusive (radio behavior)
    // For hot/sale: they can be combined but toggle off when tapped again
    if (paramName === "shoeType") {
      // Radio behavior: if same value, remove. Otherwise set new value
      if (currentValue === paramValue) {
        params.delete("shoeType");
      } else {
        params.set("shoeType", paramValue);
      }
    } else if (paramName === "badge") {
      if (currentValue === paramValue) {
        params.delete("badge");
      } else {
        params.set("badge", paramValue);
      }
    } else if (paramName === "sale") {
      if (currentValue === paramValue) {
        params.delete("sale");
      } else {
        params.set("sale", paramValue);
      }
    }

    // Navigate to products page with updated params
    const queryString = params.toString();
    router.push(`/${locale}/products${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <>
      <div className="sticky top-[57px] z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {/* Filter pill - olive green */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0 bg-olive-600 text-white hover:bg-olive-700"
            >
              {isZh ? "篩選" : "Filter"}
            </button>

            {/* 熱賣 Hot pill */}
            <button
              onClick={() => toggleFilter("badge", "今期熱賣")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0 ${
                isHotActive
                  ? "bg-orange-500 text-white"
                  : "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30"
              }`}
            >
              {isZh ? "熱賣" : "Hot"}
            </button>

            {/* 減價 Sale pill */}
            <button
              onClick={() => toggleFilter("sale", "true")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0 ${
                isSaleActive
                  ? "bg-red-500 text-white"
                  : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
              }`}
            >
              {isZh ? "減價" : "Sale"}
            </button>

            {/* 男裝 Men pill */}
            <button
              onClick={() => toggleFilter("shoeType", "adult")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0 ${
                isMenActive
                  ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {isZh ? "男裝" : "Men"}
            </button>

            {/* 女裝 Women pill */}
            <button
              onClick={() => toggleFilter("shoeType", "womens")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0 ${
                isWomenActive
                  ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {isZh ? "女裝" : "Women"}
            </button>

            {/* 童裝 Kids pill */}
            <button
              onClick={() => toggleFilter("shoeType", "grade_school,preschool,toddler")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0 ${
                isKidsActive
                  ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {isZh ? "童裝" : "Kids"}
            </button>
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

export default function CategoryNav({ locale, filterTranslations }: CategoryNavProps) {
  return (
    <Suspense fallback={
      <div className="sticky top-[57px] z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="rounded-full px-3.5 py-1.5 text-sm font-medium bg-olive-600 text-white">
              {locale === "zh-HK" ? "篩選" : "Filter"}
            </div>
          </div>
        </div>
      </div>
    }>
      <CategoryNavInner locale={locale} filterTranslations={filterTranslations} />
    </Suspense>
  );
}
