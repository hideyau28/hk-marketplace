# CLAUDE.md — hk-marketplace agent rules

## Project
HK•Market — 香港波鞋電商平台（Nike sneakers）
- **URL**: https://hk-marketplace.vercel.app
- **Stack**: Next.js (App Router), Tailwind CSS, Prisma, Neon PostgreSQL, Vercel
- **i18n**: zh-HK / en
- **DB**: 250 Nike products, images from GOAT API

## Session startup (MUST follow every new session)
1. Read this file first
2. `git checkout main` — stay on main branch
3. `git status` — must be clean
4. `git log --oneline -1` — report current commit hash (this is the ROLLBACK POINT)
5. `npm run build` — must pass
6. Do NOT create new branches or worktrees
7. Do NOT modify working features unless explicitly asked
8. Maximum 4 tasks per session to maintain stability

## Rollback procedure
If changes break something, revert to the rollback point:
```bash
git reset --hard <rollback-commit-hash>
git push origin main --force
```
To revert only the last commit:
```bash
git revert HEAD --no-edit
git push origin main
```
Always report the rollback point commit hash at the START of every session.

## Regression prevention (CRITICAL)
Before making ANY changes:
1. Run `npm run build` and save output
2. Note ALL existing features that currently work
3. After changes, verify EVERY feature still works

### Protected files — do NOT change unless explicitly listed in the task:
- components/BottomTab.tsx
- components/WelcomePopup.tsx
- components/SocialProofPopup.tsx
- components/CategoryNav.tsx
- components/ScrollToTop.tsx (deleted, do NOT recreate)
- app/[locale]/(customer)/cart/
- app/[locale]/(customer)/checkout/
- app/[locale]/(customer)/orders/
- app/[locale]/(admin)/admin/settings/
- app/[locale]/(admin)/admin/products/product-modal.tsx

### If modifying a shared component (e.g. ProductCard.tsx):
1. List ALL places that import/use it
2. Make the change
3. Verify EACH usage still works correctly

### Pre-commit verification checklist:
- [ ] CategoryNav pills show correctly (篩選 green, 熱賣/減價 red)
- [ ] Price shows $XXX (no HK$, no decimals)
- [ ] Low stock badge on product images (top-left, 8s fade)
- [ ] Trust badges on product detail (正品保證 + 免運費)
- [ ] Cart add/remove works
- [ ] Size selector works on product detail page
- [ ] Admin settings loads and saves (no input focus bug)
- [ ] Admin product list loads
- [ ] Homepage all sections render
- [ ] Product listing page (查看全部) renders correctly
- [ ] Filter panel opens and filters work

## Operating model
- Claude Code writes code and runs verification.
- ngyau (reviewer) runs acceptance checks and approves deployments.
- Follow AI-STUDIO-WORKFLOW V5 gates:
  - **XS** (≤10 changes): direct execution, needs `GO` approval
  - **S**: simple SPEC → `GO`
  - **M**: SPEC + PLAN + APPROVE
  - **L**: SPEC + PLAN + APPROVE (can split into sub-tasks)
  - **HOTFIX**: immediate fix

## Hard rules (must)
1. **Scope control** — Only touch files required for the task. Ask before expanding scope.
2. **One task = one commit** — Small, reversible commits. No drive-by refactors.
3. **No secrets** — Never add API keys, tokens, `.env.local`, or credentials.
4. **Plan → Implement → Verify** — Write plan → edit → run `npm run build` → fix or revert before committing.
5. **Backward compatibility** — Keep fallbacks for legacy fields.
6. **No branches** — All work on main branch only. Never create worktrees or feature branches.

## Key decisions (do not override)
- **Currency**: All prices display as `$XXX` (no HK$, no HKD, no decimals). Currency selector removed.
- **Language**: zh-HK primary, store targets Hong Kong customers.
- **Payment**: FPS + PayMe (Stripe hidden for now).
- **Auth**: Phone + OTP via Twilio (planned). Guest checkout preserved.
- **Price format**: `$899` not `$899.00` or `HK$899`
- **Badge system**: promotionBadges field (String[]) — values: 店長推介, 今期熱賣, 新品上架, 限時優惠, 人氣之選. Auto badge: 快將售罄 (stock ≤ 5).
- **Size selector**: Check `product.sizes` not `product.sizeSystem` (sizeSystem is null in DB).
- **Homepage layout**: Alternating card sizes — odd rows small (160px), even rows large (280px). Banner after row 4.
- **Homepage sections order**: 為你推薦(S) → Air Jordan(L) → Dunk/SB(S) → Air Force(L) → Banner → Air Max(S) → Running(L) → Basketball(S) → 童裝專區(L)
- **為你推薦**: Only featured=true products. Exclude kids (grade_school/preschool/toddler). Fallback to random adult if no featured.
- **CategoryNav pills**: [篩選(green/olive-600)][熱賣(red)][減價(red)][男裝][女裝][童裝], no icons, no dividers, same size.
- **Free shipping**: 訂單滿 $600 免運費 (not $500).
- **Trust badges**: 正品保證 + 訂單滿 $600 免運費 on product detail page.
- **Low stock badge**: 🔥 快將售罄 on product image top-left, 8s fade cycle, only when stock ≤ 5.
- **Filter panel**: 對象 → 種類 → 價錢範圍 → 尺碼 (no 品牌). Filters must actually filter products.
- **Store name**: "HK•Market" is temporary. All store name references must read from admin settings (SiteContent table), not hardcoded.
- **ProductCard interaction**: Size dropdown must use e.stopPropagation() to prevent navigating to product detail. After selecting size, show cart icon (🛒) at bottom-right of product image. Tapping icon adds to cart + toast.
- **Known issues**: See BACKLOG.md for pending fixes and feature requests.

## Route structure
```
app/[locale]/(customer)/          — customer-facing pages
app/[locale]/(admin)/admin/       — admin pages
```

## DB schema notes
```
Product {
  id, title, price, originalPrice,
  imageUrl (single, from GOAT),
  images (String[], multi-angle from GOAT API),
  brand ("Nike"),
  category (silhouette: Air Jordan, Dunk / SB, Air Max, etc.),
  shoeType (adult/womens/grade_school/preschool/toddler),
  sku (unique Nike SKU),
  color, sizes (JSON: {"US 7": qty, "US 8.5": qty}),
  stock, active, badges,
  promotionBadges (String[]),
  featured (Boolean, default false)
}

Order {
  orderNumber (String, unique, format: HK-YYYYMMDD-NNN)
}
```

## Verification commands
```bash
npm run build             # Always run before commit
npm run ci:build          # Full CI check
npm run smoke:local       # If orders/admin changes
```

## Deployment (MUST follow exactly)
```bash
git push origin main
rm -rf .vercel && npx vercel link --project hk-marketplace --yes && npx vercel --prod --yes
```
Verify production URL is https://hk-marketplace.vercel.app (NOT unruffled-elion).

## Delivery checklist (must include in final response)
- Commit hash + message
- List of files changed
- Verification output showing PASS
- Any follow-ups / known limitations

## Style
- Minimal, readable code
- Prefer explicit types
- Avoid adding dependencies unless necessary
- Tailwind CSS for styling
- 廣東話溝通，code comments 用英文
