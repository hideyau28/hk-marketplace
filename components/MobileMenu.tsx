"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Globe, DollarSign, Moon, Sun, ChevronDown, Package, Heart, Search, Check } from "lucide-react";
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
  const { resolved, setMode } = useTheme();
  const [currencyExpanded, setCurrencyExpanded] = useState(false);

  const handleLanguageToggle = () => {
    const nextLocale = locale === "zh-HK" ? "en" : "zh-HK";
    window.location.href = swapLocale(pathname, nextLocale);
  };

  const handleThemeToggle = () => {
    setMode(resolved === "light" ? "dark" : "light");
  };

  const handleCurrencySelect = (curr: string) => {
    setCurrency(curr as any);
    setCurrencyExpanded(false);
  };

  const getLanguageLabel = () => {
    return locale === "zh-HK" ? "繁中" : "English";
  };

  const getThemeLabel = () => {
    return resolved === "light" ? t.mobileMenu.lightMode : t.mobileMenu.darkMode;
  };

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
        className={`fixed right-0 top-0 bottom-0 z-50 w-44 bg-white shadow-2xl md:hidden dark:bg-zinc-950 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header - Just close button */}
          <div className="flex items-center justify-end border-b border-zinc-200 px-3 py-3 dark:border-zinc-800">
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
                className="flex w-full items-center gap-2 rounded-lg px-3 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Globe size={18} className="flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
                <span className="flex-1 text-left text-sm text-zinc-900 dark:text-zinc-100">
                  {getLanguageLabel()}
                </span>
              </button>

              {/* Theme Row */}
              <button
                onClick={handleThemeToggle}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {resolved === "light" ? (
                  <Sun size={18} className="flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
                ) : (
                  <Moon size={18} className="flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
                )}
                <span className="flex-1 text-left text-sm text-zinc-900 dark:text-zinc-100">
                  {getThemeLabel()}
                </span>
              </button>

              {/* Currency Row */}
              <div>
                <button
                  onClick={() => setCurrencyExpanded(!currencyExpanded)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <DollarSign size={18} className="flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">
                    {currency}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-zinc-400 transition-transform ${
                      currencyExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Currency Dropdown - Only currency codes */}
                {currencyExpanded && (
                  <div className="mt-1 space-y-0.5 px-2">
                    {currencyOptions.map((curr) => (
                      <button
                        key={curr}
                        onClick={() => handleCurrencySelect(curr)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <div className="w-4 flex-shrink-0">
                          {currency === curr && (
                            <Check size={14} className="text-zinc-700 dark:text-zinc-300" />
                          )}
                        </div>
                        <span className="text-sm text-zinc-900 dark:text-zinc-100">
                          {curr}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />

            {/* Navigation Section */}
            <div className="px-2">
              {/* My Orders */}
              <Link
                href={`/${locale}/orders`}
                onClick={onClose}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Package size={18} className="flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
                <span className="flex-1 text-left text-sm text-zinc-900 dark:text-zinc-100">
                  {t.mobileMenu.myOrders}
                </span>
              </Link>

              {/* My Wishlist */}
              <Link
                href={`/${locale}/collections`}
                onClick={onClose}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Heart size={18} className="flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
                <span className="flex-1 text-left text-sm text-zinc-900 dark:text-zinc-100">
                  {t.mobileMenu.myWishlist}
                </span>
              </Link>

              {/* Track Order */}
              <Link
                href={`/${locale}/track`}
                onClick={onClose}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Search size={18} className="flex-shrink-0 text-zinc-500 dark:text-zinc-400" />
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
