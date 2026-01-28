# STATUS — hk-marketplace

Updated: 2026-01-28

## ✅ Recently completed
- Payments: PaymentAttempt model + webhook updates (expired doesn’t cancel order)
- Admin: PaymentAttempts shown in Orders + “Last Payment” column
- Orders: Fulfillment timestamps (fulfillingAt/shippedAt/completedAt/cancelledAt/refundedAt/disputedAt) + auto-set on status PATCH
- Smoke: payments smoke script (`scripts/smoke-payments.sh`) + fixes

---

## NEXT 3 TASKS (priority order)

### TASK 1 (P0) — Fulfillment status transition rules + timestamps correctness
**Goal**: make status updates safe/consistent (no impossible jumps), ensure timestamps are set only when appropriate.

**Scope (allowlist)**
- `app/api/orders/[id]/route.ts`
- `app/[locale]/admin/orders/*`
- (optional) `lib/*` helper only

**Checklist**
- [x] Define allowed status transitions (e.g. PENDING→PAID→FULFILLING→SHIPPED→COMPLETED; allow CANCELLED from PENDING/PAID; etc.)
- [x] Enforce transitions in PATCH `/api/orders/[id]` (400 BAD_REQUEST on invalid)
- [x] When transitioning, set the correct timestamp only once (already implemented) and don't set unrelated timestamps
- [x] Admin UI shows a clear error on invalid transition
- [x] `npm run ci:build` PASS
- [x] Commit + `git status` clean

**Owner**: Claude Code (Opus 4.5)
**Progress**: ☑ Done

---

### TASK 2 (P1) — Admin Orders UX: payment + fulfillment at-a-glance
**Goal**: reduce clicks for ops: show last payment + key fulfillment timestamps in table; improve copyability.

**Scope (allowlist)**
- `app/[locale]/admin/orders/orders-table.tsx`
- `app/[locale]/admin/orders/order-detail-modal.tsx`

**Checklist**
- [x] Orders table: show Last Payment (already exists) as badge with color mapping
- [x] Orders table: add columns for key timestamps (PaidAt, ShippedAt) or a compact "Fulfillment" indicator
- [x] Detail modal: add copy button for Stripe IDs (optional), keep monospace selectable
- [x] Empty states (no attempts / no timestamps) look clean
- [x] `npm run ci:build` PASS
- [x] Commit + `git status` clean

**Owner**: Claude Code (Sonnet 4.5)
**Progress**: ☑ Done

---

### TASK 3 (P2) — Smoke: fulfillment + status update validation
**Goal**: add a smoke script that validates admin auth + PATCH status behavior + timestamp write-once.

**Scope (allowlist)**
- `scripts/*`
- `RUNBOOK.md`
- (optional) `package.json` scripts only

**Checklist**
- [x] New `scripts/smoke-fulfillment.sh`
- [x] Requires `ADMIN_SECRET` env; fails fast with usage hint
- [x] Creates an order (reuse logic from smoke-payments if possible)
- [x] PATCH status through a valid sequence; asserts timestamps change as expected
- [x] Attempts an invalid transition; asserts 400 BAD_REQUEST
- [x] Prints `SMOKE PASS (fulfillment)`
- [x] Document in `RUNBOOK.md`
- [ ] Commit + `git status` clean

**Owner**: Claude Code (Sonnet 4.5)
**Progress**: ☑ Done
