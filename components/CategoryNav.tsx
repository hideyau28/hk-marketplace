"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import type { Locale } from "@/lib/i18n";

type Category = {
  key: string;
  label: string;
  labelEn: string;
};

const categories: Category[] = [
  { key: "all", label: "全部", labelEn: "All" },
  { key: "Shoes", label: "鞋款", labelEn: "Shoes" },
  { key: "Tops", label: "上衣", labelEn: "Tops" },
  { key: "Pants", label: "褲裝", labelEn: "Pants" },
  { key: "Jackets", label: "外套", labelEn: "Jackets" },
  { key: "Socks", label: "襪", labelEn: "Socks" },
  { key: "Accessories", label: "配件", labelEn: "Accessories" },
];

export default function CategoryNav({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams?.get("category") || "all";
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Smooth scroll to active category on mount or category change
  useEffect(() => {
    if (activeButtonRef.current && scrollContainerRef.current) {
      const button = activeButtonRef.current;
      const container = scrollContainerRef.current;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  }, [currentCategory]);

  const handleCategoryClick = (category: Category) => {
    if (category.key === "all") {
      router.push(`/${locale}`);
    } else {
      router.push(`/${locale}?category=${category.key}`);
    }
  };

  return (
    <div className="sticky top-[57px] z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto max-w-6xl">
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto px-4 py-3 [-webkit-overflow-scrolling:touch] scrollbar-hide"
        >
          {categories.map((cat) => {
            const isActive = currentCategory === cat.key;
            const label = locale === "zh-HK" ? cat.label : cat.labelEn;

            return (
              <button
                key={cat.key}
                ref={isActive ? activeButtonRef : null}
                onClick={() => handleCategoryClick(cat)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium min-h-[44px] transition-all ${
                  isActive
                    ? "bg-olive-600 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
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
  );
}
