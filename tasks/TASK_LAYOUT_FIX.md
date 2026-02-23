# TASK: Layout 結構修正

> **執行者:** Codex 5.2
> **目標:** 徹底分離 Admin 同 Customer Layout

---

## 執行規則

1. 唔好問問題
2. 遇到 error 先嘗試自己解決
3. 完成後輸出報告

---

## 問題分析

現況：Admin 頁面顯示咗 Customer 嘅 TopNav 同 BottomTab
原因：app/[locale]/layout.tsx 統一 render 咗 TopNav 同 BottomTab

---

## 解決方案：Route Groups

將 app/[locale] 拆分成兩個 route groups：
- (customer) — 有 TopNav + BottomTab
- (admin) — 只有 Admin Sidebar

### 最終結構
```
app/
  [locale]/
    (customer)/
      layout.tsx      <- 有 TopNav + BottomTab
      page.tsx        <- 首頁
      cart/
      checkout/
      search/
      profile/
      product/
      orders/
      collections/
    (admin)/
      layout.tsx      <- 只有 Admin Sidebar，冇 TopNav/BottomTab
      admin/
        login/
          layout.tsx  <- Login 頁面冇 Sidebar
          page.tsx
        products/
        orders/
        settings/
```

---

## Step 1: 建立 (customer) route group
```bash
mkdir -p "app/[locale]/(customer)"
```

將以下檔案/資料夾移入 (customer)：
- page.tsx (首頁)
- cart/
- checkout/
- search/
- profile/
- product/
- orders/ (customer orders，唔係 admin orders)
- collections/

---

## Step 2: 建立 (customer)/layout.tsx
```tsx
import { ReactNode } from "react";
import TopNav from "@/components/TopNav";
import BottomTab from "@/components/BottomTab";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNav />
      <main className="pb-16">
        {children}
      </main>
      <BottomTab />
    </>
  );
}
```

---

## Step 3: 建立 (admin) route group
```bash
mkdir -p "app/[locale]/(admin)"
```

將 admin/ 資料夾移入 (admin)：
- admin/products/
- admin/orders/
- admin/settings/
- admin/login/

---

## Step 4: 建立 (admin)/layout.tsx
```tsx
import { ReactNode } from "react";
import AdminSidebar from "./admin/admin-sidebar";

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

注意：admin-sidebar.tsx 需要移到正確位置或者 import path 要更新。

---

## Step 5: Admin Login 獨立 Layout

Login 頁面唔應該有 Sidebar。

建立 `app/[locale]/(admin)/admin/login/layout.tsx`:
```tsx
import { ReactNode } from "react";

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      {children}
    </div>
  );
}
```

---

## Step 6: 更新 app/[locale]/layout.tsx

原本嘅 layout.tsx 變成只處理 html/body 同 global providers：
```tsx
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <html>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

移除 TopNav 同 BottomTab（已經喺 customer layout 處理）。

---

## Step 7: 更新 Admin Sidebar 路徑

如果 admin-sidebar.tsx 位置改變，更新 import paths。

建議將 admin-sidebar.tsx 放喺：
`app/[locale]/(admin)/admin/admin-sidebar.tsx`

或者放喺 components/ 入面：
`components/admin/AdminSidebar.tsx`

---

## Step 8: 修正 Add Product 按鈕

確保 `app/[locale]/(admin)/admin/products/products-table.tsx` 有 Add Product 按鈕：
```tsx
<div className="mt-6 flex items-center justify-between gap-3">
  <select ...>...</select>
  <button
    onClick={handleCreateProduct}
    className="rounded-xl bg-olive-600 px-4 py-3 text-white font-semibold hover:bg-olive-700"
  >
    + Add Product
  </button>
</div>
```

---

## Step 9: 驗證路由

確保以下路由正常：

Customer:
- /en -> 首頁
- /en/cart -> 購物車
- /en/checkout -> 結帳
- /en/search -> 搜尋
- /en/orders -> 客戶訂單
- /en/product/[id] -> 產品詳情

Admin:
- /en/admin/login -> 登入（冇 sidebar）
- /en/admin/products -> 產品管理（有 sidebar）
- /en/admin/orders -> 訂單管理（有 sidebar）
- /en/admin/settings -> 設定（有 sidebar）

---

## 驗證
```bash
npm run build
```

Build pass 後：
```bash
git add -A
git commit -m "refactor: separate admin and customer layouts using route groups"
```

---

## 完成報告
```
## Layout Fix - Complete

### Status: SUCCESS / FAILED

### Changes:
- [ ] Created (customer) route group
- [ ] Created (admin) route group
- [ ] Customer layout has TopNav + BottomTab
- [ ] Admin layout has Sidebar only
- [ ] Admin login has no Sidebar
- [ ] Add Product button visible

### Routes verified:
- [ ] /en (home)
- [ ] /en/admin/login
- [ ] /en/admin/products
- [ ] /en/admin/orders

### Build: SUCCESS / FAILED
### Commit: [hash]
```

