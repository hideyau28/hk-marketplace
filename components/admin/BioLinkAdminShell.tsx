"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { Home, ShoppingCart, Settings, LogOut } from "lucide-react";
import { useTenantBranding } from "@/lib/tenant-branding";
import OrdersBadge from "@/components/admin/OrdersBadge";

export default function BioLinkAdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "en";
  const { branding, loading } = useTenantBranding();

  const tabs = [
    { href: `/${locale}/admin`, label: locale === "zh-HK" ? "鋪面" : "Store", icon: Home, exact: true },
    { href: `/${locale}/admin/orders`, label: locale === "zh-HK" ? "訂單" : "Orders", icon: ShoppingCart, exact: false, badge: true },
    { href: `/${locale}/admin/settings`, label: locale === "zh-HK" ? "設定" : "Settings", icon: Settings, exact: false },
  ];

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push(`/${locale}/admin/login`);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-wlx-cream pb-20">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-wlx-mist px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {loading ? (
            <>
              <div className="w-8 h-8 rounded-lg bg-wlx-mist animate-pulse" />
              <div className="h-4 w-28 bg-wlx-mist rounded animate-pulse" />
            </>
          ) : (
            <>
              <div
                className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: branding.themeColor || "#1A1A1A" }}
              >
                {branding.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-wlx-ink text-sm truncate max-w-[200px]">{branding.name}</span>
            </>
          )}
        </div>
        <button
          onClick={handleLogout}
          aria-label="登出"
          className="p-2 rounded-lg text-wlx-stone hover:text-wlx-stone hover:bg-wlx-cream transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* Content */}
      <main>{children}</main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-wlx-mist safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(tab.href + "/");
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors relative ${
                  isActive ? "text-wlx-ink" : "text-wlx-stone"
                }`}
              >
                <div className="relative">
                  <Icon size={22} />
                  {tab.badge && <OrdersBadge />}
                </div>
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <style jsx global>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
      `}</style>
    </div>
  );
}
