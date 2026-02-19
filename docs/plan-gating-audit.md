# Plan Feature Gating Audit

**Date**: 2026-02-19
**Scope**: Free / Lite / Pro plans — all features and limits defined in `lib/plan.ts`

---

## Plan Definitions (`lib/plan.ts`)

| Plan | maxSku | maxOrdersPerMonth | Features |
|------|--------|-------------------|----------|
| **Free** | 10 | 50 | _(none)_ |
| **Lite** | 50 | Infinity | whatsapp, coupon, csv_export, analytics |
| **Pro** | Infinity | Infinity | all Lite + cart_recovery, crm, top_sellers, custom_domain, remove_branding, multi_staff |

Helper functions:
- `getPlan(tenantId)` — resolves effective plan with grace-period / expiry logic
- `checkPlanLimit(tenantId, "sku" | "orders")` — compares current usage vs limit
- `hasFeature(tenantId, feature)` — checks plan's feature list

---

## Audit Results by Feature

### 1. SKU Limit (maxSku)

| Endpoint | Method | Has `checkPlanLimit("sku")`? | Status |
|----------|--------|------------------------------|--------|
| `/api/admin/products` | POST | **Yes** (`route.ts:241`) | OK |
| `/api/admin/products/import` | POST | **NO** | **GAP — P0** |

**Finding**: `POST /api/admin/products/import` creates products in a loop without any SKU limit check. A Free-plan user can import unlimited products via CSV, bypassing the 10-SKU cap.

**Risk**: HIGH — direct bypass of core monetisation limit.

---

### 2. Monthly Order Limit (maxOrdersPerMonth)

| Endpoint | Method | Has `checkPlanLimit("orders")`? | Status |
|----------|--------|---------------------------------|--------|
| `/api/orders` | POST | **Yes** (`route.ts:418`) | OK |
| `/api/biolink/orders` | POST | **Yes** (`route.ts:181`) | OK |
| `/api/checkout/session` | POST | N/A (creates Stripe session for existing order) | OK |

**Finding**: All order-creation paths enforce the monthly limit. No gap.

---

### 3. `coupon` (Lite+)

| Endpoint | Method | Has `hasFeature("coupon")`? | Status |
|----------|--------|-----------------------------|--------|
| `/api/coupons/validate` | POST | **Yes** (`route.ts:24`) | OK |
| `/api/features/coupon` | GET | **Yes** (info endpoint, `route.ts:10`) | OK |
| `/api/admin/coupons` | GET | **NO** | **GAP — P1** |
| `/api/admin/coupons` | POST | **NO** | **GAP — P0** |
| `/api/admin/coupons/[id]` | GET / PATCH / DELETE | **NO** | **GAP — P0** |

**Finding**: The customer-facing validation endpoint is gated, but the entire admin CRUD (`/api/admin/coupons`) has zero plan checks. A Free-plan admin can create, list, edit, and delete coupons. The coupons won't validate at checkout (because `/api/coupons/validate` is gated), but the admin UI and data are accessible.

**Risk**: MEDIUM — coupons won't actually apply for Free users (validate is gated), but the admin can still create/manage them, which is confusing and technically a plan leak.

---

### 4. `csv_export` (Lite+)

| Endpoint | Method | Has `hasFeature("csv_export")`? | Status |
|----------|--------|---------------------------------|--------|
| `/api/admin/orders/export` | GET | **Yes** (`route.ts:112`) | OK |

**Finding**: Properly gated. No gap.

---

### 5. `analytics` (Lite+)

| Endpoint | Method | Has `hasFeature("analytics")`? | Status |
|----------|--------|---------------------------------|--------|
| `/api/admin/analytics/top-products` | GET | **Yes** (`route.ts:33-34`, checks `analytics` OR `top_sellers`) | OK |
| `/api/admin/analytics/daily` | GET | **NO** | **GAP — P0** |
| `/api/admin/analytics/summary` | GET | **NO** | **GAP — P0** |

**Finding**: `daily` and `summary` routes return full revenue/order analytics without any plan check. A Free-plan admin can call these endpoints directly and get 30-day revenue charts and today/week/month stats.

**Risk**: HIGH — direct data leak of paid analytics features.

---

### 6. `crm` (Pro)

| Endpoint | Method | Has `hasFeature("crm")`? | Status |
|----------|--------|-----------------------------|--------|
| `/api/admin/customers` | GET | **Yes** (`route.ts:21`) | OK |
| `/api/admin/customers/[phone]` | GET | **Yes** (`route.ts:15`) | OK |

**Finding**: Properly gated. No gap.

---

### 7. `top_sellers` (Pro)

| Endpoint | Method | Has check? | Status |
|----------|--------|------------|--------|
| `/api/admin/analytics/top-products` | GET | **Yes** (OR with `analytics`) | OK |

**Finding**: Gated via combined analytics/top_sellers check. No gap.

---

### 8. `whatsapp` (Lite+)

| Endpoint | Method | Has `hasFeature("whatsapp")`? | Status |
|----------|--------|---------------------------------|--------|
| Admin order page (server component) | — | **Yes** (UI only) | OK (UI) |
| Customer order action (server action) | — | **Yes** (UI only) | OK (UI) |
| `/api/admin/tenant-settings` | PUT | **NO** — allows writing `whatsapp` field | **GAP — P1** |
| `/api/store-settings` | PUT | **NO** — allows writing `whatsappNumber` field | **GAP — P1** |

**Finding**: WhatsApp gating is UI-level only (server components hide the button). The API routes that store WhatsApp numbers have no plan check. A Free-plan admin can set their WhatsApp number via the settings API. The number then appears in store data. No API route serves WhatsApp functionality (it's a `wa.me` link rendered client-side), so the practical impact depends on whether the front-end reads the number from the API response regardless of plan.

**Risk**: MEDIUM — setting is saveable but link rendering is gated in server components. Could leak if a different client reads the data.

---

### 9. `cart_recovery` (Pro)

| Endpoint | Method | Has `hasFeature("cart_recovery")`? | Status |
|----------|--------|------------------------------------|--------|
| Admin page (server component) | — | **Yes** (shows upgrade prompt) | OK (UI) |
| `/api/admin/cart-recovery` | GET | **NO** | **GAP — P0** |
| `/api/admin/cart-recovery/[id]` | PATCH | **NO** | **GAP — P0** |

**Finding**: Both API routes are completely ungated. A Free/Lite-plan admin can call the API directly to list all abandoned carts and update recovery statuses.

**Risk**: HIGH — full data access to a Pro-only feature via API.

---

### 10. `custom_domain` (Pro)

| Location | Has check? | Status |
|----------|------------|--------|
| `prisma/schema.prisma` | Field exists (`customDomain String? @unique`) | — |
| Any API route | **NO** — no endpoint to set or validate custom domains | **N/A (not implemented)** |
| Any middleware | **NO** — no domain routing based on custom domain | — |

**Finding**: The feature is defined in the plan but has zero implementation. The DB field exists but there's no API to set it and no middleware to route by it.

**Risk**: LOW (currently) — no attack surface exists. Must be gated when implemented.

---

### 11. `remove_branding` (Pro)

| Endpoint | Method | Has check? | Status |
|----------|--------|------------|--------|
| `/api/admin/tenant-settings` | PUT | **NO** — allows writing `hideBranding` field | **GAP — P1** |
| Customer layout (server component) | — | **Yes** — validates `plan === "pro"` before applying | OK (rendering) |

**Finding**: The API lets any admin set `hideBranding = true`, but the customer-facing layout independently checks the plan before actually hiding branding. The setting can be saved but won't take effect for non-Pro plans.

**Risk**: LOW — defence-in-depth at rendering layer. But the API should still reject the write to prevent confusion and maintain clean separation.

---

### 12. `multi_staff` (Pro)

| Location | Has check? | Status |
|----------|------------|--------|
| Any API route | **NO** | **N/A (not implemented)** |
| Any UI | **NO** | — |

**Finding**: Feature is defined in the plan but completely unimplemented. No staff invite, role, or permission system exists.

**Risk**: LOW (currently) — must be gated when implemented.

---

## Summary: Gaps by Priority

### P0 — Must Fix (server-side bypass possible)

| # | Feature | Route | Issue |
|---|---------|-------|-------|
| 1 | **SKU limit** | `POST /api/admin/products/import` | No `checkPlanLimit("sku")` — CSV import bypasses product cap |
| 2 | **analytics** | `GET /api/admin/analytics/daily` | No `hasFeature("analytics")` — returns 30-day revenue data |
| 3 | **analytics** | `GET /api/admin/analytics/summary` | No `hasFeature("analytics")` — returns today/week/month stats |
| 4 | **cart_recovery** | `GET /api/admin/cart-recovery` | No `hasFeature("cart_recovery")` — returns all abandoned carts |
| 5 | **cart_recovery** | `PATCH /api/admin/cart-recovery/[id]` | No `hasFeature("cart_recovery")` — allows status updates |
| 6 | **coupon** (admin) | `POST /api/admin/coupons` | No `hasFeature("coupon")` — Free users can create coupons |
| 7 | **coupon** (admin) | `GET/PATCH/DELETE /api/admin/coupons/[id]` | No `hasFeature("coupon")` — Free users can manage coupons |

### P1 — Should Fix (defence-in-depth or data leaks)

| # | Feature | Route | Issue |
|---|---------|-------|-------|
| 8 | **whatsapp** | `PUT /api/admin/tenant-settings` | Can save `whatsapp` field without plan check |
| 9 | **whatsapp** | `PUT /api/store-settings` | Can save `whatsappNumber` without plan check |
| 10 | **remove_branding** | `PUT /api/admin/tenant-settings` | Can save `hideBranding` without plan check (rendering is gated) |
| 11 | **coupon** (admin) | `GET /api/admin/coupons` | Free users can list coupons (validate is gated, so low impact) |

### P2 — Track for Future

| # | Feature | Issue |
|---|---------|-------|
| 12 | **custom_domain** | Not implemented — gate when building |
| 13 | **multi_staff** | Not implemented — gate when building |

---

## Free Plan Bypass Risk Assessment

**Can a Free-plan user bypass gating via direct API calls?**

| Vector | Bypassable? | Detail |
|--------|------------|--------|
| Create >10 products | **YES** — via `/api/admin/products/import` | Import route has no SKU check |
| Create >50 orders/month | No | Both order creation routes are gated |
| Access analytics | **YES** — via `/api/admin/analytics/daily` and `/summary` | No plan check |
| Use cart recovery | **YES** — via `/api/admin/cart-recovery` | No plan check |
| Create/manage coupons | **YES** — via `/api/admin/coupons` | Admin CRUD ungated (validate is gated) |
| Use CRM | No | Both customer routes are gated |
| Export CSV | No | Export route is gated |
| Set WhatsApp number | **YES** — via settings API | Number is saved; link rendering is UI-gated |
| Remove branding | Partial — setting saves but doesn't render | Layout has independent plan check |

---

## Recommended Fix Order

1. Add `checkPlanLimit(tenantId, "sku")` to `POST /api/admin/products/import` — check total after import, or before each row
2. Add `hasFeature(tenantId, "analytics")` to `GET /api/admin/analytics/daily`
3. Add `hasFeature(tenantId, "analytics")` to `GET /api/admin/analytics/summary`
4. Add `hasFeature(tenantId, "cart_recovery")` to `GET /api/admin/cart-recovery`
5. Add `hasFeature(tenantId, "cart_recovery")` to `PATCH /api/admin/cart-recovery/[id]`
6. Add `hasFeature(tenantId, "coupon")` to `GET/POST /api/admin/coupons`
7. Add `hasFeature(tenantId, "coupon")` to `GET/PATCH/DELETE /api/admin/coupons/[id]`
8. Add `hasFeature` checks for `whatsapp` and `remove_branding` writes in tenant-settings PUT
