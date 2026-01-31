"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { Package, ShoppingCart, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

const navItems = [
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "en";

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push(`/${locale}/admin/login`);
    router.refresh();
  };

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} min-h-screen bg-zinc-900 text-white relative transition-all duration-300`}
    >
      <div className={`p-4 border-b border-zinc-800 ${collapsed ? "px-2" : "p-6"}`}>
        {collapsed ? (
          <div className="w-8 h-8 bg-olive-600 rounded-lg flex items-center justify-center font-bold">H</div>
        ) : (
          <>
            <h1 className="text-xl font-bold">HK•Market</h1>
            <p className="text-zinc-400 text-sm mt-1">Admin Panel</p>
          </>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav className="p-2 space-y-1">
        {navItems.map((item) => {
          const fullHref = `/${locale}${item.href}`;
          const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={fullHref}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-olive-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`absolute bottom-0 left-0 ${collapsed ? "w-16" : "w-64"} p-2 border-t border-zinc-800`}>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-3 w-full rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
