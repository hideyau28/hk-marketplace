
# Orders API (L1) - Cross-Project Delivery Package

Purpose: reusable delivery package for Orders API. Copy into other repos as-is.

## Endpoints Summary
Admin:
- GET /api/orders (list)
  - Query: status (optional; PENDING/PAID/FULFILLING/SHIPPED/COMPLETED/CANCELLED/REFUNDED/DISPUTED)
  - Query: limit (optional; 1-200, default 50)
- GET /api/orders/{id} (get)
- PATCH /api/orders/{id} (update status)

Public:
- POST /api/orders (create; requires x-idempotency-key)

## Auth
Admin endpoints require Admin Secret (one of):
- Header: x-admin-secret: <ADMIN_SECRET> (recommended)
- Header: Authorization: Bearer <ADMIN_SECRET>
- Basic Auth:
  - username=admin or ADMIN_BASIC_USER
  - password=ADMIN_SECRET or ADMIN_BASIC_PASS

Public endpoint (POST /api/orders) requires no admin secret.

Auth failures:
- Missing credentials -> 401 + error.code=ADMIN_AUTH_MISSING
- Invalid credentials -> 403 + error.code=ADMIN_AUTH_INVALID

## Headers
Request:
- POST /api/orders requires: x-idempotency-key

Response (guaranteed on all responses, including errors):
- x-request-id: unique request identifier
- content-type: application/json; charset=utf-8

## Error Codes
- BAD_REQUEST: validation errors (missing idempotency key, invalid status, malformed JSON)
- NOT_FOUND: order not found
- CONFLICT: idempotency conflict (same key, different payload)
- INTERNAL: server error
- ADMIN_AUTH_MISSING: admin secret missing
- ADMIN_AUTH_INVALID: admin secret invalid

## Idempotency Rules (POST /api/orders)
- Requires x-idempotency-key
- Same key + same payload -> return original success response (200)
- Same key + different payload -> 409 CONFLICT
- Implementation stores key + body hash to compare payload consistency

## Status Validation
Allowed values (input normalized to uppercase):
- PENDING
- PAID
- FULFILLING
- SHIPPED
- COMPLETED
- CANCELLED
- REFUNDED
- DISPUTED

Invalid status -> 400 BAD_REQUEST
Admin PATCH can set any valid status directly (no extra workflow constraints).

## Smoke Coverage Map
See scripts/smoke-orders.sh (wired into smoke-local / prod smoke):
- Admin auth: list without secret -> 401 + ADMIN_AUTH_MISSING; wrong secret -> 403 + ADMIN_AUTH_INVALID
- Create validations: POST missing x-idempotency-key -> 400 + BAD_REQUEST
- Create idempotency: same key same payload -> 200; same key different payload -> 409 + CONFLICT
- Admin list/get/update: GET list -> 200; GET by id -> 200; PATCH valid status -> 200; PATCH invalid status -> 400 + BAD_REQUEST
- Error responses assert:
  - x-request-id header present
  - content-type is JSON
  - error.code matches expected

## Acceptance Criteria (for reuse)
- [ ] Endpoints exist and match summary
- [ ] Admin auth returns correct 401/403 + error.code
- [ ] POST enforces idempotency key + conflict semantics
- [ ] PATCH enforces status validation (invalid -> 400 BAD_REQUEST)
- [ ] x-request-id + JSON content-type present on success and error
- [ ] smoke-orders passes locally and in CI

## How to verify
Recommended order (fast, consistent evidence):
1) `npm run smoke:local`
2) `npm run smoke:prod`
3) `npm run ci:verify`

Evidence to paste:
- Local: `SMOKE PASS` + `=== Local Smoke Complete ===`
- Prod: `SMOKE PASS` + `=== Production Smoke Complete ===`
- CI: `status=completed conclusion=success ...` + a `SMOKE PASS` log line
