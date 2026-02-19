# Desktop QA Report — wowlix.com

日期：2026-02-19
Viewport：1440×900
方法：Source code analysis（WebFetch blocked by 403, 改用 codebase review）

---

## Summary

- 🔴 嚴重：2 個
- 🟡 一般：4 個
- 🟢 微小：4 個

---

## Page Results

### 1. Landing Page — wowlix.com (EN & zh-HK)

**Nav bar**
- Logo 左（"✦ WoWlix"）、右側有「定價」+ 語言切換（繁/EN）+「免費開店」CTA ✅
- 🔴 Nav `maxWidth: 1200` 設喺 `<nav>` 本身而非子容器 → 1440px viewport 下 nav 背景只覆蓋 1200px，兩側各 120px 漏出底層內容（見 Finding 🔴-001）

**Hero section**
- Desktop ≥1024px：文字左 + iPhone mockup 右，`flex-direction: row` ✅
- iPhone mockup 係 CSS-only 組件（唔係 `<img>`），渲染正常 ✅
- Floating notifications 有 `-90px` 偏移但 section `overflow: hidden` 已處理 ✅

**Pain Points**
- `grid-template-columns: repeat(2, 1fr)` → 2×2 grid ✅
- Max-width 900px，居中 ✅

**How It Works**
- `grid-template-columns: repeat(3, 1fr)` → 3 cards 一行 ✅
- 深色背景，排版正常 ✅

**Pricing（Landing 內嵌版）**
- `grid-template-columns: repeat(3, 1fr)` → Free/Lite/Pro 三欄 ✅
- Pro card 有 `border: 2px solid #FF9500` 橙色邊框 ✅
- Pro badge（「最受歡迎」）`position: absolute, top: -12` 定位正常 ✅

**Trust Signals**
- 3 個 stats：`display: flex, justifyContent: center, gap: 48` ✅
- 3 個 testimonials：`grid-template-columns: repeat(3, 1fr)` ✅

**Final CTA**
- 按鈕可見，居中，有 glow 效果 ✅

**Footer**
- `grid-template-columns: repeat(3, 1fr)` → 產品/支援/法律 三欄 ✅
- 底部有 WoWlix branding 同 copyright ✅

### 2. Landing Page 繁中 — wowlix.com/zh-HK

- 同一組件，locale 切換只係文字不同 ✅
- 繁體中文內容冇截斷風險（card 有 `minHeight: 120`，文字用 `clamp()` ）✅
- 繁/EN 切換 link 正確指向 `/zh-HK` 同 `/en` ✅

### 3. Pricing Page — wowlix.com/zh-HK/pricing

**Nav bar**
- `position: fixed, top: 0, left: 0, right: 0` → 全寬覆蓋 ✅
- 🟡 缺少語言切換（繁/EN）同「定價」link，同 landing page nav 唔一致（見 Finding 🟡-001）

**Hero**
- 3 個 badges（0% 平台抽成 / $0 起 / 2 分鐘開店）✅
- 標題 + 副標題 + CTA 按鈕 ✅
- 3-step mini flow：`grid-template-columns: repeat(3, 1fr)` ✅

**Plan Cards**
- `display: flex, gap: 20, flexWrap: wrap` with `flex: 1 1 280px, maxWidth: 380` → 1440px 下三張 card 一行排開 ✅
- Lite card 有 ribbon badge（「最受歡迎」）`rotate(45deg)` + card `overflow: hidden` ✅
- 每張 card 有「0% 平台抽成」pill badge ✅

**Savings Calculator**
- Slider + bar chart + 節省金額顯示 ✅
- Max-width 720px，居中 ✅

**Scenario Cards**
- 3 張 cards：`flex: 1 1 260px, maxWidth: 320` → 三欄 ✅

**Theme Showcase**
- 4 款主題（Noir/Linen/Mochi/Petal）：`flex: 1 1 150px, maxWidth: 220` → 四欄 ✅

**Feature Comparison Table**
- `grid-template-columns: 1.5fr 1fr 1fr 1fr` → 4 欄（Feature / Free / Lite / Pro）✅
- `overflowX: auto` 處理窄屏 ✅

**FAQ**
- 7 條 FAQ，展開/收合正常 ✅
- 🟡 `maxHeight: 300` 可能截斷較長答案（見 Finding 🟡-002）

**Footer**
- 🟡 Pricing page 冇 footer，用戶無法存取 Terms / Privacy / Contact links（見 Finding 🟡-003）

### 4. Contact Page — wowlix.com/zh-HK/contact

- `max-w-3xl`（768px）居中 ✅
- WhatsApp 按鈕 + Email link + 辦公時間 ✅
- 排版整齊，層次清晰 ✅
- 🟢 `pb-32`（128px）底部 padding 喺 desktop 過多（見 Finding 🟢-001）

### 5. Storefront — wowlix.com/maysshop

- 頁面載入正常（BioLinkPage 組件）✅
- 🔴 `max-w-[480px]` → 1440px desktop 只顯示 480px 寬度，兩側大量空白（見 Finding 🔴-002）
- Product grid：`grid-cols-2` 固定兩欄，冇 desktop responsive breakpoint ✅（for mobile design）但 desktop 唔理想
- CategoryNav：BioLink page 用 SearchBar 代替，冇 category pills
- Cover photo + Profile section + Product cards 正常渲染 ✅

### 6. 產品詳情頁（Customer storefront route）

- Layout：`grid gap-4 md:grid-cols-2` → desktop 兩欄（圖片左 + 詳情右）✅
- Image carousel：swipe-based，支援多圖 + video ✅
- Size selector / Variant selector 組件存在 ✅
- 加入購物車按鈕可見 ✅
- Related products：`grid grid-cols-2 md:grid-cols-4 gap-3` → desktop 四欄 ✅
- Breadcrumb：`hidden md:flex` → desktop 可見 ✅
- 注意：需要透過 tenant subdomain 存取（如 maysshop.wowlix.com），wowlix.com/maysshop 嘅產品頁唔會行 customer layout

### 7. Terms — wowlix.com/zh-HK/terms

- `max-w-3xl` 居中，prose 排版 ✅
- 9 個 section，內容完整 ✅
- 繁體中文 + 英文版本都有 ✅
- 🟢 同 Contact 一樣有 `pb-32` desktop padding 過多

### 8. Privacy — wowlix.com/zh-HK/privacy

- 同 Terms 結構，`max-w-3xl` 居中 ✅
- 9 個 section，內容完整 ✅
- 繁體中文 + 英文版本都有 ✅
- 🟢 同上 `pb-32` 問題

---

## Findings

### 🔴-001: Landing Page Nav 背景喺 1440px viewport 唔夠寬

- 頁面：wowlix.com / wowlix.com/zh-HK
- 位置：`components/marketing/LandingPage.tsx:286-332`
- 描述：`<nav>` 元素設定 `maxWidth: 1200, margin: "0 auto"`，令 nav 背景（`rgba(13,13,13,0.92)` + `backdropFilter: blur(16px)`）只覆蓋 1200px 寬度。喺 1440px viewport 下，nav 兩側各有 ~120px 空隙，露出底層 section 背景。scroll 時尤其明顯。
- 對比：Pricing page nav 用 `position: fixed, top: 0, left: 0, right: 0` → 正確全寬。
- 建議修復：將 nav 改為全寬，內部加 wrapper div 限制 `maxWidth: 1200`:
  ```jsx
  <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(13,13,13,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", maxWidth: 1200, margin: "0 auto" }}>
      ...
    </div>
  </nav>
  ```

### 🔴-002: Storefront (BioLink) 頁面 desktop 顯示極窄

- 頁面：wowlix.com/maysshop
- 位置：`components/biolink/BioLinkPage.tsx:221`
- 描述：BioLinkPage 設定 `max-w-[480px] mx-auto`，1440px desktop 下只顯示 480px 寬嘅窄條，兩側共 960px 空白。Product grid 固定 `grid-cols-2`，冇 desktop breakpoint。整個頁面看起來像手機預覽。
- 建議修復：
  - 方案 A：加 desktop responsive breakpoint（`md:max-w-3xl lg:max-w-5xl`），grid 改 `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
  - 方案 B（保守）：加深色 body background 配合 480px card 設計，令 mobile-first layout 喺 desktop 仍美觀
  - 方案 C：如果 BioLink 定位為 mobile-only（Instagram bio link），可以接受現狀但應喺 marketing 頁標明

### 🟡-001: Pricing Page Nav 缺少語言切換同定價 link

- 頁面：wowlix.com/zh-HK/pricing
- 位置：`components/marketing/PricingPage.tsx:696-743`
- 描述：Pricing page nav 只有 logo + CTA 按鈕，冇語言切換（繁/EN）亦冇「定價」link。同 landing page nav 唔一致。
- 建議修復：統一 nav 組件或喺 pricing page nav 加入語言切換。

### 🟡-002: FAQ 展開 maxHeight 可能截斷長答案

- 頁面：wowlix.com/zh-HK/pricing
- 位置：`components/marketing/PricingPage.tsx:603-610`
- 描述：FAQ 展開動畫用 `maxHeight: open === i ? 300 : 0`。部分答案（如「同其他網店平台有咩分別？」）內容較長，desktop 排版下文字行數減少但高度可能接近 300px 上限。
- 建議修復：將 `maxHeight` 改為 `500` 或更好嘅方案係用 JavaScript 動態計算內容高度。

### 🟡-003: Pricing Page 冇 Footer

- 頁面：wowlix.com/zh-HK/pricing
- 位置：`components/marketing/PricingPage.tsx`（整個文件）
- 描述：Pricing page 缺少 footer section。用戶無法從 pricing page 導航到 Terms、Privacy、Contact 等頁面。Landing page 有完整 footer 但 pricing page 冇。
- 建議修復：喺 pricing page Final CTA section 之後加入 footer，或將 footer 抽成共用組件。

### 🟡-004: Hero CTA 連結到可能唔存在嘅路由

- 頁面：wowlix.com / wowlix.com/zh-HK
- 位置：`components/marketing/sections/HeroSection.tsx:452`
- 描述：Hero section 嘅「免費開店 →」按鈕連結到 `/admin/register`，但 landing page 其他 CTA 按鈕都連結到 `/${locale}/start`。`/admin/register` 路由喺 app router 中冇對應 page。
- 建議修復：統一改為 `/${locale}/start` 以同其他 CTA 一致。

### 🟢-001: 法律頁面 desktop 底部 padding 過多

- 頁面：wowlix.com/zh-HK/contact, /terms, /privacy
- 位置：各頁面 root div `className="... pb-32"`
- 描述：`pb-32`（128px）係為 mobile bottom tab 預留空間，但喺 desktop（冇 bottom tab）造成大量空白。
- 建議修復：改為 `pb-32 md:pb-16` 或類似 responsive padding。

### 🟢-002: Footer「主題模板」link 指向 Pricing

- 頁面：wowlix.com / wowlix.com/zh-HK
- 位置：`components/marketing/LandingPage.tsx:665`
- 描述：Footer 「主題模板」/「Themes」link 同「定價」link 都指向 `/${locale}/pricing`，但用途不同。
- 建議修復：如有 templates 展示頁，應指向獨立 URL；如冇，可暫時移除或合併到一個 link。

### 🟢-003: Pricing Page Logo 連結到根路徑

- 頁面：wowlix.com/zh-HK/pricing
- 位置：`components/marketing/PricingPage.tsx:712-724`
- 描述：Logo `<Link href="/">` 指向 `/` 而非 `/${locale}`，可能觸發 redirect 或 locale 丟失。
- 建議修復：改為 `/${locale}` 確保 locale 保持一致。

### 🟢-004: Landing Page Nav 用 sticky 而非 fixed

- 頁面：wowlix.com / wowlix.com/zh-HK
- 位置：`components/marketing/LandingPage.tsx:289`
- 描述：Landing page nav 用 `position: sticky`，pricing page nav 用 `position: fixed`。Sticky 需要 parent 無 `overflow: hidden`，目前 parent div 有 `overflowX: hidden` 可能影響 sticky 行為。兩頁 nav 定位方式唔一致。
- 建議修復：統一用 `position: fixed` 並加 `left: 0, right: 0`（同時修復 🔴-001）。

---

## 修復優先級

| # | Severity | Finding | Effort |
|---|----------|---------|--------|
| 🔴-001 | 嚴重 | Landing nav 背景唔夠寬 | 低（改 CSS 結構） |
| 🔴-002 | 嚴重 | BioLink storefront desktop 極窄 | 中-高（需設計 desktop layout） |
| 🟡-004 | 一般 | Hero CTA 連結錯誤 | 低（改 1 行） |
| 🟡-001 | 一般 | Pricing nav 缺語言切換 | 低-中 |
| 🟡-003 | 一般 | Pricing page 冇 footer | 中（新增組件） |
| 🟡-002 | 一般 | FAQ maxHeight 截斷 | 低（改數值） |
| 🟢-001 | 微小 | 法律頁 pb-32 過多 | 低 |
| 🟢-002 | 微小 | Templates link 指向 pricing | 低 |
| 🟢-003 | 微小 | Logo link 缺 locale | 低 |
| 🟢-004 | 微小 | Nav sticky vs fixed 不一致 | 低 |

---

## 建議下一步

1. 先修 🔴-001（landing nav）同 🟡-004（hero CTA link），低 effort 高 impact
2. 🔴-002（BioLink desktop）需要產品決策：是否需要 desktop responsive 或保持 mobile-only
3. 跑 `npm run ci:build` 驗證修改後冇 break
