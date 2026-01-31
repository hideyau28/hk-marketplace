# TASK: UI 全面優化

> **執行者:** Codex 5.2  
> **自主權限:** 完全自主，唔需要人工介入  
> **目標:** 修正 Admin UI + 更新前台視覺風格

---

## ⚠️ 執行規則

1. **唔好問問題** — 所有決策已經喺呢份文件定義
2. **遇到 error 先嘗試自己解決** — 如果解決唔到，記錄 error 繼續下一步
3. **每步完成後自我驗證** — 確保冇 TypeScript error
4. **最後先 commit** — 所有改動完成 + build pass 先 commit

---

## 📋 執行清單
```
[ ] Part A: Admin UI 修正
  [ ] A1: 建立 Admin Layout（移除 Customer Nav）
  [ ] A2: 建立 Admin Sidebar Navigation
  [ ] A3: 修正 Admin 頁面顏色問題
  [ ] A4: 更新所有 Admin 頁面使用新 Layout

[ ] Part B: 前台 UI 更新
  [ ] B1: 加入軍綠色 accent color 到 Tailwind config
  [ ] B2: 更新 Brand Section（運動品牌）
  [ ] B3: 更新 Category Section（運動類別 + Lucide icons）
  [ ] B4: 更新主要按鈕顏色為軍綠色

[ ] Part C: 驗證
  [ ] C1: npm run build
  [ ] C2: Commit
```

---

# Part A: Admin UI 修正

## A1: 建立 Admin Layout

建立 `app/[locale]/admin/layout.tsx`:
```tsx
import { ReactNode } from "react";
import AdminSidebar from "./admin-sidebar";

export default function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**重點:** Admin layout 唔會 include TopNav 同 BottomTab。

---

## A2: 建立 Admin Sidebar

建立 `app/[locale]/admin/admin-sidebar.tsx`:
```tsx
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
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold">HK•Market</h1>
        <p className="text-zinc-400 text-sm mt-1">Admin Panel</p>
      </div>

      {/* Navigation */}
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

      {/* Logout */}
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
```

---

## A3: 修正 Admin 頁面顏色

更新以下檔案，移除紅色背景，使用正確顏色：

### `app/[locale]/admin/products/page.tsx`

搵所有 `bg-red-` 或 `text-red-` 改為：
- 背景: `bg-zinc-50` 或 `bg-white`
- 文字: `text-zinc-900`
- Error 提示保持紅色

移除以下（如果有）：
- 任何 `TopNav` 或 `BottomTab` import/usage
- 任何重複嘅 logout button（sidebar 已經有）

### `app/[locale]/admin/orders/page.tsx`

同上，確保：
- 背景係 `bg-zinc-50` 或 `bg-white`
- 文字係 `text-zinc-900`
- 移除 TopNav/BottomTab

### `app/[locale]/admin/settings/page.tsx`

同上處理。

---

## A4: 更新 Admin Login 頁面

`app/[locale]/admin/login/page.tsx` 係獨立頁面，唔使用 Admin Layout（因為未登入）。

確保：
- 冇 TopNav / BottomTab
- 背景係 `bg-zinc-50`
- Login form 保持現有樣式

**注意:** Login 頁面需要獨立 layout，唔好用 AdminLayout。

建立 `app/[locale]/admin/login/layout.tsx`:
```tsx
import { ReactNode } from "react";

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      {children}
    </div>
  );
}
```

---

# Part B: 前台 UI 更新

## B1: 加入軍綠色 Accent Color

更新 `tailwind.config.ts` (或 `tailwind.config.js`):
```js
// 喺 theme.extend.colors 加入:
colors: {
  olive: {
    50: '#f7f9f3',
    100: '#ecf4e2',
    200: '#d9e8c5',
    300: '#bdd69e',
    400: '#9ec074',
    500: '#7fa74f',
    600: '#5c7c3a',  // 主色
    700: '#4a6530',
    800: '#3d512a',
    900: '#344526',
    950: '#1a2512',
  },
},
```

如果用 Tailwind v4 CSS 變數格式，加入：
```css
/* 喺 globals.css 或 tailwind config */
--color-olive-50: #f7f9f3;
--color-olive-100: #ecf4e2;
--color-olive-200: #d9e8c5;
--color-olive-300: #bdd69e;
--color-olive-400: #9ec074;
--color-olive-500: #7fa74f;
--color-olive-600: #5c7c3a;
--color-olive-700: #4a6530;
--color-olive-800: #3d512a;
--color-olive-900: #344526;
--color-olive-950: #1a2512;
```

---

## B2: 更新 Brand Section

更新 `components/BrandRail.tsx`:

將現有 brands 改為運動品牌：
```tsx
const brands = [
  { name: "Nike", slug: "nike" },
  { name: "Adidas", slug: "adidas" },
  { name: "Puma", slug: "puma" },
  { name: "Under Armour", slug: "under-armour" },
  { name: "New Balance", slug: "new-balance" },
  { name: "The North Face", slug: "the-north-face" },
  { name: "Columbia", slug: "columbia" },
  { name: "ASICS", slug: "asics" },
];
```

設計每個 brand item：
```tsx
{brands.map((brand) => (
  <Link
    key={brand.slug}
    href={`/${locale}/search?brand=${brand.slug}`}
    className="flex flex-col items-center gap-2"
  >
    <div className="w-16 h-16 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-xl font-bold text-zinc-900 hover:border-olive-600 hover:text-olive-600 transition-colors">
      {brand.name.charAt(0)}
    </div>
    <span className="text-xs text-zinc-600">{brand.name}</span>
  </Link>
))}
```

---

## B3: 更新 Category Section

更新 `components/CategoryGrid.tsx`:

用 Lucide icons：
```tsx
import { Shirt, PersonStanding, Footprints, Snowflake, Watch } from "lucide-react";

const categories = [
  { name: "Tops", slug: "tops", icon: Shirt },
  { name: "Pants", slug: "pants", icon: PersonStanding },
  { name: "Shoes", slug: "shoes", icon: Footprints },
  { name: "Socks", slug: "socks", icon: Footprints },
  { name: "Jackets", slug: "jackets", icon: Snowflake },
  { name: "Accessories", slug: "accessories", icon: Watch },
];
```

設計：
```tsx
{categories.map((cat) => {
  const Icon = cat.icon;
  return (
    <Link
      key={cat.slug}
      href={`/${locale}/collections?category=${cat.slug}`}
      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-zinc-200 hover:border-olive-600 hover:shadow-sm transition-all"
    >
      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
        <Icon size={24} className="text-zinc-600" />
      </div>
      <span className="text-sm text-zinc-900 font-medium">{cat.name}</span>
    </Link>
  );
})}
```

---

## B4: 更新按鈕顏色

將主要按鈕從 `bg-zinc-900` 改為 `bg-olive-600`:

### 需要更新嘅檔案：

1. `components/add-to-cart-button.tsx`
   - `bg-zinc-900 hover:bg-zinc-800` → `bg-olive-600 hover:bg-olive-700`

2. `app/[locale]/cart/page.tsx`
   - Checkout 按鈕

3. `app/[locale]/checkout/page.tsx`
   - Place Order 按鈕

4. `components/HeroCarousel.tsx`
   - CTA 按鈕

**保持 zinc 嘅地方：**
- Admin 按鈕（保持 neutral）
- Secondary 按鈕
- 取消按鈕

---

# Part C: 驗證

## C1: Build 驗證
```bash
npm run build
```

**如果有 error:** 修正後再跑

---

## C2: Commit
```bash
git add -A
git commit -m "feat: UI overhaul - Admin layout + olive accent color

Admin UI:
- Add dedicated admin layout without customer nav
- Add admin sidebar navigation
- Fix admin page styling issues

Frontend UI:
- Add olive color palette for sports brand theme
- Update brand section with sports brands
- Update category section with Lucide icons
- Apply olive accent to primary buttons"
```

---

## 📝 完成報告格式
```
## UI Overhaul - Complete

### Status: SUCCESS / FAILED

### Part A - Admin UI:
- [x] A1: Admin Layout
- [x] A2: Admin Sidebar
- [x] A3: Color fixes
- [x] A4: Page updates

### Part B - Frontend UI:
- [x] B1: Olive color config
- [x] B2: Brand section
- [x] B3: Category section
- [x] B4: Button colors

### Part C - Verification:
- Build: SUCCESS
- Commit: [hash]

### Issues Encountered:
- (list any)
```

---

**END OF TASK**
