# WoWlix Build + Data Integrity Report

**Date:** 2026-02-18
**Branch:** `claude/verify-build-data-integrity-PPOl9`
**Scope:** Build verification, Prisma schema usage, env vars, dead code, API consistency

---

## 1. Build 驗證

### Result: ❌ FAIL

```
npm run ci:build
→ npx prisma generate  ✅ OK (v7.3.0)
→ npm run build        ❌ FAIL
```

**Root cause:** `lib/prisma.ts` throws `Error: DATABASE_URL is not set` eagerly at module load time.
Next.js build runs `Collecting page data` using 15 workers — these workers import API route modules which pull in `lib/prisma`, triggering the throw before any request is made.

**Failing pages:**
- `/_not-found`
- `/api/tenant-admin/me`

**Warning (non-blocking):**
```
⚠ The "middleware" file convention is deprecated.
  Please use "proxy" instead.
  https://nextjs.org/docs/messages/middleware-to-proxy
```
The project uses `middleware.ts` at root. Next.js 16 deprecates this in favour of `proxy.ts`.

### Fix options:
| Option | Risk | Notes |
|--------|------|-------|
| Lazy-init prisma (move throw inside request handler) | Low | Best long-term fix |
| Set `DATABASE_URL=` (empty) in CI | Medium | May cause misleading behaviour |
| Add `export const dynamic = "force-dynamic"` to affected pages | Low | Quick workaround for SSG pages |
| Rename `middleware.ts` → `proxy.ts` | Low | Required before Next.js 17 |

---

## 2. Prisma Schema vs Actual Usage

### Models in schema

| Model | Used in app/lib? | Notes |
|-------|-----------------|-------|
| `StoreSettings` | ✅ Yes | `prisma.storeSettings.*` |
| `IdempotencyKey` | ✅ Yes | `prisma.idempotencyKey.*` |
| `User` | ✅ Yes | `prisma.user.*` |
| `Order` | ✅ Yes | `prisma.order.*` |
| `PaymentAttempt` | ✅ Yes | `prisma.paymentAttempt.*` |
| `Product` | ✅ Yes | `prisma.product.*` |
| `Badge` | ✅ Yes | `prisma.badge.*` |
| `Coupon` | ✅ Yes | `prisma.coupon.*` |
| `AdminLog` | ✅ Yes | `prisma.adminLog.*` |
| `SiteContent` | ⚠️ Scripts only | Used in `scripts/seed-homepage.ts`, `prisma/update-heroes.mjs`, `prisma/check-heroes.mjs` — **not in any app route or lib**. Model stays in schema but serves no runtime purpose. |
| `Tenant` | ✅ Yes | `prisma.tenant.*` |
| `TenantAdmin` | ✅ Yes | `prisma.tenantAdmin.*` |
| `HomepageSection` | ✅ Yes | `prisma.homepageSection.*` |
| `HomepageBanner` | ✅ Yes | `prisma.homepageBanner.*` |
| `PaymentMethod` | ⚠️ Fallback only | Used as legacy fallback in `app/api/payment-config/route.ts`. New primary is `TenantPaymentConfig`. Dual-model period in progress. |
| `Category` | ✅ Yes | `prisma.category.*` |
| `ProductVariant` | ✅ Yes | `prisma.productVariant.*` |
| `AttributeDefinition` | ✅ Yes | `prisma.attributeDefinition.*` |
| `TenantPaymentConfig` | ✅ Yes | `prisma.tenantPaymentConfig.*` |

### Schema fields — notable observations

**`Product` legacy fields** (still actively used, not dead):
- `color`, `shoeType`, `sizeSystem`, `videoUrl` — all referenced in admin API routes and storefront pages ✅

**`Order` legacy enum values** (backward compatibility, as intended):
- `PAID`, `FULFILLING`, `DISPUTED` — enum exists for historical orders. Not used in new status flow but required for DB-stored rows ✅

**Relations — all correct:**
- All `@relation` fields match their counterpart models
- `onDelete: Cascade` set correctly on `PaymentAttempt → Order` and `ProductVariant → Product`
- All `@@index` and `@@unique` constraints look appropriate

### Issues: None that are bugs. One observation:
- `SiteContent` model has no app-layer queries — if seed scripts are the only consumers, consider documenting this or adding a homepage CMS admin route.

---

## 3. 環境變數 (Environment Variables)

### Missing from `.env.example` but used in code

| Variable | Used In | Impact if Missing |
|----------|---------|-------------------|
| `DEFAULT_TENANT_SLUG` | `middleware.ts:4` | Falls back to `"maysshop"` — silent wrong tenant in some hosts |
| `PLATFORM_ROOT` | `middleware.ts:12` | Falls back to `"wowlix"` — platform bare-domain detection may mismatch |
| `NEXT_PUBLIC_API_URL` | 3 server action files | Falls back to `"http://localhost:3000"` — prod server actions break silently |
| `NEXT_PUBLIC_APP_URL` | 2 subscription API routes | Falls back to `APP_URL` or `"http://localhost:3012"` |
| `DEFAULT_CURRENCY` | `app/api/orders/route.ts:194` | Defaults to tenant currency — low risk |
| `STRIPE_SUBSCRIPTION_WEBHOOK_SECRET` | `app/api/stripe/subscription-webhook/route.ts:41` | Falls back to `STRIPE_WEBHOOK_SECRET` — OK if using same secret |
| `STRIPE_PRICE_LITE_MONTHLY` | `lib/stripe-subscription.ts:35` | Returns `""` — plan checkout silently fails |
| `STRIPE_PRICE_PRO_MONTHLY` | `lib/stripe-subscription.ts:38` | Returns `""` — plan checkout silently fails |
| `RATE_LIMIT_ENABLED` | `lib/api/route-helpers.ts:86` | Defaults to `true` — fine |
| `RATE_LIMIT_MAX` | `lib/api/route-helpers.ts:117` | Defaults to `120` — fine |
| `RATE_LIMIT_WINDOW_MS` | `lib/api/route-helpers.ts:116` | Defaults to `60000ms` — fine |
| `RATE_LIMIT_ROUTES` | `lib/api/route-helpers.ts:119` | Defaults to `"POST:/api/orders"` — fine |
| `ZEABUR_URL` / `ZEABUR_DOMAIN` | Server action URL resolver | Zeabur-specific, optional |
| `ACCELERATE_URL` / `PRISMA_ACCELERATE_URL` | `lib/prisma.ts:42` | Optional, only needed for Prisma Accelerate |

### Security concern: `NEXT_PUBLIC_ADMIN_SECRET`

`components/admin/ImageUpload.tsx:47` reads `process.env.NEXT_PUBLIC_ADMIN_SECRET` and sends it as `x-admin-secret` header.
The `.env.example` comment explicitly says: **"Do NOT set NEXT_PUBLIC_ADMIN_SECRET"**.

**Risk:** If someone sets this env var, the admin secret is exposed in the client-side bundle (all `NEXT_PUBLIC_*` vars are bundled). The component should instead use the sessionStorage-based secret already implemented in other admin components.

### `.env.example` entries that could be clarified as optional

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth SSO (optional)
- `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` — OAuth SSO (optional)
- `CLOUDINARY_*` — image uploads (optional — local upload still works)
- `STRIPE_*` — payments (optional — cash/FPS still works without Stripe)

---

## 4. Dead Code

### Definitely dead (no imports found anywhere in app/lib/components)

| File | Status |
|------|--------|
| `lib/push-notifications.ts` | 🔴 Zero imports — completely unused |
| `lib/mock.ts` | 🔴 Zero imports — completely unused |
| `lib/analytics.ts` | 🔴 Zero imports — completely unused |

### In-use (confirmed)
- `lib/email.ts` → imported in `app/api/orders/route.ts`
- `lib/biolink-cart.ts` → imported in 3 biolink components
- `lib/color-map.ts` → imported in `components/biolink/ProductSheet.tsx`
- `lib/compress-image.ts` → imported in 2 admin components
- `lib/cover-templates.ts` → imported in 5 files
- `lib/video-embed.ts` → imported in 2 components
- `lib/wishlist.ts` → imported in 2 files
- `lib/fonts.ts` → imported in 2 components
- `lib/store.ts` — not confirmed imported (check separately)

### Unreachable pages (routes with no navigation links found)
- `app/[locale]/(customer)/privacy/page.tsx` — exists but link presence not verified
- `app/[locale]/(customer)/terms/page.tsx` — exists but link presence not verified
- `app/[locale]/(marketing)/pricing/page.tsx` — marketing layout, may be intentionally standalone

### Root-level script files with no automation
Several `.mjs` / `.js` scripts at root (`check-categories.mjs`, `check-cats.mjs`, `check-types.mjs`, `query-data.js`, `query.js`, `query.mjs`) appear to be one-off debug scripts, not part of any npm script. Low risk but add clutter.

---

## 5. API Consistency

### Two response patterns in use (inconsistent)

**Pattern A — New (via `withApi` wrapper, `lib/api/route-helpers.ts`)**
```json
{ "ok": true, "requestId": "...", "data": { ... } }
{ "ok": false, "requestId": "...", "error": { "code": "NOT_FOUND", "message": "..." } }
```

**Pattern B — Old (direct `NextResponse.json`)**
```json
{ "ok": true, ... }
{ "ok": false, "error": "string message" }
```

### Routes NOT using `withApi` (Pattern B)

| Route Group | Count | Notes |
|-------------|-------|-------|
| `app/api/products/filter-*` | 2 | No `requestId`, no structured error |
| `app/api/auth/*` | 6 | `send-otp`, `verify-otp`, `me`, `logout`, `orders`, `profile` |
| `app/api/payment-methods/*` | 2 | Mixed — some use structured error, some don't |
| `app/api/tenant-admin/*` | 8 | `login`, `logout`, `me`, `register`, `google/*`, `facebook/*`, `account` |
| `app/api/tenant/*` | 4 | `login`, `register`, `branding`, `check-slug` |

Total: ~22 routes using old pattern out of ~82 total routes (~27%)

### Error format inconsistency examples

```typescript
// tenant-admin/me — error is a string
{ ok: false, error: "Not authenticated" }  // status 401

// admin/badges — error is structured object (via withApi)
{ ok: false, error: { code: "NOT_FOUND", message: "找不到付款方式" } }  // status 404
```

Client `lib/api-client.ts` has error message keys like `"RATE_LIMITED"` that only work with Pattern A. Pattern B routes' errors won't match these keys.

### Status code usage
- All routes return appropriate 2xx/4xx/5xx codes ✅
- No cases of 200 with error body found ✅
- Some old-pattern routes return 500 with domain data in body (e.g., `{ brands: [], categories: [] }` on filter-options error) — inconsistent with standard error format

---

## Summary Table

| Area | Status | P-level | Action |
|------|--------|---------|--------|
| Build failure (DATABASE_URL) | ❌ Critical | P0 | Lazy-init prisma or set `DATABASE_URL` in CI |
| middleware.ts deprecation | ⚠️ Warning | P1 | Rename to `proxy.ts` before Next.js 17 |
| `SiteContent` schema unused in app | ℹ️ Info | P2 | Document or add CMS route |
| Missing env vars in `.env.example` | ⚠️ Risk | P1 | Add `DEFAULT_TENANT_SLUG`, `PLATFORM_ROOT`, `NEXT_PUBLIC_API_URL`, `STRIPE_PRICE_*` |
| `NEXT_PUBLIC_ADMIN_SECRET` security risk | ⚠️ Risk | P0 | Remove from `ImageUpload.tsx`, use sessionStorage pattern |
| Dead lib files (3 files) | ℹ️ Info | P2 | Delete `push-notifications.ts`, `mock.ts`, `analytics.ts` |
| API response format inconsistency | ⚠️ Drift | P1 | Migrate `auth/*` and `tenant-admin/*` routes to `withApi` |

---

## Next Step

```bash
# Fix P0: lazy-init DATABASE_URL check OR add DATABASE_URL to CI env
# Fix P0: remove NEXT_PUBLIC_ADMIN_SECRET from ImageUpload.tsx
# Then re-run:
npm run ci:build
```
