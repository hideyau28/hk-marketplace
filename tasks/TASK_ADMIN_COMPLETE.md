# TASK: Admin UI 完整修正

> **執行者:** Codex 5.2
> **自主權限:** 完全自主
> **目標:** 修正所有 Admin UI 問題 + Collapsible Sidebar

---

## 執行規則

1. 唔好問問題
2. 遇到 error 先嘗試自己解決
3. 完成後輸出報告

---

## Part 1: 移除 Admin 頁面嘅 Customer TopNav

問題: Admin 頁面頂部仲有 "Search products", "My Collections", "My Orders"

### 方案: 修改 app/[locale]/layout.tsx

喺 layout.tsx 入面，檢查 pathname 係咪 /admin，如果係就唔 render TopNav 同 BottomTab。
```tsx
// app/[locale]/layout.tsx
// 加入 usePathname 或者用 server component 方式檢查

// 方法 1: 用 headers() 檢查 pathname
import { headers } from "next/headers";

export default async function LocaleLayout({ children, params }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdmin = pathname.includes("/admin");
  
  return (
    <html>
      <body>
        {!isAdmin && <TopNav />}
        {children}
        {!isAdmin && <BottomTab />}
      </body>
    </html>
  );
}
```

或者更簡單：

### 方法 2: 喺 middleware 設置 header

喺 middleware.ts 加：
```tsx
response.headers.set("x-pathname", request.nextUrl.pathname);
```

### 方法 3: 用 Route Groups (推薦)

重組 folder structure:
```
app/
  [locale]/
    (customer)/        <- Customer layout with TopNav + BottomTab
      page.tsx         <- Home
      cart/
      checkout/
      ...
    (admin)/           <- Admin layout with Sidebar only
      admin/
        products/
        orders/
        settings/
```

選擇最簡單嘅方法實現，確保 Admin 頁面冇 TopNav 同 BottomTab。

---

## Part 2: 修正 Add Product 按鈕

檔案: `app/[locale]/admin/products/products-table.tsx`

確保 Add Product 按鈕存在同顯示喺正確位置：
```tsx
<div className="mt-6 flex items-center justify-between gap-3">
  <div className="flex-1">
    <select ...>
      ...
    </select>
  </div>
  <button
    onClick={handleCreateProduct}
    className="rounded-xl bg-olive-600 px-4 py-3 text-white font-semibold hover:bg-olive-700 transition-colors"
  >
    + Add Product
  </button>
</div>
```

按鈕要用軍綠色 `bg-olive-600`。

---

## Part 3: 軍綠色 Accent

### 3a. Active Badge (Products)

檔案: `app/[locale]/admin/products/products-table.tsx`

搵 badgeClass function 或者 Active/Inactive badge styling，改為：
```tsx
// Active badge
className="bg-olive-100 text-olive-700 border border-olive-200 rounded-full px-2 py-1 text-xs"

// Inactive badge
className="bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-full px-2 py-1 text-xs"
```

### 3b. PAID Badge (Orders)

檔案: `app/[locale]/admin/orders/orders-table.tsx`

搵 PAID status badge，改為：
```tsx
// PAID badge
className="bg-olive-100 text-olive-700 border border-olive-200 rounded-full px-2 py-1 text-xs font-medium"
```

其他 status badges 可以用：
- PENDING: `bg-yellow-100 text-yellow-700 border-yellow-200`
- CANCELLED: `bg-red-100 text-red-700 border-red-200`
- SHIPPED: `bg-blue-100 text-blue-700 border-blue-200`

### 3c. Sidebar Active State

檔案: `app/[locale]/admin/admin-sidebar.tsx`

確保 active nav item 用：
```tsx
className="bg-olive-600 text-white"
```

---

## Part 4: Collapsible Sidebar

檔案: `app/[locale]/admin/admin-sidebar.tsx`

加入 collapse 功能：
```tsx
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
    <aside className={`${collapsed ? "w-16" : "w-64"} min-h-screen bg-zinc-900 text-white relative transition-all duration-300`}>
      {/* Logo */}
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

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
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

      {/* Logout */}
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
```

---

## Part 5: 更新 Admin Layout

檔案: `app/[locale]/admin/layout.tsx`

確保 main content area 配合 sidebar width 變化：
```tsx
import { ReactNode } from "react";
import AdminSidebar from "./admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

---

## 驗證
```bash
npm run build
```

Build pass 後：
```bash
git add -A
git commit -m "feat: complete admin UI - collapsible sidebar + olive accents + remove customer nav"
```

---

## 完成報告格式
```
## Admin Complete - Done

### Status: SUCCESS / FAILED

### Changes:
- [ ] Customer TopNav removed from Admin
- [ ] Add Product button visible (olive color)
- [ ] Active/PAID badges use olive color
- [ ] Sidebar active state uses olive
- [ ] Collapsible sidebar implemented

### Build: SUCCESS / FAILED
### Commit: [hash]

### Issues:
- (list any)
```

