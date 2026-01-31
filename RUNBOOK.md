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

## CI verification (after merge)
- On `main`, `npm run ci:verify` defaults to the `push` event for the current HEAD.

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

## Payments smoke test (one-click)

Quick verification of the payment flow critical path:

```bash
# Prereqs: dev server running + ADMIN_SECRET set
ADMIN_SECRET=your-secret bash scripts/smoke-payments.sh
# or
npm run smoke:payments
```

Tests:
1. POST /api/orders — create order
2. POST /api/checkout/session — create Stripe checkout session
3. Verify response contains `https://checkout.stripe.com/` URL

Success output:
```
SMOKE PASS (payments)
orderId=...
```

## Fulfillment smoke test

Validates admin auth + status transitions + timestamp write-once:

```bash
# Prereqs: dev server running + ADMIN_SECRET set
ADMIN_SECRET=your-secret bash scripts/smoke-fulfillment.sh
```

Tests:
1. Admin auth for PATCH (401/403)
2. Valid status sequence: PENDING → FULFILLING → SHIPPED → COMPLETED
3. Timestamps auto-set on first transition, unchanged on repeat (write-once)
4. Invalid status value → 400 BAD_REQUEST

Success output:
```
SMOKE PASS (fulfillment)
orderId=...
```

## Local dev
- Create `.env.local` from `.env.example`
- First-time local setup (DB + seed):
  - `npm run dev:bootstrap`
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
- This codebase is a single-tenant merchant site template ("B" mode).
- Each merchant gets a separate deployment with its own DB + ADMIN_SECRET.
- Do NOT expose ADMIN_SECRET via `NEXT_PUBLIC_*`.

## Deploying with Prisma migrations

**IMPORTANT**: Always run database migrations before deploying new application code.

### Pre-deployment checklist
1. ✅ Verify `DATABASE_URL` is set correctly in production environment
2. ✅ Backup your database before applying migrations
3. ✅ Review pending migrations in `prisma/migrations/`

### Production deployment commands

```bash
# 1) Deploy pending migrations to production database
npx prisma migrate deploy

# 2) Generate Prisma Client (if not done in build step)
npx prisma generate

# 3) Build and deploy application
npm run build
```

**Quick command** (use in CI/CD or manual deploy):
```bash
npm run db:migrate:deploy
```

### Safety notes
- `prisma migrate deploy` only runs pending migrations (safe to run multiple times)
- Always test migrations in staging environment first
- For rollback, restore database from backup (Prisma does not support automatic rollback)
- Monitor application logs after deployment for any migration-related errors

### Troubleshooting
- If migration fails: check `DATABASE_URL` connection and database permissions
- If schema drift detected: run `npx prisma migrate resolve --applied <migration_name>` to mark as applied
- For emergency rollback: restore database backup and redeploy previous application version
