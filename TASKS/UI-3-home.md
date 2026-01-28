# UI-3 — Home layout (sections)

**Goal**
Restructure Home page into clear sections (mainstream UX):
1) Hero banner
2) Recently viewed (grid)
3) Shop by category (icon grid)
4) Recommended / For you (grid)
5) Popular brands (rail + "See all")

Army green is accent-only (links/CTA/active states).

**ALLOWLIST (only modify)**
- Home route file (one of):
  - `app/[locale]/page.tsx` (preferred)
  - or the actual locale home file in this repo
- `components/*` (only if adding simple layout components like `CategoryGrid`, `BrandRail`)
- `STATUS.md` (only update UI Task progress)

**Do NOT**
- Do not modify `components/ProductCard.tsx` in this task (avoid conflict with UI-2).
- Do not add new dependencies.

## Checklist / Acceptance Criteria
- [ ] Home has the 4–5 sections listed above
- [ ] Uses existing/reusable components where possible
- [ ] Spacing/typography matches mainstream clean layout (lots of whitespace)
- [ ] `npm run ci:build` passes
- [ ] 1 task = 1 commit
- [ ] Update `STATUS.md` UI Task 3 progress

## Verify
```bash
npm run ci:build
```

## Deliver
- Commit message: `ui: restructure home sections`
- Include in final reply:
  - commit hash
  - `git show --name-only --stat HEAD`
  - `npm run ci:build | tail -n 60`
