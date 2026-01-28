# UI-2 — Product card baseline (mainstream grid)

**Goal**
Implement a mainstream product card pattern (like the reference screenshots):
- large image
- 2-line title
- big price
- small grey badge(s)
- wishlist heart icon
Army green is *accent only*.

**ALLOWLIST (only modify)**
- `components/ProductCard.tsx`
- `components/*` (only if creating small presentational components like `Badge.tsx`, `SectionHeader.tsx`)
- `STATUS.md` (only update UI Task progress)

**Do NOT**
- Do not modify Home page / routes in this task.
- Do not add new dependencies.

## Checklist / Acceptance Criteria
- [ ] Product card uses a fixed aspect ratio (1:1 or 4:5) to avoid layout shift
- [ ] Title clamps to 2 lines (ellipsis)
- [ ] Price is prominent (larger font weight/size)
- [ ] Badge uses subtle grey background with rounded corners
- [ ] Wishlist heart appears on top-right of image area
- [ ] Empty/missing fields degrade gracefully (use em-dash `—`)
- [ ] `npm run ci:build` passes
- [ ] 1 task = 1 commit
- [ ] Update `STATUS.md` UI Task 2 progress

## Verify
```bash
npm run ci:build
```

## Deliver
- Commit message: `ui: refine product card baseline`
- Include in final reply:
  - commit hash
  - `git show --name-only --stat HEAD`
  - `npm run ci:build | tail -n 60`
