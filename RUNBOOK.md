# hk-marketplace Runbook (Minimal)

Workflow protocol + agent handoff: see `WORKFLOW.md` (TASK PACKAGE required for L2/L3).

## Local verification (fast)
- Recommended order:
  - `npm run smoke:local`
  - `npm run smoke:prod`
  - `npm run ci:verify`
- Evidence must include three lines:
  - `Local SMOKE PASS`
  - `Prod SMOKE PASS`
  - `CI SMOKE PASS`

## Orders delivery checklist (P0)
Every Orders-related delivery MUST paste these evidence lines:

- Local: a snippet containing both:
  - `SMOKE PASS`
  - `=== Local Smoke Complete ===`

- Prod: a snippet containing both:
  - `SMOKE PASS`
  - `=== Production Smoke Complete ===`

- CI: `npm run ci:verify` output containing:
  - `status=completed conclusion=success ...`
  - a `SMOKE PASS` log line

Coverage expectations (must be green in `scripts/smoke-orders.sh`):
- Admin auth: 401 `ADMIN_AUTH_MISSING`, 403 `ADMIN_AUTH_INVALID`
- Create validation: missing `x-idempotency-key` -> 400 `BAD_REQUEST`
- Payload validation: invalid currency/qty/amounts -> 400 `BAD_REQUEST`
- Idempotency: same key same payload -> 200; same key different payload -> 409 `CONFLICT`
- Admin list/get/update: list 200; get 200; patch valid 200; patch invalid status -> 400 `BAD_REQUEST`

All error responses must include:
- `x-request-id`
- JSON `content-type`
- `error.code`

## Local dev
- Create `.env.local` from `.env.example`
- Start dev:
  - `npm run dev` (固定跑 http://localhost:3012)

### Stripe local webhook (optional)
Prereqs: install + login Stripe CLI.

- Terminal A:
  - `npm run dev`
- Terminal B (webhook forward):
  - `npm run stripe:listen`

Test (optional):
- `npm run stripe:trigger:checkout`

Notes:
- `STRIPE_WEBHOOK_SECRET` 由 `stripe listen` 印出（whsec_...）。只放入 `.env.local`，唔好 commit。
- 建議設定 `APP_URL=http://localhost:3012`，避免 success/cancel URL 受 proxy header 影響。

## Deployment model (single-tenant per instance)
- This codebase is a single-tenant merchant site template (“B” mode).
- Each merchant gets a separate deployment with its own DB + ADMIN_SECRET.
- Do NOT expose ADMIN_SECRET via `NEXT_PUBLIC_*`.
