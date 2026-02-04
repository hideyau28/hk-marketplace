"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { Heart, Home, Search, ShoppingBag, User } from "lucide-react";
import type { Translations } from "@/lib/translations";

type Tab = {
  key: string;
  href: (locale: string) => string;
  labelKey: keyof Translations["nav"];
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

const tabs: Tab[] = [
  {
    key: "home",
    href: (l) => `/${l}`,
    labelKey: "home",
    Icon: Home,
  },
  {
  {
    key: "wishlist",
    href: (l) => `/${l}/collections`,
    labelKey: "wishlistTab",
    Icon: Heart,
  },
  {
    key: "orders",
    href: (l) => `/${l}/orders`,
    labelKey: "ordersTab",
    Icon: ShoppingBag,
  },
  {
    key: "profile",
    href: (l) => `/${l}/profile`,
    labelKey: "profileTab",
    Icon: User,
  },
];

function isActive(pathname: string, href: string) {
  if (href === pathname) return true;
  // treat subpaths as active for non-home tabs
  if (href !== "/" && pathname.startsWith(href + "/")) return true;
  return false;
}

export default function BottomTab({ t }: { t: Translations }) {
  const pathname = usePathname() || "";
  const params = useParams() as { locale?: string };
  const locale = params?.locale || "zh-HK";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/90 backdrop-blur pb-[env(safe-area-inset-bottom)] dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto grid max-w-3xl grid-cols-4 px-2 py-2">
        {tabs.map((tab) => {
          const href = tab.href(locale);
          const active = isActive(pathname, href);
          const color = active ? "text-olive-600 dark:text-olive-500" : "text-zinc-500 dark:text-zinc-400";
          const label = t.nav[tab.labelKey];

          return (
            <Link
              key={tab.key}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 ${color}`}
              aria-current={active ? "page" : undefined}
            >
              <tab.Icon size={18} />
              <span className="text-[9px] leading-tight font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
