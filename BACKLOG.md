# BACKLOG.md — HK-Marketplace 待做清單

## Known Issues (需修復)
- [ ] Admin settings input 可能仲有失焦問題（需實測確認）
- [ ] 150 products 只有 1 張 GOAT 圖片（SKU 格式 URL 無法取得多圖）
- [ ] Store name "HK•Market" hardcoded 喺多個位置，未全部改為讀 admin settings

## Pending Fixes
- [ ] 店名全站動態化 — Header, Footer, Welcome popup, browser tab title, SEO meta 全部讀 SiteContent

## Phase 2 — S-size (剩餘)
- [ ] S6: 熱賣功能 — admin flag + 熱賣 pill 篩選

## Phase 3 — M-size
- [ ] M1: Products API filter — server-side filtering, pagination
- [ ] M2: Payment FPS + PayMe — QR code upload, payment proof, admin verification
- [ ] M3: Admin pricing system — original price, sale price, discount display
- [ ] M4: Admin product management — bulk edit, drag reorder, image upload
- [ ] M5: Admin order management — status update, notes, refund
- [ ] M6: Product image carousel — multi-image swipe on product detail (97 products have 5 images)
- [ ] M7: Checkout improvements — HK address autocomplete (政府 ALS API), better form UX

## Phase 4 — L-size
- [ ] L1: Member system — Phone + OTP via Twilio, order history, saved addresses
- [ ] L2: Admin homepage/banner CMS — Hero banner slides, mid-page banners, upload/URL, CRUD + ordering

## New Feature Requests
- [ ] Export CSV (admin products) — ✅ DONE
- [ ] ProductCard size dropdown + 購物車 icon — in progress
- [ ] HK address autocomplete (政府 ALS API) — M7
- [ ] Banner CMS (頂部 Hero 5-6 slides + 中間 Section banners) — L2

## Data Notes
- 97/250 products have 5 images (GOAT API numeric ID format)
- 150/250 products have 1 image only (SKU format, GOAT API doesn't support lookup)
- 3 products have 0 images
- SiteContent table stores: welcome popup, contact info, business hours, shipping settings
- Filter size presets:
  - 男裝: US 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13
  - 女裝: US 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10
  - 童裝 GS: US 3.5Y, 4Y, 4.5Y, 5Y, 5.5Y, 6Y, 6.5Y, 7Y
  - 童裝 PS: US 10.5C - 3Y
  - 童裝 TD: US 2C - 10C
