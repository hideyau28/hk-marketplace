# CONTENT-2 — CategoryGrid: sports categories (editable labels)

**Goal**
Adjust Home CategoryGrid content to match the first merchant: sports apparel & gear.

Suggested categories (can change later)
- 球鞋
- 上衣
- 褲
- 襪
- 配件
- 護具

## ALLOWLIST (only modify)
- `components/CategoryGrid.tsx`
- `messages/en.json`
- `messages/zh-HK.json`
- `STATUS.md` (update progress)

## Checklist / Acceptance Criteria
- [ ] Category labels updated to sports categories
- [ ] Localization keys added/updated appropriately
- [ ] No layout regressions on Home
- [ ] `npm run ci:build` PASS
- [ ] 1 task = 1 commit
- [ ] Update `STATUS.md` progress

## Verify
```bash
npm run ci:build
```

## Deliver
- Commit message: `ui: update home categories for sports`
