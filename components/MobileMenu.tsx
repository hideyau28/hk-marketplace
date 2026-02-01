"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Globe, DollarSign, Moon, Sun, Monitor, ChevronRight, Package, Heart, Search } from "lucide-react";
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
  const { mode, resolved, cycleMode } = useTheme();

  const handleLanguageToggle = () => {
    const nextLocale = locale === "zh-HK" ? "en" : "zh-HK";
    window.location.href = swapLocale(pathname, nextLocale);
  };

  const handleCurrencyCycle = () => {
    const currentIndex = currencyOptions.indexOf(currency);
    const nextIndex = (currentIndex + 1) % currencyOptions.length;
    setCurrency(currencyOptions[nextIndex]);
  };

  const getLanguageLabel = () => {
    return locale === "zh-HK" ? "繁體中文" : "English";
  };

  const getLanguageHint = () => {
    return locale === "zh-HK" ? "EN" : "中";
  };

  const getThemeLabel = () => {
    if (mode === "light") return t.mobileMenu.lightMode;
    if (mode === "dark") return t.mobileMenu.darkMode;
    return t.mobileMenu.systemMode;
  };

  const getThemeIcon = () => {
    if (mode === "light") return Sun;
    if (mode === "dark") return Moon;
    return Monitor;
  };

  const ThemeIcon = getThemeIcon();

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
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-64 bg-white shadow-2xl md:hidden dark:bg-zinc-950 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {t.nav.profileTab}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto py-2">
            {/* Settings Section */}
            <div className="px-2">
              {/* Language Row */}
              <button
                onClick={handleLanguageToggle}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Globe size={20} className="flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
                <span className="flex-1 text-left text-sm text-zinc-900 dark:text-zinc-100">
                  {getLanguageLabel()}
                </span>
                <span className="text-sm text-zinc-400">{getLanguageHint()}</span>
              </button>

              {/* Currency Row */}
              <button
                onClick={handleCurrencyCycle}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <DollarSign size={20} className="flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
                <span className="flex-1 text-left text-sm text-zinc-900 dark:text-zinc-100">
                  {currency}
                </span>
                <ChevronRight size={16} className="text-zinc-400" />
              </button>

              {/* Theme Row */}
              <button
                onClick={cycleMode}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <ThemeIcon size={20} className="flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
                <span className="flex-1 text-left text-sm text-zinc-900 dark:text-zinc-100">
                  {getThemeLabel()}
                </span>
                <ChevronRight size={16} className="text-zinc-400" />
              </button>
            </div>

            {/* Divider */}
            <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />

            {/* Navigation Section */}
            <div className="px-2">
              {/* My Orders */}
              <Link
                href={`/${locale}/orders`}
                onClick={onClose}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Package size={20} className="flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
                <span className="flex-1 text-left text-sm text-zinc-900 dark:text-zinc-100">
                  {t.mobileMenu.myOrders}
                </span>
              </Link>

              {/* My Wishlist */}
              <Link
                href={`/${locale}/collections`}
                onClick={onClose}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Heart size={20} className="flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
                <span className="flex-1 text-left text-sm text-zinc-900 dark:text-zinc-100">
                  {t.mobileMenu.myWishlist}
                </span>
              </Link>

              {/* Track Order */}
              <Link
                href={`/${locale}/track`}
                onClick={onClose}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Search size={20} className="flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
                <span className="flex-1 text-left text-sm text-zinc-900 dark:text-zinc-100">
                  {t.mobileMenu.trackOrder}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
