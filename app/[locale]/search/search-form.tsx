"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Locale } from "@/lib/i18n";

export default function SearchForm({
  locale,
  initialQuery,
  placeholder,
}: {
  locale: Locale;
  initialQuery: string;
  placeholder: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    startTransition(() => {
      if (trimmed) {
        router.push(`/${locale}/search?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.push(`/${locale}/search`);
      }
    });
  };

  const handleClear = () => {
    setQuery("");
    startTransition(() => {
      router.push(`/${locale}/search`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <svg
            className="w-5 h-5 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full border border-zinc-200 bg-zinc-100 py-3 pl-11 pr-11 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-400 focus:bg-white focus:outline-none transition-colors"
          autoFocus
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Loading indicator */}
        {isPending && (
          <div className="absolute inset-y-0 right-10 flex items-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
          </div>
        )}
      </div>
    </form>
  );
}
