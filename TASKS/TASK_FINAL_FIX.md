# TASK: Final UI Fix

## 目標
1. 移除 Admin 頁面嘅 Customer TopNav
2. 修正 Add Product 按鈕
3. 加軍綠色 accent

---

## Part 1: 移除 Admin 嘅 Customer TopNav

檔案: `app/[locale]/layout.tsx`

搵到 TopNav component，加 conditional rendering：
- 如果 pathname 包含 `/admin`，唔好 render TopNav 同 BottomTab
- 或者喺 `app/[locale]/admin/layout.tsx` 完全 override parent layout

方法：喺 admin layout.tsx 加返完整 html structure，唔好用 parent layout。
```tsx
// app/[locale]/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-zinc-50 flex">
          <AdminSidebar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
```

或者用 route groups 分開 admin 同 customer layouts。

---

## Part 2: 修正 Add Product 按鈕

檔案: `app/[locale]/admin/products/products-table.tsx`

確保 Add Product 按鈕存在同顯示：
```tsx
<button
  onClick={handleCreateProduct}
  className="rounded-xl bg-olive-600 px-4 py-2 text-white font-semibold hover:bg-olive-700"
>
  + Add Product
</button>
```

---

## Part 3: 軍綠色 Accent

### Orders PAID Badge
檔案: `app/[locale]/admin/orders/orders-table.tsx`

搵 PAID badge，改為：
```tsx
className="bg-olive-100 text-olive-700 border border-olive-200"
```

### Active Badge (Products)
檔案: `app/[locale]/admin/products/products-table.tsx`

Active badge 改為：
```tsx
className="bg-olive-100 text-olive-700 border border-olive-200"
```

### Sidebar Active State
確保 `app/[locale]/admin/admin-sidebar.tsx` 用 `bg-olive-600`

---

## 驗證
```bash
npm run build
git add -A
git commit -m "fix: remove customer nav from admin + olive accents"
```

---

## 報告格式
```
## Final Fix - Complete
### Status: SUCCESS/FAILED
### Changes:
- Customer Nav removed from Admin
- Add Product button visible
- Olive accent on badges
- Build: SUCCESS
- Commit: [hash]
```

