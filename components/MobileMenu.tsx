"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Moon, Sun } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import type { Translations } from "@/lib/translations";
import { currencyOptions, useCurrency } from "@/lib/currency";
import { useTheme } from "@/lib/theme-context";

function swapLocale(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${nextLocale}`;
  parts[0] = nextLocale;
  return "/" + parts.join("/");
}

export default function MobileMenu({
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
  const pathname = usePathname() || `/${locale}`;
  const { currency, setCurrency } = useCurrency();
  const { resolved, cycleMode } = useTheme();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl md:hidden dark:bg-zinc-950">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {t.nav.profileTab}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {/* Language */}
              <div>
                <div className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.mobileMenu.language}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={swapLocale(pathname, "zh-HK")}
                    onClick={onClose}
                    className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors ${
                      locale === "zh-HK"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "border border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    繁中
                  </Link>
                  <Link
                    href={swapLocale(pathname, "en")}
                    onClick={onClose}
                    className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors ${
                      locale === "en"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "border border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    English
                  </Link>
                </div>
              </div>

              {/* Currency */}
              <div>
                <div className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.mobileMenu.currency}
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  {currencyOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dark Mode */}
              <div>
                <div className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.mobileMenu.appearance}
                </div>
                <button
                  type="button"
                  onClick={cycleMode}
                  className="flex w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600"
                >
                  <span className="font-medium">
                    {resolved === "dark" ? t.mobileMenu.darkMode : t.mobileMenu.lightMode}
                  </span>
                  {resolved === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-zinc-200 dark:border-zinc-800" />

              {/* Menu Links */}
              <div className="space-y-1">
                <Link
                  href={`/${locale}/orders`}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {t.nav.orders}
                </Link>
                <Link
                  href={`/${locale}/collections`}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {t.collections.title}
                </Link>
                <Link
                  href={`/${locale}/track`}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {t.mobileMenu.trackOrder}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
