# TASK: UI 修正

> **執行者:** Codex 5.2
> **目標:** 修正 Admin Products styling + 移除 Customer Nav + 加軍綠色 accent

---

## 執行規則

1. 唔好問問題
2. 遇到 error 先嘗試自己解決
3. 完成後輸出報告

---

## Part 1: 修正 Products Table (Light Theme)

檔案: `app/[locale]/admin/products/products-table.tsx`

將所有 dark theme class 改為 light theme:

| 舊 (Dark) | 新 (Light) |
|-----------|------------|
| text-white | text-zinc-900 |
| text-white/60 | text-zinc-500 |
| text-white/70 | text-zinc-600 |
| text-white/80 | text-zinc-700 |
| bg-white/5 | bg-white |
| bg-white/10 | bg-zinc-100 |
| border-white/10 | border-zinc-200 |
| hover:bg-white/5 | hover:bg-zinc-50 |
| hover:bg-white/10 | hover:bg-zinc-100 |
| focus:ring-white/20 | focus:ring-zinc-300 |

Badge class 修正:
- Active badge: `bg-olive-100 text-olive-700 border-olive-200`
- Inactive badge: `bg-zinc-100 text-zinc-600 border-zinc-200`

Select dropdown:
- `bg-white border-zinc-200 text-zinc-900`

Add Product button:
- `bg-olive-600 text-white hover:bg-olive-700`

Edit button:
- `border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50`

---

## Part 2: 修正 Product Modal

檔案: `app/[locale]/admin/products/product-modal.tsx`

同樣將 dark theme 改為 light theme，用相同嘅對照表。

Modal background: `bg-white`
Modal border: `border-zinc-200`
Input fields: `bg-white border-zinc-200 text-zinc-900`
Labels: `text-zinc-700`
Save button: `bg-olive-600 text-white hover:bg-olive-700`
Cancel button: `bg-zinc-100 text-zinc-700 hover:bg-zinc-200`

---

## Part 3: 移除 Admin 頁面嘅 Customer Nav

檢查 `app/[locale]/layout.tsx`，確保 Admin routes 唔會 render TopNav 同 BottomTab。

如果 layout.tsx 入面有 conditional rendering，確保 `/admin` paths 被 exclude。

或者喺 `app/[locale]/admin/layout.tsx` 確保佢 override parent layout，唔 include TopNav/BottomTab。

---

## Part 4: Orders Table 檢查

檔案: `app/[locale]/admin/orders/orders-table.tsx`

確保用 light theme（睇落已經OK，但 double check）。
Status badge 用軍綠色:
- PAID badge: `bg-olive-100 text-olive-700`

---

## Part 5: Sidebar Active State

檔案: `app/[locale]/admin/admin-sidebar.tsx`

確保 active nav item 用 `bg-olive-600`（應該已經有）。

---

## 驗證
```bash
npm run build
```

Build pass 後:
```bash
git add -A
git commit -m "fix: Admin UI light theme + olive accent colors"
```

---

## 完成報告
```
## UI Fix - Complete

### Status: SUCCESS/FAILED

### Changes:
- [x] Products table light theme
- [x] Product modal light theme
- [x] Customer Nav removed from Admin
- [x] Olive accent on badges/buttons
- [x] Build: SUCCESS
- [x] Commit: [hash]
```

