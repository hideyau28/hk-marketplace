"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Heart, Home, Search, ShoppingBag, User } from "lucide-react";

type Tab = {
  key: string;
  href: (locale: string) => string;
  labelZh: string;
  labelEn: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const tabs: Tab[] = [
  {
    key: "home",
    href: (l) => `/${l}`,
    labelZh: "首頁",
    labelEn: "Home",
    Icon: Home,
  },
  {
    key: "search",
    href: (l) => `/${l}/search`,
    labelZh: "搜尋",
    labelEn: "Search",
    Icon: Search,
  },
  {
    key: "wishlist",
    href: (l) => `/${l}/collections`,
    labelZh: "清單",
    labelEn: "Saved",
    Icon: Heart,
  },
  {
    key: "orders",
    href: (l) => `/${l}/orders`,
    labelZh: "訂單",
    labelEn: "Orders",
    Icon: ShoppingBag,
  },
  {
    key: "profile",
    href: (l) => `/${l}/profile`,
    labelZh: "我的",
    labelEn: "Me",
    Icon: User,
  },
];

function isActive(pathname: string, href: string) {
  if (href === pathname) return true;
  // treat subpaths as active for non-home tabs
  if (href !== "/" && pathname.startsWith(href + "/")) return true;
  return false;
}

export default function BottomTab() {
  const pathname = usePathname() || "";
  const params = useParams() as { locale?: string };
  const locale = params?.locale || "zh-HK";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/90 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-5 px-2 py-2">
        {tabs.map((t) => {
          const href = t.href(locale);
          const active = isActive(pathname, href);
          const color = active ? "text-[var(--primary)]" : "text-zinc-500";
          const label = locale === "zh-HK" ? t.labelZh : t.labelEn;

          return (
            <Link
              key={t.key}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 ${color}`}
              aria-current={active ? "page" : undefined}
            >
              <t.Icon size={20} className={color} />
              <span className="text-[11px] leading-none">{label}</span>
              {active && (
                <div className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[var(--primary)] transition-all" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
