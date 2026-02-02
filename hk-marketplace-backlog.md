# HK•Market — 完整 Backlog
> 日期：2026-02-02 | 版本：v1.0

---

## 🔥 Phase 1 — 即時修正（XS batch，唔需要 SPEC）

### Batch A — 顯示修正
| # | Task | Size | 模型 | 備註 |
|---|------|------|------|------|
| A1 | ProductSizeSelector 條件修正 | XS | Sonnet | `product.sizeSystem` → `product.sizes` |
| A2 | 移除貨幣選擇器 + 統一 `$XXX` 格式 | XS | Sonnet | 全站刪 HKD dropdown，價錢改 `$899` |
| A3 | 產品 card 高度統一 | XS | Sonnet | title line-clamp-2 + aspect-square |
| A4 | 減價產品 card 暗紅色樣式 | XS | Sonnet | dark red border + discount badge |
| A5 | 訂單狀態 + Fulfillment 中文化 | XS | Haiku | PENDING→待付款, PICKUP→自取 |
| A6 | Admin settings 副標題修正 | XS | Haiku | "Manage product catalog..." → "Manage store settings" |
| A7 | Checkout 必填欄位加星號 | XS | Haiku | 姓名 * / 電話號碼 * |
| A8 | Coupon code 改中文 | XS | Haiku | "Coupon code" → "優惠碼" |
| A9 | 金額顯示統一（Admin） | XS | Haiku | "HKD 899" → "$899" |

### Batch B — 導航 + 搜尋修正
| # | Task | Size | 模型 | 備註 |
|---|------|------|------|------|
| B1 | CategoryNav pills 排序 | XS | Sonnet | [篩選] [熱賣] [減價] [男裝] [女裝] [童裝] |
| B2 | 快速搜尋 tags 改為波鞋相關 | XS | Haiku | 電子產品→Air Jordan, 時裝→Dunk 等 |
| B3 | 移除搜尋頁重複搜尋欄 | XS | Haiku | 保留 nav 搜尋欄，刪底部重複 |

### Batch C — UX 小改善
| # | Task | Size | 模型 | 備註 |
|---|------|------|------|------|
| C1 | 信任 badge（正品保證 / 免運費） | XS | Sonnet | 產品詳情頁 + 首頁 |
| C2 | WhatsApp 客服浮動按鈕 | XS | Sonnet | 右下角，連結 wa.me |
| C3 | 庫存緊迫感提示 | XS | Sonnet | stock ≤ 5 顯示「快將售罄」|
| C4 | 加入 cart toast + icon bounce | XS | Sonnet | 動畫確認 |
| C5 | 產品 card hover 效果 | XS | Haiku | shadow + scale 微放大 |
| C6 | 返回頂部按鈕 | XS | Haiku | 碌落出現 |
| C7 | Bottom tab active indicator | XS | Haiku | 動畫效果 |

---

## ⚡ Phase 2 — 核心功能修正（S size，簡單 SPEC）

| # | Task | Size | 模型 | 備註 |
|---|------|------|------|------|
| S1 | 首頁童裝獨立 section | S | Sonnet | 按 shoeType 分開成人/童裝 |
| S2 | 童裝 Size 表 | S | Sonnet | SizeGuideModal 加 TD/PS/GS 對照表 |
| S3 | 訂單編號改短 | S | Sonnet | `HK-20250202-001` 格式 |
| S4 | Checkout form validation | S | Sonnet | 姓名≥2字、電話8位、email格式 |
| S5 | 訂單查詢（電話號碼） | S | Sonnet | 未有會員前用電話查訂單 |
| S6 | 熱賣功能（admin 標記 + pill） | S | Sonnet | Product 加 `hotSelling` boolean |
| S7 | Social proof popup | S | Sonnet | 假數據，45-60秒彈一次，1-2秒消失 |
| S8 | Skeleton loading | S | Sonnet | 產品列表 + 詳情頁 loading 狀態 |
| S9 | 空 cart 推薦產品 | S | Sonnet | 「你可能鍾意」section |
| S10 | Admin Settings 擴展 | S | Sonnet | 聯絡資訊、營業時間、自取地址、條款內容 |

---

## 🚀 Phase 3 — 主要功能（M size，需要 SPEC + PLAN）

| # | Task | Size | 模型 | 說明 |
|---|------|------|------|------|
| M1 | Products API filter 修正 | M | Opus | 加 shoeType, minPrice, maxPrice, size params；修正 FilterPanel + CategoryNav |
| M2 | Payment：FPS + PayMe | M | Opus | QR code 顯示、圖片上傳（Cloudinary）、Admin 確認流程、Stripe 暫時隱藏 |
| M3 | Admin 產品定價系統 | M | Opus | 原價+折扣(%/$)+折後價自動計算、限時優惠(開始/結束日期)、Coupon唔可同折扣疊加 |
| M4 | Admin 產品管理改善 | M | Opus | 搜尋、inline改價、category filter、排序、庫存警告(≤5紅色)、SKU/shoeType欄、圖片高度限制、多圖管理、Sizes JSON輸入、pagination、Export CSV |
| M5 | Admin 訂單管理改善 | M | Opus | 搜尋(ID/名/電話)、狀態dropdown篩選、日期範圍、商品摘要、WhatsApp快捷鍵+訊息模板、pagination |
| M6 | 產品圖片系統 | M | Opus | 大圖+縮圖carousel(desktop左排/mobile底排)、全屏lightbox、Admin多圖上傳/排序/刪除 |
| M7 | Checkout 改善 | M | Opus | 付款方式選擇(FPS/PayMe)、顯示size+產品圖、送貨費計算、會員登入/遊客購買選擇 |

---

## 🏗️ Phase 4 — 大型功能（L size，需要 SPEC + PLAN + APPROVE）

| # | Task | Size | 模型 | 說明 |
|---|------|------|------|------|
| L1 | 會員系統：電話 + OTP | L | Opus | Twilio SMS、6位OTP(5分鐘)、自動建帳、Session/JWT、會員價支援、Guest checkout保留 |
| L2 | Admin 首頁內容管理 | L | Opus | Admin手動揀featured產品、section分配、homepage tabs/pills(全部/新品/熱賣/減價/Air Jordan/Dunk...)、Banner CMS管理 |

---

## 📋 Deferred（之後再做）

| Task | 備註 |
|------|------|
| 客人評價/評分 | 需要真實數據 |
| FilterPanel size 排序（C→Y→成人） | 等 API filter 做好先 |
| 批量操作（產品/訂單） | P2 |
| Admin 獨立產品編輯頁 | P2，而家用 modal |
| Updated 相對時間顯示 | P2 |
| 產品列表 pagination / infinite scroll | 配合 API filter 做 |
| 條款內容草擬（退換貨/送貨/自取/私隱） | 等你提供資料 |
| Social media links | 等你提供 IG/FB/WhatsApp 資料 |
| DB 數據清理（shoeType vs sizes 不一致） | 等多張圖一齊做 |
| 清理測試訂單 | Admin 手動或 script |
| Logo 上傳 | 等你提供 |
| Admin promo banner 管理 | 歸入 L2 |
| FPS/PayMe 收款資料設定 | 歸入 M2 |

---

## 🤖 模型使用指引

| 模型 | 適用範圍 | 估計 tasks |
|------|---------|-----------|
| **Haiku** | 純文字替換、文案修改、CSS微調 | A5-A9, B2-B3, C5-C7 |
| **Sonnet** | UI組件、簡單功能、XS/S batch | A1-A4, B1, C1-C4, S1-S10 |
| **Opus** | 複雜功能、API、DB改動、M/L features | M1-M7, L1-L2 |

---

## 📐 Workflow 規則（AI-STUDIO-WORKFLOW V5）

| Size | 流程 |
|------|------|
| **XS** (≤10 changes) | 直接做，`GO` 批准 |
| **S** | 簡單 SPEC → `GO` |
| **M** | SPEC + PLAN + APPROVE |
| **L** | SPEC + PLAN + APPROVE（可分拆 sub-tasks） |
| **HOTFIX** | 即時修 |

---

## 🎯 建議執行順序

```
Week 1: Phase 1 Batch A + B + C（全部 XS，快速見效）
Week 2: M1（API filter）+ S1-S4（核心 S tasks）
Week 3: M2（FPS/PayMe payment）+ M7（Checkout 改善）
Week 4: M3-M5（Admin 改善）+ S5-S10
Week 5: M6（圖片系統）+ 上傳多張產品圖
Week 6-7: L1（會員系統）
Week 8: L2（首頁內容管理）
```
