# WoWlix Landing Page — Design System & Build Guide

> 此文件係 Claude Code 嘅設計指引。每次修改 landing page 任何 section，都必須參考呢份文件。

---

## 1. Brand Identity

### Core Values
- **產品：** WoWlix — 香港 IG 小店一站式開店平台
- **Target：** 香港 Instagram 商戶（賣飾品、衫褲、手作、代購等）
- **語氣：** 親切、直接、有活力、講廣東話口語
- **核心賣點：** 0% 平台抽成 · $0 起免費開店 · 2 分鐘搞掂 · 一條 Link 搞掂落單收款庫存

### Color Palette
```css
:root {
  /* Primary — Bold Orange (品牌主色，用於 CTA、重要數字、highlight) */
  --color-primary: #FF9500;
  --color-primary-dark: #E68600;
  --color-primary-light: #FFF3E0;
  --color-primary-glow: rgba(255, 149, 0, 0.15);

  /* Neutrals — Warm Gray (唔好用純黑純白) */
  --color-text-primary: #1A1A1A;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
  --color-bg-white: #FAFAFA;
  --color-bg-warm: #FFF8F0;
  --color-bg-section-alt: #F5F1EB;

  /* Accents — 用於痛點/對比 section */
  --color-danger: #EF4444;
  --color-danger-light: #FEE2E2;
  --color-success: #10B981;
  --color-success-light: #D1FAE5;
}
```

### 色彩規則
- **Primary Orange** 只用於 CTA buttons、重要數字、badge、highlight — 唔好大面積鋪色
- **背景交替：** 白 → warm cream → 白 → light section，保持節奏
- **痛點 section** 用 danger-light 背景 + danger icon
- **解決方案 section** 用 success-light 背景
- **絕對唔好用：** 紫色漸變、藍灰配色、任何 generic AI slop 配色

### Typography
```css
/* Display — 用於大標題、Hero headline */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@700;900&display=swap');
/* 中文粗體用 Noto Sans TC Black/Bold */

/* Body — 用於正文、描述 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500&display=swap');

/* English Display — 用於英文標題、品牌名 */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

/* Monospace — 用於數字、定價 */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap');
```

### 字體規則
- **中文標題：** Noto Sans TC 700/900，size 32-48px mobile / 48-72px desktop
- **英文標題：** Plus Jakarta Sans 700/800
- **正文：** Noto Sans TC 400/500，16-18px，line-height 1.6-1.8
- **數字/定價：** JetBrains Mono 700（$78、$198、0%）
- **字距：** 中文 letter-spacing 0.02em，英文 -0.02em
- **NEVER use：** Inter, Roboto, Arial, system-ui, sans-serif fallback only

---

## 2. Layout Principles

### Spacing System
```
4px  — micro (icon gap)
8px  — xs (inline elements)
16px — sm (between related items)
24px — md (card padding, between cards)
32px — lg (between groups)
48px — xl (between sub-sections)
80px — 2xl (between major sections — mobile)
120px — 3xl (between major sections — desktop)
```

### Grid
- Mobile: 單欄，padding 20px 左右
- Tablet: 最大 2 欄
- Desktop: max-width 1200px，居中，padding 40px

### 排版原則
- **Mobile-first：** 所有 section 先設計 375px，再 scale up
- **Hero：** 居中排版（參考 Popcorn），文字上 + phone mockup 下
- **唔好左右並排** 喺 mobile（Hero 唔好用 grid-cols-2）
- **大量留白：** section 之間 80-120px
- **Card gap：** 16-24px
- **每個 section 唔超過 1.5 個螢幕高度**（mobile）

---

## 3. Component Patterns

### Buttons
```
Primary CTA:    bg-[#FF9500] text-white rounded-xl px-8 py-4 text-lg font-bold
                hover: scale-[1.02] shadow-lg transition-all
                Active 狀態: bg-[#E68600]

Secondary CTA:  border-2 border-[#FF9500] text-[#FF9500] rounded-xl px-8 py-4
                hover: bg-[#FFF3E0]

Ghost:          text-[#6B7280] underline hover:text-[#1A1A1A]
```

### Cards
```
Standard:       bg-white rounded-2xl p-6 shadow-sm border border-gray-100
                hover: shadow-md translate-y-[-2px] transition-all

Highlight:      bg-[#FFF3E0] rounded-2xl p-6 border-2 border-[#FF9500]

Pain Point:     bg-[#FEE2E2] rounded-2xl p-6 (紅色系)

Solution:       bg-[#D1FAE5] rounded-2xl p-6 (綠色系)
```

### Icons
- 用 Lucide React icons 或 emoji
- Icon size: 24-32px，配合 48x48 圓形淺色背景
- 痛點 section: ❌ 🔴 配紅色背景
- 功能 section: ✅ 🟢 配綠色/橙色背景

---

## 4. Phone Mockup 規格

### CSS iPhone Frame
```css
.phone-frame {
  /* iPhone 15 Pro 比例 */
  width: 280px;           /* mobile */
  width: 320px;           /* desktop */
  aspect-ratio: 9/19.5;
  border-radius: 44px;
  border: 6px solid #1A1A1A;
  background: #000;
  overflow: hidden;
  box-shadow:
    0 25px 60px rgba(0,0,0,0.15),
    0 4px 12px rgba(0,0,0,0.08),
    inset 0 0 0 2px rgba(255,255,255,0.1);
  position: relative;
}

/* Dynamic Island */
.phone-frame::before {
  content: '';
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 34px;
  background: #000;
  border-radius: 20px;
  z-index: 10;
}

/* 入面嘅內容 */
.phone-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}
```

### Mockup 內容
- **截圖 maysshop biolink 頁面**（真實產品畫面）
- 如果冇截圖，用 iframe: `<iframe src="/maysshop" />`
- Desktop: 可以微傾斜 `transform: perspective(1000px) rotateY(-5deg)`
- 加 soft glow: `box-shadow: 0 0 60px rgba(255,149,0,0.1)`

---

## 5. Section Structure & 設計方向

### Section 1: Hero
**參考：** Popcorn（居中、phone 在下）
```
[Badge] 專為香港 IG 小店而設
[Headline] 一條 Link
          將 Follower 變成生意
[Subtitle] 0% 平台抽成 · $0 起 · 2 分鐘開店
           落單、收款、庫存，一個 Link 搞掂晒
[CTA] 免費開店 →     [Secondary] 睇定價
[Phone Mockup - centered below, showing maysshop]
```
- 居中排版，mobile 單欄
- Phone mockup 喺 CTA 下面
- 背景: subtle warm gradient 或 soft blur shapes
- Badge 用 pill shape，橙色文字 + 橙色淺底

### Section 2: Social Proof Stats（可選）
**參考：** Aave 大數字
```
[3 stats in a row]
XX+ 間店已開通 | XXXX+ 訂單已處理 | 0% 平台抽成
```
- 數字用 JetBrains Mono，超大 48-64px
- Mobile: stack 垂直，每個 stat 一行
- 簡短描述用 muted text

### Section 3: Pain Points 痛點
**標題：** 做生意，可以唔使咁辛苦
```
[Card 1] ❌ 入數截圖對唔到單？ — 漏單、錯單、客人嬲
[Card 2] 💬 DM 問價問到爆？ — 回覆慢就走客
[Card 3] ⚠️ 顏色尺碼一亂就超賣？ — 退款道歉冇停過
[Solution Banner] ✅ WoWlix 將落單、付款、庫存集中一個位
                    你只需要專心賣嘢同出貨
```
- Pain cards: 紅色淺底 + 紅色 icon
- Solution banner: 綠色淺底，bold
- Mobile: 垂直堆疊，gap 16px
- **每張 card 高度 auto，唔好設 min-height**

### Section 4: How It Works 三步開店
**標題：** 真係 2 分鐘，三步就開到店
```
[Step 1] 📸 影相上架 — 手機影相，填個價，30 秒搞掂
[Step 2] 💳 設定收款 — FPS · PayMe · AlipayHK 即刻用
[Step 3] 🔗 放入 IG Bio — 一條 Link，客人即刻落單
```
- 每步有 number badge（1, 2, 3）橙色圓形
- Icon 用 48x48 圓形暖色背景
- Mobile: 垂直排列，gap 24px
- **每步 card 最高 100-120px，唔好撐開**

### Section 5: Features / 點解揀 WoWlix
```
[Feature cards in bento grid]
- 購物車 + 即時庫存
- 多種付款方式
- 訂單管理
- 客戶 CRM
- 自訂域名
- 手機 responsive
```
- Bento grid: desktop 2x3，mobile 1 欄
- 每個 card 有 icon + 標題 + 一句描述
- 交替淺色背景

### Section 6: Pricing 定價
**參考：** LiveChat（大數字 + highlight plan）
```
[Free]  $0/月 — 10 SKU, 50 orders
[Lite]  $78/月 — 50 SKU（推薦 badge）
[Pro]   $198/月 — Unlimited, CRM, 自訂域名
```
- 推薦 plan 用 orange border + "最受歡迎" badge
- 價錢數字用 JetBrains Mono，超大
- Feature list 用 checkmark
- Mobile: 垂直堆疊 或 horizontal scroll

### Section 7: Trust Signals
```
[3 items]
💬 WhatsApp 客服 — 工作日 2 小時內回覆
🛡️ 0% 平台抽成 — 靠月費營運，唔抽成
🔑 數據屬於你 — 隨時匯出，唔鎖你
```
- Compact layout: icon + 標題 + 一行描述
- Mobile: 垂直排列，gap 16px
- **每個 item 最高 80-100px**

### Section 8: CTA Banner
```
[Full-width warm background]
準備好開你嘅網店？
[CTA] 免費開店 →
```

### Section 9: Footer
```
[Logo] [Links] [Social Icons] [Copyright]
```

---

## 6. Animation & Motion

### Page Load
```css
/* 所有 section 用 stagger fade-in */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.section { animation: fadeInUp 0.6s ease-out both; }
.section:nth-child(1) { animation-delay: 0s; }
.section:nth-child(2) { animation-delay: 0.1s; }
/* ... */
```

### Scroll Reveal
- 用 Intersection Observer 觸發 fade-in
- 唔好用 heavy JS library

### Hover Effects
```css
/* Cards */
.card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }

/* CTA Button */
.cta:hover { transform: scale(1.02); }

/* Phone Mockup */
.phone-frame:hover { transform: translateY(-8px); }
```

### 動畫原則
- Subtle > Dramatic
- Duration: 200-400ms
- Easing: ease-out 或 cubic-bezier(0.33, 1, 0.68, 1)
- 唔好每個元素都加動畫，focus on high-impact moments

---

## 7. Anti-Patterns（唔好做嘅嘢）

❌ **唔好** 用 min-h-screen 喺 section（會撐開）
❌ **唔好** 用 flex-1 令 items 平分高度（會拉長）
❌ **唔好** 左右兩欄 grid 喺 mobile Hero
❌ **唔好** 用 Inter / Roboto / Arial
❌ **唔好** 用紫色漸變
❌ **唔好** 用 placeholder 灰色圖（要用真實截圖）
❌ **唔好** 每個 card 設固定高度（用 auto height）
❌ **唔好** section 之間 gap 過大（mobile 最多 80px）
❌ **唔好** 一次過 one-shot 整個 landing page（逐個 section 做）

---

## 8. File Structure

```
components/marketing/
├── LandingPage.tsx          ← Main container
├── sections/
│   ├── HeroSection.tsx      ← Hero + phone mockup
│   ├── StatsBar.tsx         ← Social proof numbers
│   ├── PainPoints.tsx       ← 痛點 section
│   ├── HowItWorks.tsx       ← 三步開店
│   ├── Features.tsx         ← Bento grid features
│   ├── Pricing.tsx          ← 定價 cards
│   ├── TrustSignals.tsx     ← 信任指標
│   ├── CtaBanner.tsx        ← Final CTA
│   └── Footer.tsx           ← Footer
├── PhoneMockup.tsx          ← Reusable phone frame component
└── landing.css              ← Landing-specific styles + CSS vars
```

---

## 9. Build Instructions for Claude Code

1. **每次只做一個 section** — 唔好一次過做晒
2. **每個 section 開始前** — 讀返呢份 README 對應嘅 section 設計
3. **做完每個 section** — 確認 mobile 375px 排版正常
4. **用真實內容** — 唔好用 Lorem ipsum
5. **CSS variables** — 所有色同 spacing 用 CSS custom properties
6. **組件化** — 每個 section 獨立 component
7. **Responsive breakpoints：** sm:640px md:768px lg:1024px xl:1280px
