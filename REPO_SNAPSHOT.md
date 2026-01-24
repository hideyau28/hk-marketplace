# REPO_SNAPSHOT.md

**Generated:** 2026-01-23
**Repo:** hk-marketplace
**Purpose:** Hong Kong marketplace storefront with admin panel (MVP stage)

---

## Overview

This is a Next.js 16 App Router project for a Hong Kong-based marketplace. It features:
- Multi-locale support (`[locale]` routing for en/zh-HK)
- Admin panel for managing products, orders, and store settings
- Prisma 7 + Neon PostgreSQL database
- Tailwind CSS 4 for styling
- TypeScript strict mode

Current state: **Early MVP** - basic structure in place, core features partially implemented.

---

## Stack & Tooling

| Component | Version/Details |
|-----------|----------------|
| **Node.js** | v20+ (inferred from @types/node) |
| **Next.js** | 16.1.4 (App Router) |
| **React** | 19.2.3 |
| **TypeScript** | ^5 (strict mode enabled) |
| **Tailwind CSS** | ^4 (@tailwindcss/postcss) |
| **Prisma** | 7.3.0 (with Prisma 7 config) |
| **Database** | PostgreSQL (Neon with pooler) |
| **Adapter** | @prisma/adapter-pg + pg driver |

### Scripts
- `npm run dev` - Development server on port 3012
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - ESLint

---

## Routes

### App Router Structure

**Root Pages:**
- `/app/page.tsx` - Root redirect/landing
- `/app/layout.tsx` - Root layout

**Locale-based Routes (`[locale]`):**
- `/app/[locale]/page.tsx` - Homepage (product listing)
- `/app/[locale]/layout.tsx` - Locale layout with i18n
- `/app/[locale]/product/[id]/page.tsx` - Product detail page

**Admin Pages:**
- `/app/[locale]/admin/settings/page.tsx` - Store settings (MVP: not persisted yet)
- `/app/[locale]/admin/products/page.tsx` - Products management
- `/app/[locale]/admin/orders/page.tsx` - Orders management

**Duplicate Structure:**
- Note: There's a duplicate structure under `/src/app/` with similar pages. This suggests migration or refactoring in progress.

---

## API

### API Routes

**Store Settings API:**
- `GET /api/store-settings` - Fetch store settings (id=1)
- `PUT /api/store-settings` - Update store settings (upsert)
  - Fields: storeName, tagline, returnsPolicy, shippingPolicy
  - No auth/RBAC yet
  - No audit logging
  - No idempotency keys
  - No request-id tracking

---

## Data Layer

### Prisma Configuration

**Prisma 7 Setup:**
- ✅ `prisma.config.ts` exists (Prisma 7 style)
- ✅ Schema at `prisma/schema.prisma`
- ❌ No migrations directory found
- ✅ DATABASE_URL configured in .env

**Database Connection:**
- Provider: PostgreSQL
- Host: Neon (ep-plain-truth-a1ljr6h0-pooler.ap-southeast-1.aws.neon.tech)
- ⚠️ Using pooler connection (-pooler in hostname)
- ❌ No DATABASE_URL_DIRECT for migrations

### Schema Models

**StoreSettings:**
```prisma
model StoreSettings {
  id             Int      @id @default(1)
  storeName      String
  tagline        String
  returnsPolicy  String?
  shippingPolicy String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

**Missing Models:**
- No Product model
- No Order model
- No User/Admin model
- No AuditLog model
- No Inventory model
- No Payment model

---

## Done / Not Done Matrix

### ✅ Done (MVP Level)

| Feature | Status | Notes |
|---------|--------|-------|
| Next.js 16 App Router | ✅ | Working with [locale] routing |
| Tailwind CSS 4 | ✅ | Styling in place |
| Prisma 7 + Neon | ✅ | Basic setup complete |
| Store Settings UI | ✅ | Admin page exists (not persisted) |
| Store Settings API | ✅ | GET/PUT endpoints working |
| Multi-locale routing | ✅ | en/zh-HK support |
| Admin layout | ✅ | Products/Orders/Settings pages scaffolded |

### ❌ Not Done (Critical Gaps)

| Feature | Status | Priority |
|---------|--------|----------|
| **RBAC/Auth** | ❌ | HIGH - No admin authentication |
| **Audit Logging** | ❌ | HIGH - No write tracking |
| **Idempotency** | ❌ | MEDIUM - No duplicate request protection |
| **Request ID tracking** | ❌ | MEDIUM - No x-request-id |
| **Database migrations** | ❌ | HIGH - No migration history |
| **Product model/CRUD** | ❌ | HIGH - Admin page exists but no backend |
| **Order model/CRUD** | ❌ | HIGH - Admin page exists but no backend |
| **User/Admin model** | ❌ | HIGH - No user management |
| **Inventory tracking** | ❌ | MEDIUM - No stock management |
| **Payment integration** | ❌ | HIGH - No checkout flow |
| **Webhook handling** | ❌ | LOW - No external integrations |
| **Error handling** | ❌ | MEDIUM - No unified error format |
| **Tenant/Shop scoping** | ❌ | LOW - Single-shop only (MVP) |

---

## Risks & Gaps

### 🔴 Critical Risks

1. **No Authentication/Authorization**
   - Admin routes are publicly accessible
   - No RBAC or role checking
   - Anyone can modify store settings via API

2. **No Audit Trail**
   - No logging of who changed what and when
   - Cannot track data modifications
   - Compliance risk for production

3. **Database Migration Gap**
   - No migrations directory found
   - Using Neon pooler for migrations (should use direct connection)
   - Risk of schema drift

4. **Incomplete Data Models**
   - Admin pages exist for Products/Orders but no database models
   - Frontend-backend mismatch

### 🟡 Medium Risks

1. **Duplicate App Structure**
   - Both `/app/` and `/src/app/` exist with similar pages
   - Unclear which is canonical
   - Risk of confusion and maintenance issues

2. **No Error Handling**
   - API routes lack try-catch
   - No unified error response format
   - No x-request-id for debugging

3. **No Idempotency**
   - PUT /api/store-settings can be called multiple times
   - Risk of race conditions

### 🟢 Low Risks

1. **Single-shop limitation** - Acceptable for MVP
2. **No webhook support** - Not needed yet
3. **No payment integration** - Can be added later

---

## Recommended Next Cuts

### Cut 1: Security & Guardrails (CRITICAL)
**Goal:** Make admin routes production-safe
- [ ] Implement RBAC middleware (admin role check)
- [ ] Add audit logging for all write operations
- [ ] Add x-request-id tracking
- [ ] Add idempotency keys for PUT/POST
- [ ] Apply guardrails to PUT /api/store-settings
- **Acceptance:** Can safely deploy admin panel without public access risk

### Cut 2: Database Foundation (HIGH)
**Goal:** Complete data layer for Products & Orders
- [ ] Create Product model (name, price, description, imageUrl, stock)
- [ ] Create Order model (userId, items, total, status)
- [ ] Set up DATABASE_URL_DIRECT for migrations
- [ ] Run initial migration
- [ ] Implement Product CRUD API
- [ ] Implement Order CRUD API
- **Acceptance:** Admin pages can manage real data

### Cut 3: Cleanup & Consolidation (MEDIUM)
**Goal:** Remove duplication and improve maintainability
- [ ] Decide on `/app/` vs `/src/app/` structure
- [ ] Remove duplicate files
- [ ] Add unified error handling middleware
- [ ] Add API route scaffolding helper
- [ ] Document routing conventions
- **Acceptance:** Single source of truth for all routes

---

## Notes

- **Prisma 7 Config:** Using new `prisma.config.ts` format (good)
- **Neon Pooler:** DATABASE_URL uses pooler connection - need DIRECT for migrations
- **i18n:** Messages files exist for en/zh-HK locales
- **Mock Data:** `lib/mock.ts` suggests using mock data for products currently
- **Shell Scripts:** Several setup/fix scripts in root (admin-orders.sh, fix-app.sh, setup.sh)

---

**Last Updated:** 2026-01-23
**Next Review:** After Cut 1 completion
