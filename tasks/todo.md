# WoWlix Sprint Todo

> 最後更新：2026-02-23 Session 9

## 🔴 P0 — Launch Blockers

- [x] PR #259 — Biolink checkout ManualPaymentFlow（驗證 11/13 pass）
- [x] Fix: Order confirmation 顯示送貨地址（PR #260）
- [x] Fix: WhatsApp 通知加 payment proof URL（PR #260）
- [x] Fix: 移除 debug div（PR #260）
- [x] Fix: 尺碼表只限鞋類產品顯示（PR #260）
- [ ] Stripe Live Mode 切換
- [ ] Full E2E testing

## 🟡 P1 — High Priority

- [ ] Admin 加商品後要 F5（persistent bug，多次嘗試未修好）
- [ ] Badge alignment（NEW/剩X件/-X%）
- [ ] PayMe link 數據缺失（tonic tenant 冇設 paymentLink — admin 填或 SQL update）

## 🟠 P2 — Medium

- [ ] Product image placeholder
- [ ] E2E full flow 未測試

## ⬜ Post-Launch

- [ ] Admin auto-refresh（F5 問題）
- [ ] OTP → Redis/DB migration
- [ ] JWT token refresh
- [ ] Downgrade SKU handling
- [ ] Security headers（CSP）
- [ ] Dynamic sitemap
- [ ] Google Analytics integration

## ✅ Session 9 完成

- [x] Clone repo + 讀 code 能力確認
- [x] PR #259 production 驗證（OpenClaw automated testing）
- [x] Root cause 分析：送貨地址 / WhatsApp proof / size chart / debug div
- [x] OpenClaw + GitHub workflow 建立
- [x] 4 個 fix 嘅完整指令 → PR #260 merged
- [x] tasks/lessons.md + tasks/todo.md 建立
