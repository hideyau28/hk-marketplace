# UI-1 — Tokens (Army Green baseline)

**Goal**
Create a mainstream, high-satisfaction baseline theme with *army green* as the accent color.

**Primary color set**
- primary: `#2F4F3E`
- primaryDark (hover/pressed): `#223A2F`
- primarySoft (bg/chips): `#E7EFEA`
- bg: `#FAFAF7`
- text: `#111111`
- muted: `#6B7280`
- border: `#E5E7EB`

**ALLOWLIST (only modify)**
- `app/globals.css` (or the repo’s global stylesheet)
- `tailwind.config.*` (if present)
- `STATUS.md` (only update UI Task progress)

**Do NOT**
- Do not change pages or components besides wiring tokens/classes.
- Do not add secrets or env files.

## Checklist / Acceptance Criteria
- [ ] Theme tokens are defined in one place (CSS variables and/or Tailwind theme extension)
- [ ] Buttons/links/badges have baseline styles using tokens
- [ ] No visual-breaking changes to existing pages (keep minimal)
- [ ] `npm run ci:build` passes
- [ ] 1 task = 1 commit
- [ ] Update `STATUS.md` UI Task 1 progress

## Verify
```bash
npm run ci:build
```

## Deliver
- Commit message: `ui: add army green design tokens`
- Include in final reply:
  - commit hash
  - `git show --name-only --stat HEAD`
  - `npm run ci:build | tail -n 60`
