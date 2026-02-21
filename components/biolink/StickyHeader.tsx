"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TenantForBioLink } from "@/lib/biolink-helpers";
import { getAvatarFallback } from "@/lib/biolink-helpers";
import { useTemplate } from "@/lib/template-context";
import { type Locale, locales } from "@/lib/i18n";

function swapLocale(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${nextLocale}`;
  if ((locales as readonly string[]).includes(parts[0])) {
    parts[0] = nextLocale;
    return "/" + parts.join("/");
  }
  // Path-based route without locale prefix (e.g. /maysshop) — prepend locale
  return "/" + nextLocale + "/" + parts.join("/");
}

type Props = {
  tenant: TenantForBioLink;
  cartCount: number;
  onCartClick?: () => void;
};

export default function StickyHeader({ tenant, cartCount, onCartClick }: Props) {
  const [visible, setVisible] = useState(false);
  const tmpl = useTemplate();
  const pathname = usePathname() || "/en";
  const locale = (pathname.split("/").filter(Boolean)[0] || "en") as Locale;

  useEffect(() => {
    const handler = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const fallback = getAvatarFallback(tenant);
  const color = tenant.brandColor || tmpl.accent;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 max-w-[480px] mx-auto transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2 backdrop-blur-md border-b border-white/5" style={{ backgroundColor: `${tmpl.bg}E6` }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden">
            {tenant.logoUrl ? (
              <Image
                src={tenant.logoUrl}
                alt={tenant.name}
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {fallback}
              </div>
            )}
          </div>
          <span className="text-sm font-semibold" style={{ color: tmpl.text }}>{tenant.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={swapLocale(pathname, locale === "zh-HK" ? "en" : "zh-HK")}
            className="text-[11px] transition-colors"
            style={{ color: tmpl.subtext }}
          >
            {locale === "zh-HK" ? "EN" : "繁"}
          </Link>
          {cartCount > 0 && (
            <button onClick={onCartClick} className="relative w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: tmpl.accent }}>
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
