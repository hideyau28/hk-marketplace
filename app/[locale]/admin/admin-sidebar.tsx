"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { Package, ShoppingCart, Settings, LogOut } from "lucide-react";

const navItems = [
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
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
    <aside className="w-64 min-h-screen bg-zinc-900 text-white relative">
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold">HK•Market</h1>
        <p className="text-zinc-400 text-sm mt-1">Admin Panel</p>
      </div>

      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const fullHref = `/${locale}${item.href}`;
          const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={fullHref}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-olive-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
