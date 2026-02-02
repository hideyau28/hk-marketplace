# CLAUDE.md — hk-marketplace agent rules

## Project
HK•Market — 香港波鞋電商平台（Nike sneakers）
- **URL**: https://hk-marketplace.vercel.app
- **Stack**: Next.js (App Router), Tailwind CSS, Prisma, Neon PostgreSQL, Vercel
- **i18n**: zh-HK / en
- **DB**: 250 Nike products, images from GOAT API

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
4. **Plan → Implement → Verify** — Write plan → edit → run `npm run ci:build` → fix or revert before committing.
5. **Backward compatibility** — Keep fallbacks for legacy fields.

## Key decisions (do not override)
- **Currency**: All prices display as `$XXX` (no HK$, no HKD, no decimals). Currency selector removed.
- **Language**: zh-HK primary, store targets Hong Kong customers.
- **Payment**: FPS + PayMe (Stripe hidden for now).
- **Auth**: Phone + OTP via Twilio (planned). Guest checkout preserved.
- **Price format**: `$899` not `$899.00` or `HK$899`
- **Badge system**: promotionBadges field (String[]) — values: 店長推介, 今期熱賣, 新品上架, 限時優惠, 人氣之選. Auto badge: 快將售罄 (stock ≤ 5).
- **Size selector**: Check `product.sizes` not `product.sizeSystem` (sizeSystem is null in DB).
- **Homepage**: 成人同童裝要分開 section，按 shoeType 區分。

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
  promotionBadges (String[])
}
```

## Verification commands
```bash
npm run ci:build          # Always run
npm run smoke:local       # If orders/admin changes
```

## Deployment
```bash
git push && npx vercel --prod
```

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
