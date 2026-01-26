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
  - `npm run dev`

## Deployment model (single-tenant per instance)
- This codebase is a single-tenant merchant site template (“B” mode).
- Each merchant gets a separate deployment with its own DB + ADMIN_SECRET.
- Do NOT expose ADMIN_SECRET via `NEXT_PUBLIC_*`.
