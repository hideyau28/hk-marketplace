"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Search, Clock } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Translations } from "@/lib/translations";

const RECENT_SEARCHES_KEY = "hk-market-recent-searches";
const MAX_RECENT_SEARCHES = 5;

export default function SearchOverlay({
  locale,
  t,
  isOpen,
  onClose,
}: {
  locale: Locale;
  t: Translations;
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch {
          setRecentSearches([]);
        }
      }
      // Auto-focus the input
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const updated = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));

    // Navigate to search page
    router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery)}`);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleRecentClick = (searchQuery: string) => {
    setQuery(searchQuery);
    handleSearch(searchQuery);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white md:hidden dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Close search"
          >
            <X size={20} />
          </button>
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                size={18}
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search.placeholder}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto px-4 py-4">
        {recentSearches.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {t.search.quickSearch}
              </h3>
              <button
                onClick={clearRecent}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                {t.home.clear}
              </button>
            </div>
            <div className="space-y-1">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentClick(search)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Clock size={16} className="flex-shrink-0 text-zinc-400" />
                  <span>{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {recentSearches.length === 0 && (
          <div className="py-12 text-center">
            <Search size={48} className="mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t.search.emptyState}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
