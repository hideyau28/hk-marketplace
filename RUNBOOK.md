# hk-marketplace Runbook (Minimal)

## Local dev
- Create `.env.local` from `.env.example`
- Start dev:
  - `npm run dev`

## Production smoke (local)
- `npm run smoke:prod`
What it does: build -> start server on :3012 -> wait readiness -> run smoke -> stop server

## Admin auth (API)
Admin guard accepts **one of**:
1) `x-admin-secret: <ADMIN_SECRET>`
2) `Authorization: Bearer <ADMIN_SECRET>`
3) `Authorization: Basic <user:pass base64>`
   - Defaults: `ADMIN_BASIC_USER=admin`, `ADMIN_BASIC_PASS=<ADMIN_SECRET>`
   - Can override via env

Examples:
- Header secret:
  - `curl -i -H "x-admin-secret: $ADMIN_SECRET" http://localhost:3012/api/store-settings`
- Bearer:
  - `curl -i -H "Authorization: Bearer $ADMIN_SECRET" http://localhost:3012/api/store-settings`
- Basic:
  - `curl -i -u "admin:$ADMIN_SECRET" http://localhost:3012/api/store-settings`

Admin UI:
- Admin secret is stored in `sessionStorage` at runtime (not bundled). You will be prompted to enter it on the settings page.

## CI (GitHub Actions)
- Trigger: push to `main` or PR
- It runs:
  - Postgres service
  - `npm ci`
  - `npx prisma generate --schema=prisma/schema.prisma`
  - `npx prisma migrate deploy`
  - `npm run smoke:prod`

## Verify CI for current HEAD (green + SMOKE PASS)
- `npm run ci:verify`

## Workflow Protocol
- Task cutting + handoff rules: see `WORKFLOW.md`
- Use TASK PACKAGE format for agent handoff (see `WORKFLOW.md`)
- Local verification:
  - `npm run verify:local`
- Full verification (local + CI check for HEAD):
  - `npm run verify:all`
