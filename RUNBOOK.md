# hk-marketplace Runbook (Minimal)

## Local dev
- Create `.env.local` from `.env.example`
- Start dev:
  - `npm run dev`

## Production smoke (local)
- `npm run smoke:prod`
What it does: build -> start server on :3012 -> wait readiness -> run smoke -> stop server

## CI (GitHub Actions)
- Trigger: push to `main` or PR
- It runs:
  - Postgres service
  - `npm ci`
  - `npx prisma generate --schema=prisma/schema.prisma`
  - `npx prisma migrate deploy`
  - `npm run smoke:prod`

## Verify latest main CI run is green + has SMOKE PASS
- `gh run list --branch main --workflow CI --limit 5`
- Get HEAD run + confirm:
  - `SHA=$(git rev-parse HEAD)`
  - `RUN_ID=$(gh run list --branch main --workflow CI --limit 30 --json databaseId,headSha -q ".[] | select(.headSha==\"$SHA\") | .databaseId" | head -n 1)`
  - `gh run view "$RUN_ID" --log | rg "SMOKE PASS"`
