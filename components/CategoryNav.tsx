"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function CategoryNav({ locale, filterTranslations }: CategoryNavProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();

  const isZh = locale === "zh-HK";

  const defaultFilterTranslations = {
    title: isZh ? "篩選" : "Filter",
    category: isZh ? "種類" : "Category",
    reset: isZh ? "重置" : "Reset",
    showResults: isZh ? "顯示 {count} 件結果" : "Show {count} results",
  };

  const t = filterTranslations || defaultFilterTranslations;

  const quickPills = [
    { key: "hot", label: isZh ? "熱賣" : "Hot", href: `/${locale}/products?sort=popular`, isHot: true },
    { key: "sale", label: isZh ? "減價" : "Sale", href: `/${locale}/products?sale=true`, isSale: true },
    { key: "men", label: isZh ? "男裝" : "Men", href: `/${locale}/products?shoeType=adult` },
    { key: "women", label: isZh ? "女裝" : "Women", href: `/${locale}/products?shoeType=womens` },
    { key: "kids", label: isZh ? "童裝" : "Kids", href: `/${locale}/products?shoeType=grade_school,preschool,toddler` },
  ];

  return (
    <>
      <div className="sticky top-[57px] z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto max-w-6xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            {/* Filter pill - olive green */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0 bg-olive-600 text-white hover:bg-olive-700"
            >
              {isZh ? "篩選" : "Filter"}
            </button>

            {/* Quick pills */}
            {quickPills.map((pill) => (
              <button
                key={pill.key}
                onClick={() => router.push(pill.href)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0 ${
                  pill.isHot
                    ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                    : pill.isSale
                    ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {pill.label}
              </button>
            ))}
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
