"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  children: { id: string; name: string; slug: string }[];
};

type CategoryBrowseNavProps = {
  locale: Locale;
};

export default function CategoryBrowseNav({ locale }: CategoryBrowseNavProps) {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((res) => {
        if (res?.ok && res.data?.categories) {
          setCategories(res.data.categories);
        }
      })
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  // Determine which category slug is currently active from the URL
  const activeSlug = pathname?.match(/\/categories\/([^/]+)/)?.[1] ?? null;

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="border-b border-zinc-100 bg-white/80 backdrop-blur dark:border-zinc-800/50 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-6xl px-4 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => {
            const isActive = activeSlug === cat.slug;
            const isExpanded = expandedId === cat.id;
            const hasChildren = cat.children.length > 0;

            return (
              <div key={cat.id} className="relative shrink-0">
                <div className="flex items-center">
                  <Link
                    href={`/${locale}/categories/${cat.slug}`}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? "text-white"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                    style={isActive ? { backgroundColor: "var(--tmpl-accent, #2D6A4F)" } : undefined}
                  >
                    {cat.name}
                  </Link>
                  {hasChildren && (
                    <button
                      onClick={() => handleToggle(cat.id)}
                      className="ml-0.5 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                      aria-label="Show sub-categories"
                    >
                      <svg
                        className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Children dropdown */}
                {hasChildren && isExpanded && (
                  <div className="absolute top-full left-0 mt-1 z-50 min-w-[140px] rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                    {cat.children.map((child) => {
                      const isChildActive = activeSlug === child.slug;
                      return (
                        <Link
                          key={child.id}
                          href={`/${locale}/categories/${child.slug}`}
                          onClick={() => setExpandedId(null)}
                          className={`block px-3 py-2 text-xs font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            isChildActive
                              ? "text-white"
                              : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          }`}
                          style={isChildActive ? { backgroundColor: "var(--tmpl-accent, #2D6A4F)" } : undefined}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
