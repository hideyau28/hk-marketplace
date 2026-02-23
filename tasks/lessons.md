# Lessons Learned

> Claude Code 每次開 session 必須讀呢個 file。每次犯錯後更新。

## 🔴 Critical — 改錯 File

### Biolink ≠ Marketplace Checkout

- **Biolink 店舖**（/tonic, /maysshop）用 components/biolink/CheckoutPage.tsx
- **Marketplace**（/checkout）用 app/[locale]/(customer)/checkout/page.tsx
- 改 code 前必須確認用緊邊個 file！
- Session 8 花咗大量時間 debug 就係因為改錯 file
- Biolink orders API: /api/biolink/orders
- Marketplace orders API: /api/orders

## 🔴 API Param 名

- Payment config API 讀 ?tenant= param（唔係 `?slug=`）
- PR #257 加咗 ?slug= alias，但要確認 caller 傳邊個

## 🔴 Database

- 永遠唔好用 prisma db push — Prisma CLI 報 P1013 error
- 千萬唔好 prisma db push --force-reset — 會清晒所有數據
- 所有 DB schema 改動用 Neon SQL Editor 手動執行
- IdempotencyKey 有 14 rows NULL tenantId，StoreSettings 有 8 rows NULL tenantId — 會阻止 prisma

## 🟡 Payment Config 3-Tier Fallback

Tier 1: TenantPaymentConfig（JSONB）→ merge PaymentMethod 真實資料
Tier 2: PaymentMethod table 直接讀
Tier 3: Tenant flags（fpsEnabled/paymeEnabled）

- TenantPaymentConfig 空 config 會命中 Tier 1 但返回 placeholder — 已改為 merge 真實資料

## 🟡 Column 名差異

- QR Code: `qrCodeUrl`（新）vs `qrImage`（legacy）
- Account: `accountNumber`（新）vs `accountInfo`（legacy）
- PayMe Link: `paymentLink`（DB column）→ `paymeLink`（API response / frontend config key）

## 🟡 Deploy & Testing

- Preview deploy 用唔到 — Vercel preview domain 冇 tenant resolution
- 只能 merge main 後喺 production 測試
- 永遠用 incognito mode 測試
- URL 格式冇 @ symbol：`wowlix.com/slug`

## 🟡 Plan Mode

- 複雜 bug 用 plan mode 分析再改，唔好盲目出 task
- 3+ steps 或 architectural decisions → 入 plan mode
- 出錯就 STOP + re-plan，唔好繼續 push

## 🟡 UI 標準

- 2026 年最高標準 + wow factor
- 唔好出 generic AI output
- 品牌色：Primary #FF9500, Dark #E68600, Light #FFF3E0

## 🟡 Size Data Format

- 鞋碼：{“US 7C”: 1, “US 8.5”: 3} — key 用 “US X” 格式
- 非鞋類：{“500ml”: 2, “250ml”: 5} — key 係產品規格
- sizeSystem field 可能 null，要 handle

## 🟢 Workflow

- 交付必須包含 branch name（git branch –show-current）
- Merge 用 gh pr merge <number> –squash –delete-branch –admin
- Build 驗證：npm run ci:build（必須 pass）
