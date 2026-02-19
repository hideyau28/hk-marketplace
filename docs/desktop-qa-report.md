# Desktop QA Report

日期：2026-02-20
Viewport：1440x900
方法：Code-level audit + HTTP response verification (curl)
Server：localhost:3012 (`npm run dev`)

---

## Summary

- 🔴 嚴重：3
- 🟡 一般：4
- 🟢 微小：2

---

## HTTP Status Check

| URL | Status | 結果 |
|-----|--------|------|
| `http://localhost:3012` | 200 | OK (redirects to /zh-HK) |
| `http://localhost:3012/zh-HK` | 200 | OK — Landing Page |
| `http://localhost:3012/zh-HK/pricing` | 200 | OK — Pricing Page |
| `http://localhost:3012/zh-HK/contact` | **404** | **Dead link — 頁面不存在** |
| `http://localhost:3012/maysshop` | 200 | OK — BioLink Storefront |
| `http://localhost:3012/zh-HK/product/1` | 200 | OK — Product Detail |
| `http://localhost:3012/zh-HK/terms` | 200 | OK — Terms |
| `http://localhost:3012/zh-HK/privacy` | 200 | OK — Privacy |

---

## Page Results

### 1. Landing Page (`/zh-HK`)

**Layout chain:** `app/layout.tsx` → `[locale]/layout.tsx` → `(customer)/layout.tsx` (platform mode → minimal wrapper) → `LandingPage.tsx`

**結構:**
- Platform mode 時，`(customer)/layout.tsx` 只渲染 `<ThemeProvider><main>` — 冇 TopNav / Footer / BottomTab
- LandingPage 自帶 nav + footer，獨立運作
- 7 個 section：Nav → Hero → How It Works → Pain Points → Features → Plans → Templates+Trust → Final CTA → Footer

**問題:**
- 🔴-001: Nav bar 只有 `maxWidth: 1200px`，喺 1440px viewport 兩邊各有 ~120px 冇背景覆蓋，scroll 時內容會露出
- 🟢-001: Font 用 `@import url(...)` 喺 `<style>` tag 入面，render-blocking，可能有 FOUT

**正常:**
- Hero section 用 `clamp()` 做 responsive font size
- `overflowX: "hidden"` 防止橫向溢出
- Mobile media queries 正確處理 steps 同 trust list
- Footer links（Pricing / Terms / Privacy）正確

---

### 2. Pricing Page (`/zh-HK/pricing`)

**Layout chain:** `app/layout.tsx` → `[locale]/layout.tsx` → `(marketing)/layout.tsx` (passthrough `<>{children}</>`) → `PricingPage.tsx`

**結構:**
- `(marketing)` layout 係空殼，**冇 TopNav、冇 Footer、冇 BottomTab**
- PricingPage 自帶 fixed nav（full-width，有 blur backdrop）
- 8 個 section：Nav → Hero → Plan Cards → Calculator → Scenarios → Themes → Feature Table → FAQ → Final CTA

**問題:**
- 🟡-001: **冇 Footer** — 頁面完全冇 footer links（privacy / terms / contact），用戶冇辦法從 pricing page 導航到法律頁面
- 🟡-002: Feature table `minWidth: 480px` 配合 `overflowX: auto`，desktop 1440px 冇問題，但 table 冇 sticky header
- 🟢-002: FAQ `maxHeight: 300px` 可能截斷較長嘅答案（例如 "WoWlix 真係 0% 平台抽成？" 嘅回答有 ~200 字）

**正常:**
- Fixed nav 全寬，backdrop blur 效果正確
- Plan cards 用 `flex-wrap: wrap`，1440px 可以一行顯示 3 張卡
- Calculator slider 同 bar chart 排版正常
- clamp() font sizes 正確

---

### 3. Contact Page (`/zh-HK/contact`)

**HTTP 404 — 頁面不存在。**

- 🔴-002: `components/Footer.tsx:25` 有 `/{locale}/contact` link，但 `app/[locale]/(customer)/contact/page.tsx` 或 `(marketing)/contact/page.tsx` 都唔存在
- 每個用 `(customer)/layout.tsx` 嘅頁面（Terms, Privacy, 首頁, Product Detail）Footer 都有呢個 dead link

---

### 4. Storefront (`/maysshop`)

**Layout chain:** `app/layout.tsx` → `[locale]/layout.tsx` → `[slug]/page.tsx` → `BioLinkPage.tsx`

**結構:**
- `[slug]` route 在 `(customer)` 同 `(marketing)` route groups 外面
- 冇 TopNav / Footer / BottomTab（全部由 BioLinkPage 自己處理）
- BioLinkPage 係完全獨立嘅 SPA-like 組件，自帶 StickyHeader / CoverPhoto / ProfileSection / ProductGrid / CartBar / WhatsAppFAB

**正常:**
- 獨立 layout，唔受 customer layout 影響
- 1440px viewport 應該正常顯示（BioLink designed mobile-first but uses responsive patterns）
- 所有子組件（CartSheet / CheckoutPage / ProductSheet）都係 overlay/modal 形式

---

### 5. Product Detail (`/zh-HK/product/1`)

**Layout chain:** Full customer layout (TopNav + CategoryNavWrapper + Footer + BottomTab)

**結構:**
- Desktop: `md:grid-cols-2` — 左邊 image carousel，右邊 product info
- Breadcrumb 只喺 `md:` 以上顯示（`hidden md:flex`）
- Related products: `grid-cols-2 md:grid-cols-4`

**問題:**
- 🟡-003: **BottomTab 喺 desktop 1440px 仍然顯示** — `components/BottomTab.tsx` 冇 `md:hidden` class，bottom tab bar 永遠可見。`pb-40` padding 確保內容唔會被遮，但 desktop 上同時有 TopNav + BottomTab 係多餘嘅
- `pb-40`（160px）bottom padding 偏大，desktop 上留白太多

**正常:**
- Image carousel 同 product info 嘅 grid 排版正確
- Breadcrumb navigation 正常
- Related products grid 響應正確
- TopNav 有 search bar、theme toggle、user menu、language switch、cart icon

---

### 6. Terms (`/zh-HK/terms`)

**Layout chain:** Full customer layout

**結構:**
- `max-w-3xl`（768px）居中，`px-4 py-10 pb-32`
- Prose styling: `prose prose-zinc prose-sm max-w-none`
- 9 個 section，每個有 `<h2>` + `<p>` 或 `<ul>`

**正常:**
- 排版乾淨，內容唔會超出螢幕
- Dark mode 支援完整（`dark:` classes）
- 合適嘅 line-height 同 spacing
- Footer + TopNav 正常顯示

**問題:**
- 🟡-003 同上（BottomTab 喺 desktop 顯示）

---

### 7. Privacy (`/zh-HK/privacy`)

**Layout chain:** Full customer layout

**結構:**
- 同 Terms 一樣嘅排版模式
- `max-w-3xl px-4 py-10 pb-32`
- 9 個 section

**正常:**
- 同 Terms 一樣，排版乾淨
- 所有 section 正確渲染
- Dark mode 支援完整

**問題:**
- 🟡-003 同上（BottomTab 喺 desktop 顯示）

---

## Findings

### 🔴-001: Landing Page Nav 喺 1440px 唔夠寬

- **頁面:** `/zh-HK` (Landing Page)
- **檔案:** `components/marketing/LandingPage.tsx:347-351`
- **問題:** Nav 設定 `maxWidth: 1200` + `margin: "0 auto"`，但 background (`rgba(255,255,255,0.9)`) 只覆蓋 1200px 寬度。喺 1440px viewport，左右各有 ~120px 冇背景嘅區域，scroll 時下面嘅內容會透過呢啲缺口顯示
- **建議修復:** 將 nav 拆成外層 full-width wrapper（帶 background + sticky）同內層 max-width container：
  ```jsx
  <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", ... }}>
  ```

---

### 🔴-002: Footer「聯絡我們」Link 指向 404

- **頁面:** 所有用 `(customer)/layout.tsx` 嘅頁面（首頁、Terms、Privacy、Product Detail 等）
- **檔案:** `components/Footer.tsx:25`
- **問題:** `<Link href={/{locale}/contact}>` 指向一個唔存在嘅頁面，用戶點擊會見到 404
- **建議修復:** 建立 `app/[locale]/(customer)/contact/page.tsx` 或將 Footer link 改為 WhatsApp / email 等直接聯絡方式

---

### 🔴-003: Footer「關於我們」Link 指向 404

- **頁面:** 所有用 `(customer)/layout.tsx` 嘅頁面
- **檔案:** `components/Footer.tsx:18`
- **問題:** `<Link href={/{locale}/about}>` 指向一個唔存在嘅頁面，HTTP 404
- **建議修復:** 建立 `app/[locale]/(customer)/about/page.tsx` 或移除 link

---

### 🟡-001: Pricing Page 冇 Footer

- **頁面:** `/zh-HK/pricing`
- **檔案:** `components/marketing/PricingPage.tsx`（全檔案）+ `app/[locale]/(marketing)/layout.tsx`
- **問題:** `(marketing)` layout 係 passthrough，PricingPage 自帶 nav 但完全冇 footer。用戶喺 pricing page 冇辦法導航到 Terms / Privacy / 首頁（除咗 logo link 去 `/`）
- **建議修復:** 喺 PricingPage 底部加一個簡單 footer 或者喺 `(marketing)/layout.tsx` 加 Footer component

---

### 🟡-002: Pricing Feature Table 冇 Sticky Header

- **頁面:** `/zh-HK/pricing`
- **檔案:** `components/marketing/PricingPage.tsx:1076-1091`
- **問題:** Feature comparison table header（Free / Lite / Pro）喺 scroll 時會消失。1440px desktop 上 table 唔長所以影響較小，但如果將來加更多 rows 會成問題
- **建議修復:** 加 `position: sticky; top: 0; z-index: 10` 去 table header

---

### 🟡-003: BottomTab 喺 Desktop 1440px 仍然顯示

- **頁面:** 所有用 `(customer)/layout.tsx` 嘅頁面（Terms、Privacy、Product Detail、首頁 storefront mode）
- **檔案:** `components/BottomTab.tsx:55`
- **問題:** BottomTab 用 `fixed inset-x-0 bottom-0` 但冇 `md:hidden` 或 `lg:hidden`。Desktop 上同時有 TopNav 同 BottomTab，底部永久佔據空間，且與 TopNav 功能重複
- **影響:** 所有 `(customer)` 頁面都有額外 `pb-24` ~ `pb-40` bottom padding 去遷就，desktop 上留白偏多
- **建議修復:** 加 `md:hidden` 到 BottomTab nav element

---

### 🟡-004: Pricing CTA 連結 `/{locale}/start` — 行得通但冇對應 pricing page 嘅 footer navigation

- **頁面:** `/zh-HK/pricing`
- **檔案:** `components/marketing/PricingPage.tsx:726,822,1181`
- **問題:** 三處 CTA 都連結到 `/{locale}/start`（HTTP 200，正常）。但 pricing page 冇 footer，用戶如果唔想註冊，唯一離開方式係 browser back 或 logo link
- **建議修復:** 同 🟡-001 一併解決

---

### 🟢-001: Landing Page Font 載入方式

- **頁面:** `/zh-HK` (Landing Page)
- **檔案:** `components/marketing/LandingPage.tsx:333` + `components/marketing/sections/HeroSection.tsx:123`
- **問題:** 用 `@import url('https://fonts.googleapis.com/...')` 喺 `<style>` tag 入面，render-blocking，可能導致 FOUT
- **建議修復:** 改用 `next/font` 或者 `<link rel="preconnect">` + `<link rel="stylesheet">`

---

### 🟢-002: Pricing FAQ MaxHeight 可能截斷長答案

- **頁面:** `/zh-HK/pricing`
- **檔案:** `components/marketing/PricingPage.tsx:603-604`
- **問題:** FAQ 答案 `maxHeight: open === i ? 300 : 0` — 如果答案超過 300px 高度會被截斷。現有答案長度可能接近邊界
- **建議修復:** 用 JS 計算實際內容高度，或改用 `maxHeight: 1000px` 等較大值

---

## Nav / Footer 排版總結

| 頁面 | TopNav | Footer | BottomTab | Landing Nav | Pricing Nav |
|------|--------|--------|-----------|-------------|-------------|
| Landing `/zh-HK` (platform) | ❌ | ❌ (自帶) | ❌ | ✅ 自帶 | — |
| Pricing `/zh-HK/pricing` | ❌ | ❌ **缺失** | ❌ | — | ✅ 自帶 fixed |
| Storefront `/maysshop` | ❌ | ❌ (自帶) | ❌ | — | — |
| Product `/zh-HK/product/1` | ✅ | ✅ | ✅ (應隱藏) | — | — |
| Terms `/zh-HK/terms` | ✅ | ✅ | ✅ (應隱藏) | — | — |
| Privacy `/zh-HK/privacy` | ✅ | ✅ | ✅ (應隱藏) | — | — |
| Contact `/zh-HK/contact` | **404** | **404** | **404** | — | — |

---

## 建議優先修復順序

1. **P0** 🔴-002 + 🔴-003: 建立 contact + about page 或移除 Footer dead links
2. **P0** 🔴-001: Landing nav 全寬背景
3. **P1** 🟡-001: Pricing page 加 footer
4. **P1** 🟡-003: BottomTab 加 `md:hidden`
5. **P2** 🟢-001: Font 載入優化
6. **P2** 🟢-002: FAQ maxHeight 改善
