"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export default function FloatingSearchPill() {
  const pathname = usePathname() || "";
  const params = useParams() as { locale?: string };
  const locale = params?.locale || "zh-HK";

  // Show only on locale home (e.g. /zh-HK or /en)
  const isHome = pathname === `/${locale}`;

  // Show only while the home top sentinel is visible.
  // This avoids cases where scroll events/scrollY behave unexpectedly (mobile Safari, nested scroll containers).
  const [show, setShow] = useState(true);
  useEffect(() => {
    if (!isHome) return;

    const el = document.getElementById("home-search-sentinel");
    if (!el || typeof IntersectionObserver === "undefined") {
      // Fallback: hide as soon as user scrolls a little.
      const onScroll = () => setShow(window.scrollY < 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const obs = new IntersectionObserver(
      (entries) => {
        setShow(entries[0]?.isIntersecting ?? false);
      },
      { root: null, threshold: 0.01 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [isHome]);

  if (!isHome || !show) return null;

  return (
    <div className="fixed inset-x-0 bottom-[72px] z-40 flex justify-center px-4">
      <Link
        href={`/${locale}/search`}
        className="flex w-full max-w-sm items-center gap-2 rounded-full border border-zinc-200 bg-white/90 px-4 py-3 text-sm text-zinc-600 shadow-sm backdrop-blur"
      >
        <Search size={18} className="text-zinc-500" />
        <span>搜尋</span>
      </Link>
    </div>
  );
}
