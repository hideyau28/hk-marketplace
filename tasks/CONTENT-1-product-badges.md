# CONTENT-1 — Product badges (comma-separated editable)

**Goal**
Allow each product to have an editable list of badges (strings) that can be freely added/removed, stored in DB, editable in Admin UI, and rendered on ProductCard.

Badges input format (Admin)
- Comma-separated text: `現貨, 快乾, 透氣`
- Trim spaces; ignore empty entries; de-duplicate while preserving order.

## Data model
- Add `Product.badges` as `Json` (array of strings).
  - Example stored value: `["現貨","快乾","透氣"]`

## ALLOWLIST (only modify)
- `prisma/schema.prisma`
- `prisma/migrations/*` (generated)
- `app/api/products/route.ts`
- `app/api/admin/products/route.ts`
- `app/api/admin/products/[id]/route.ts`
- Admin product UI files under `app/[locale]/admin/products/*`
- `components/ProductCard.tsx`
- `STATUS.md` (update progress)

## Checklist / Acceptance Criteria
- [ ] Prisma migration adds `badges` to Product
- [ ] Admin create/update product can set `badges`
- [ ] Admin UI has a simple comma-separated input for badges
- [ ] API returns `badges` in products list
- [ ] ProductCard renders up to 2 badges (use existing `Badge` component)
- [ ] Input parsing rules applied (trim, ignore empty, dedupe)
- [ ] `npm run ci:build` PASS
- [ ] 1 task = 1 commit
- [ ] Update `STATUS.md` progress

## Verify
```bash
npm run ci:build
```

## Deliver
- Commit message: `feat(products): add editable badges`
- Include in final reply:
  - commit hash
  - `git show --name-only --stat HEAD`
  - `npm run ci:build | tail -n 60`
