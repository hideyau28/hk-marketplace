"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { LayoutDashboard, LayoutGrid, Package, ShoppingCart, Settings, LogOut, X, ScrollText, Ticket, CreditCard } from "lucide-react";
import { useSidebar } from "@/components/admin/SidebarContext";
import { getDict, type Locale } from "@/lib/i18n";
import { useTenantBranding } from "@/lib/tenant-branding";
import OrdersBadge from "@/components/admin/OrdersBadge";

export default function AdminSidebar() {
  const sidebar = useSidebar();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "en";
  const t = getDict(locale as Locale);
  const tenantBranding = useTenantBranding();

  // Guard: don't render if not in SidebarProvider context
  if (!sidebar) {
    return null;
  }

  const { isOpen, setIsOpen } = sidebar;

  // biolink 模式只顯示基本功能，fullstore 顯示全部
  const allNavItems = [
    { href: "/admin", label: t.admin.sidebar.dashboard, icon: LayoutDashboard, biolink: true },
    { href: "/admin/products", label: t.admin.sidebar.products, icon: Package, biolink: true },
    { href: "/admin/homepage", label: "首頁管理", icon: LayoutGrid, biolink: false },
    { href: "/admin/orders", label: t.admin.sidebar.orders, icon: ShoppingCart, biolink: true },
    { href: "/admin/payments", label: "付款方式", icon: CreditCard, biolink: false },
    { href: "/admin/coupons", label: t.admin.sidebar.coupons, icon: Ticket, biolink: false },
    { href: "/admin/logs", label: t.admin.sidebar.logs, icon: ScrollText, biolink: false },
    { href: "/admin/settings", label: t.admin.sidebar.settings, icon: Settings, biolink: true },
  ];

  const navItems = tenantBranding.mode === "fullstore"
    ? allNavItems
    : allNavItems.filter((item) => item.biolink);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push(`/${locale}/admin/login`);
    router.refresh();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-zinc-900 text-white z-40 transition-transform duration-300 w-56 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-4 pt-4 border-b border-zinc-800">
          <h1 className="text-lg font-bold">{tenantBranding.name}</h1>
          <p className="text-zinc-400 text-sm mt-1">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const fullHref = `/${locale}${item.href}`;
            const isActive = item.href === "/admin"
              ? pathname === fullHref
              : pathname === fullHref || pathname.startsWith(fullHref + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={fullHref}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-olive-600 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.href === "/admin/orders" && <OrdersBadge />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>{t.admin.sidebar.logout}</span>
          </button>
        </div>

        {/* Close button inside sidebar */}
        <button
          onClick={() => setIsOpen(false)}
          aria-label="關閉側邊欄"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X size={18} />
        </button>
      </aside>
    </>
  );
}
