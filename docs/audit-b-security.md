# Audit-B: 安全 + Tenant Isolation + 前端深度審查報告

日期：2026-02-19
審查員：Claude (Senior Security Auditor)
範圍：86 API routes, auth flow, tenant resolution, frontend edge cases

---

## Summary

| 級別 | 數量 |
|------|------|
| 🔴 CRITICAL | 4 |
| 🟡 HIGH | 6 |
| 🟢 LOW | 6 |

**整體評估**：Codebase 有紮實嘅 tenant isolation 架構 — 所有 route 都有 `getTenantId()` 或 `authenticateAdmin()` 調用。主要風險在於 `.update()` 操作嘅 WHERE clause 唔包含 `tenantId`（defense-in-depth 缺陷），以及部分 auth 端點缺少 rate limiting。

---

## Tenant Isolation Matrix

### 慣例
- ✅ = tenantId 喺 WHERE clause 中正確使用
- ⚠️ = 有 tenantId 預檢查，但 `.update()` / `.delete()` WHERE 缺少 tenantId（check-then-act pattern）
- ➖ = 該 HTTP method 唔存在
- 🔒 = Admin auth required

### Admin Routes (`/api/admin/...`)

| Route | GET | POST | PATCH/PUT | DELETE | 安全？ |
|-------|-----|------|-----------|--------|--------|
| `/api/admin/products` | ✅🔒 | ✅🔒 | ➖ | ➖ | ✅ |
| `/api/admin/products/[id]` | ➖ | ➖ | ⚠️🔒 L57 | ✅🔒 L86 | ⚠️ |
| `/api/admin/products/reorder` | ➖ | ⚠️🔒 L45 | ➖ | ➖ | ⚠️ |
| `/api/admin/products/import` | ➖ | ✅🔒 | ➖ | ➖ | ✅ |
| `/api/admin/products/csv-template` | ✅🔒 | ➖ | ➖ | ➖ | ✅ |
| `/api/admin/products/[id]/variants` | ✅🔒 | ✅🔒 | ➖ | ➖ | ✅ |
| `/api/admin/products/[id]/variants/sync` | ➖ | ➖ | ⚠️🔒 L79 | ➖ | ⚠️ |
| `/api/admin/products/[id]/variants/[variantId]` | ➖ | ➖ | ⚠️🔒 L112 | ⚠️🔒 L137 | ⚠️ |
| `/api/admin/orders/[id]/confirm-payment` | ➖ | ⚠️🔒 L52 | ➖ | ➖ | ⚠️ |
| `/api/admin/orders/[id]/receipt` | ✅🔒 | ➖ | ➖ | ➖ | ✅ |
| `/api/admin/orders/count` | ✅🔒 | ➖ | ➖ | ➖ | ✅ |
| `/api/admin/orders/export` | ✅🔒 | ➖ | ➖ | ➖ | ✅ |
| `/api/admin/categories` | ✅🔒 | ✅🔒 | ➖ | ➖ | ✅ |
| `/api/admin/categories/[id]` | ➖ | ➖ | ⚠️🔒 L114 | ✅🔒 L143 | ⚠️ |
| `/api/admin/attributes` | ✅🔒 | ✅🔒 | ➖ | ➖ | ✅ |
| `/api/admin/attributes/[id]` | ➖ | ➖ | ⚠️🔒 L103 | ✅🔒 L123 | ⚠️ |
| `/api/admin/coupons` | ✅🔒 | ✅🔒 | ➖ | ➖ | ✅ |
| `/api/admin/coupons/[id]` | ✅🔒 | ➖ | ⚠️🔒 L119 | ✅🔒 L134 | ⚠️ |
| `/api/admin/badges` | ✅🔒 | ✅🔒 | ➖ | ➖ | ✅ |
| `/api/admin/badges/[id]` | ➖ | ➖ | ⚠️🔒 L72 | ✅🔒 L87 | ⚠️ |
| `/api/admin/cart-recovery` | ✅🔒 | ➖ | ➖ | ➖ | ✅ |
| `/api/admin/cart-recovery/[id]` | ➖ | ➖ | ⚠️🔒 L35 | ➖ | ⚠️ |
| `/api/admin/customers` | ✅🔒 | ➖ | ➖ | ➖ | ✅ |
| `/api/admin/customers/[phone]` | ✅🔒 | ➖ | ➖ | ➖ | ✅ |
| `/api/admin/analytics/summary` | ✅🔒 | ➖ | ➖ | ➖ | ✅ |
| `/api/admin/analytics/daily` | ✅🔒 | ➖ | ➖ | ➖ | ✅ |
| `/api/admin/analytics/top-products` | ✅🔒 | ➖ | ➖ | ➖ | ✅ |
| `/api/admin/payments` | ✅🔒 | ➖ | ➖ | ➖ | ✅ |
| `/api/admin/payment-config` | ✅🔒 | ✅🔒 | ➖ | ➖ | ✅ |
| `/api/admin/payment-config/[providerId]` | ➖ | ➖ | ✅🔒 | ✅🔒 | ✅ |
| `/api/admin/upload` | ➖ | ✅🔒 | ➖ | ➖ | ✅ |
| `/api/admin/billing` | ✅🔒 | ➖ | ➖ | ➖ | ✅ |
| `/api/admin/plan` | ✅🔒 | ➖ | ➖ | ➖ | ✅ |
| `/api/admin/tenant-settings` | ✅🔒 | ➖ | ✅🔒 | ➖ | ✅ |
| `/api/admin/tenants` | ✅🔒 | ➖ | ➖ | ➖ | ✅ |
| `/api/admin/login` | ➖ | ✅🔒 | ➖ | ➖ | ✅ |
| `/api/admin/logout` | ➖ | ✅ | ➖ | ➖ | ✅ |
| `/api/admin/select-tenant` | ➖ | ✅🔒 | ➖ | ➖ | ✅ |
| `/api/admin/subscription/checkout` | ➖ | ✅🔒 | ➖ | ➖ | ✅ |
| `/api/admin/subscription/portal` | ➖ | ✅🔒 | ➖ | ➖ | ✅ |

### Public / Storefront Routes

| Route | GET | POST | PATCH/PUT | DELETE | 安全？ |
|-------|-----|------|-----------|--------|--------|
| `/api/products` | ✅ | ➖ | ➖ | ➖ | ✅ |
| `/api/products/filter-counts` | ✅ | ➖ | ➖ | ➖ | ✅ |
| `/api/products/filter-options` | ✅ | ➖ | ➖ | ➖ | ✅ |
| `/api/categories` | ✅ | ➖ | ➖ | ➖ | ✅ |
| `/api/top-sellers` | ✅ | ➖ | ➖ | ➖ | ✅ |
| `/api/orders` | ➖ | ✅ | ➖ | ➖ | ✅ |
| `/api/orders/[id]` | ✅🔒 | ➖ | ⚠️🔒 L196 | ➖ | ⚠️ |
| `/api/orders/[id]/payment` | ✅🔒 | ➖ | ⚠️🔒 L87 | ➖ | ⚠️ |
| `/api/orders/[id]/notes` | ✅🔒 | ➖ | ⚠️🔒 L56 | ➖ | ⚠️ |
| `/api/orders/[id]/track` | ✅ | ➖ | ➖ | ➖ | ✅ |
| `/api/orders/search` | ✅ | ➖ | ➖ | ➖ | ✅ |
| `/api/store-settings` | ✅🔒 | ➖ | ✅🔒 | ➖ | ✅ |
| `/api/coupons/validate` | ➖ | ✅ | ➖ | ➖ | ✅ |
| `/api/payment-methods` | ✅ | ✅🔒 | ➖ | ➖ | ✅ |
| `/api/payment-methods/[id]` | ✅ | ➖ | ✅🔒 | ✅🔒 | ✅ |
| `/api/payment-config` | ✅ | ➖ | ➖ | ➖ | ✅ |
| `/api/features/coupon` | ✅ | ➖ | ➖ | ➖ | ✅ |
| `/api/address/lookup` | ✅ | ➖ | ➖ | ➖ | ✅ |
| `/api/upload` | ➖ | ✅🔒 | ➖ | ➖ | ✅ |

### Homepage Routes

| Route | GET | POST | PUT | DELETE | 安全？ |
|-------|-----|------|-----|--------|--------|
| `/api/homepage/sections` | ✅🔒 | ✅🔒 | ✅🔒 | ➖ | ✅ |
| `/api/homepage/sections/[id]` | ➖ | ➖ | ⚠️🔒 L29 | ✅🔒 L64 | ⚠️ |
| `/api/homepage/banners` | ✅🔒 | ✅🔒 | ✅🔒 | ➖ | ✅ |
| `/api/homepage/banners/[id]` | ➖ | ➖ | ⚠️🔒 | ✅🔒 | ⚠️ |

### Biolink Routes

| Route | GET | POST | 安全？ |
|-------|-----|------|--------|
| `/api/biolink/products` | ✅ | ➖ | ✅ |
| `/api/biolink/orders` | ➖ | ✅ | ✅ |
| `/api/biolink/validate-cart` | ➖ | ✅ | ✅ |

### Auth Routes

| Route | Method | Rate Limited | 安全？ |
|-------|--------|-------------|--------|
| `/api/auth/send-otp` | POST | ❌ 冇 | 🔴 |
| `/api/auth/verify-otp` | POST | ✅ 5/15min | ✅ |
| `/api/auth/me` | GET | ➖ | ✅ |
| `/api/auth/logout` | POST | ➖ | ✅ |
| `/api/auth/orders` | GET | ➖ | ✅ |
| `/api/auth/profile` | GET/PUT | ➖ | ✅ |

### Tenant Admin Routes

| Route | Method | Rate Limited | 安全？ |
|-------|--------|-------------|--------|
| `/api/tenant-admin/login` | POST | ❌ 冇 | 🔴 |
| `/api/tenant-admin/register` | POST | ➖ | ✅ |
| `/api/tenant-admin/logout` | POST | ➖ | ✅ |
| `/api/tenant-admin/me` | GET | ➖ | ✅ |
| `/api/tenant-admin/account` | GET/PATCH | ➖ | ✅ |
| `/api/tenant-admin/google` | GET | ➖ | ✅ |
| `/api/tenant-admin/google/callback` | GET | ➖ | 🔴 CSRF |
| `/api/tenant-admin/facebook` | GET | ➖ | ✅ |
| `/api/tenant-admin/facebook/callback` | GET | ➖ | ✅ |

### Tenant Routes

| Route | Method | 安全？ |
|-------|--------|--------|
| `/api/tenant/register` | POST | ✅ |
| `/api/tenant/check-slug` | GET | ✅ |
| `/api/tenant/login` | POST | ✅ |
| `/api/tenant/branding` | GET | ✅ |

### Webhook Routes

| Route | Method | 安全？ |
|-------|--------|--------|
| `/api/stripe/webhook` | POST | ⚠️ Signature ✅ 但 update 冇 tenantId |
| `/api/stripe/subscription-webhook` | POST | ✅ Signature ✅ + tenant update |
| `/api/checkout/session` | POST | ✅ |

---

## Auth Flow Trace

```
用戶登入（Storefront）
─────────────────────
1. POST /api/auth/send-otp           → 發 OTP 到電話（冇 rate limit ❌）
2. POST /api/auth/verify-otp         → 驗證 OTP（rate limit ✅ 5/15min）
3. 成功 → 簽發 JWT → set cookie「hk_session」（httpOnly, 7 天）
4. 後續請求 → getSessionUser() 從 cookie 讀 JWT → 驗證

Tenant Admin 登入（Dashboard）
──────────────────────────────
路徑 A：Email/Password
1. POST /api/tenant-admin/login      → 驗證 email+bcrypt hash（冇 rate limit ❌）
2. 成功 → signToken(JWT) → set cookie「tenant-admin-token」（httpOnly, 7 天）

路徑 B：Google OAuth
1. GET /api/tenant-admin/google      → 生成 state（base64 JSON, 冇 CSRF cookie ❌）
2. → redirect to Google
3. GET /api/tenant-admin/google/callback → decode state（冇驗證 ❌）
4. → 查 TenantAdmin table by email
5. 成功 → set cookie「admin_session」（httpOnly, 24h）

路徑 C：Facebook OAuth
1. GET /api/tenant-admin/facebook    → 生成 state + set fb_oauth_state cookie ✅
2. → redirect to Facebook
3. GET /api/tenant-admin/facebook/callback → 驗證 state vs cookie ✅
4. → 查 TenantAdmin table by email
5. 成功 → set cookie「admin_session」（httpOnly, 24h）

Super Admin 登入
────────────────
1. POST /api/admin/login             → 驗證 ADMIN_SECRET（rate limit ✅ 5/15min）
2. 成功 → createSession() → set cookie「admin_session」（httpOnly, 24h, strict）
3. POST /api/admin/select-tenant     → 選擇 tenant → 簽發 JWT with tenantId

API 請求驗證
────────────
Admin routes 用 authenticateAdmin()，優先級：
1. JWT token（tenant-admin-token cookie 或 Bearer header）
2. x-admin-secret header（需要 x-tenant-id）
3. admin_session cookie（只驗證 session，要求先 select-tenant）
```

### Tenant Resolution 流程

```
Request
  ↓
middleware.ts
  ├─ resolveSlugFromHostname(host)     → e.g. "maysshop.wowlix.com" → "maysshop"
  ├─ ?tenant= param (localhost only)   → dev override
  ├─ set x-tenant-slug header          → 傳給 API route
  ↓
API route
  ├─ getTenantId(req)
  │   ├─ 1. x-tenant-id header        → 快速路徑（middleware 設）
  │   ├─ 2. JWT token → tenantId      → admin 請求
  │   └─ 3. resolveTenant(req)
  │       ├─ x-tenant-slug header      → middleware 已設 ✅
  │       ├─ Host header → subdomain   → fallback
  │       ├─ ?tenant= query param      → 冇 localhost 限制 ⚠️
  │       └─ DEFAULT_SLUG              → "maysshop"
  ↓
prisma.xxx.findMany({ where: { tenantId } })
```

---

## Findings

### 🔴 CRITICAL-001: `.update()` WHERE 缺少 tenantId — 12 條 Route

- **問題**：多條 admin route 先用 `findFirst({ where: { id, tenantId } })` 驗證記錄屬於正確 tenant，然後用 `update({ where: { id } })` 執行更新，WHERE clause 冇包含 `tenantId`。呢個係 defense-in-depth 缺陷。
- **受影響 Route**：

| 檔案 | 行號 | 操作 |
|-------|------|------|
| `app/api/admin/products/[id]/route.ts` | 57 | PATCH |
| `app/api/admin/coupons/[id]/route.ts` | 119 | PATCH |
| `app/api/admin/badges/[id]/route.ts` | 72 | PUT |
| `app/api/admin/attributes/[id]/route.ts` | 103 | PATCH |
| `app/api/admin/categories/[id]/route.ts` | 114 | PATCH |
| `app/api/admin/cart-recovery/[id]/route.ts` | 35 | PATCH |
| `app/api/admin/orders/[id]/confirm-payment/route.ts` | 52 | POST |
| `app/api/admin/products/reorder/route.ts` | 45 | POST (loop) |
| `app/api/admin/products/[id]/variants/sync/route.ts` | 79 | PUT |
| `app/api/admin/products/[id]/variants/[variantId]/route.ts` | 112, 137 | PATCH, DELETE |
| `app/api/orders/[id]/route.ts` | 196 | PATCH |
| `app/api/homepage/sections/[id]/route.ts` | 29 | PUT |

- **攻擊方式**：

```
// 假設 Tenant-A admin 知道 Tenant-B 嘅 product UUID
// 如果 findFirst 檢查同 update 之間有任何 code path 可以繞過...
PATCH /api/admin/products/{tenant-b-product-id}
Authorization: Bearer {tenant-a-admin-jwt}
{"price": 0.01}

// 實際風險：因為有 findFirst 預檢查，要 exploit 需要
// (1) 認證咗嘅 admin (2) 知道另一個 tenant 嘅 UUID
// 所以實際可利用性較低，但違反 defense-in-depth 原則
```

- **影響**：理論上可以跨 tenant 修改資料。實際上因為有預檢查，風險較低但唔可接受。
- **建議修復**：

```typescript
// Before (vulnerable):
const updated = await prisma.product.update({
  where: { id },
  data: updateData,
});

// After (secure):
const updated = await prisma.product.update({
  where: { id, tenantId },  // 加入 tenantId
  data: updateData,
});

// 或者用 updateMany (always safe):
await prisma.product.updateMany({
  where: { id, tenantId },
  data: updateData,
});
```

**注意**：部分 route 嘅 DELETE 操作已經正確使用 `deleteMany({ where: { id, tenantId } })`，只係 PATCH/PUT 有問題。

---

### 🔴 CRITICAL-002: Google OAuth 冇 CSRF State Validation

- **檔案**：`app/api/tenant-admin/google/callback/route.ts:23-32`
- **問題**：Google OAuth callback 只 decode state parameter 嚟讀 `locale` 同 `isOnboarding`，但冇驗證 state 係唔係由 server 發出。
- **對比**：Facebook OAuth 正確實作 — `fb_oauth_state` cookie + 比較（`app/api/tenant-admin/facebook/callback/route.ts:33-38`）。

```typescript
// Google callback — 冇驗證 ❌
if (stateParam) {
  try {
    const stateObj = JSON.parse(Buffer.from(stateParam, "base64url").toString());
    isOnboarding = stateObj.onboarding === true;  // 只讀值，冇驗證來源
  } catch { }
}

// Facebook callback — 有驗證 ✅
const storedState = request.cookies.get("fb_oauth_state")?.value;
if (!state || !storedState || state !== storedState) {
  return NextResponse.redirect(`...?error=state_mismatch`);
}
```

- **攻擊方式**：攻擊者可以構造惡意 OAuth redirect，篡改 state 令 `isOnboarding=true`，觸發 email 經 URL 傳遞（見 HIGH-006）。
- **影響**：CSRF 攻擊可以令用戶登入攻擊者嘅帳號（login CSRF），或者將 OAuth flow redirect 到非預期狀態。
- **建議修復**：參考 Facebook OAuth 嘅做法，加入 `google_oauth_state` cookie：

```typescript
// 喺 /api/tenant-admin/google/route.ts 加：
const csrfState = crypto.randomBytes(32).toString("hex");
response.cookies.set("google_oauth_state", csrfState, {
  httpOnly: true, secure: true, sameSite: "lax", maxAge: 600
});
// 將 csrfState 加入 state object

// 喺 callback 驗證：
const storedState = request.cookies.get("google_oauth_state")?.value;
// 比較 stateObj.csrf === storedState
```

---

### 🔴 CRITICAL-003: send-otp 端點冇 Rate Limiting

- **檔案**：`app/api/auth/send-otp/route.ts`
- **問題**：呢個 endpoint 係 plain `export async function POST`，冇使用 `withApi` wrapper，冇任何 rate limiting。
- **對比**：`verify-otp` 有 rate limit（`withRateLimit(RATE_LIMITS.AUTH)`，5 requests/15min）。

```typescript
// send-otp — 冇 rate limit ❌
export async function POST(request: Request) {
  // 直接處理，冇保護
}

// verify-otp — 有 rate limit ✅
const rateLimiter = withRateLimit(RATE_LIMITS.AUTH, { keyPrefix: "verify-otp" });
```

- **攻擊方式**：

```bash
# SMS flooding attack
for i in $(seq 1 1000); do
  curl -X POST /api/auth/send-otp -d '{"phone":"91234567"}'
done
# 每個請求都會觸發 SMS 發送，造成成本攻擊
```

- **影響**：(1) SMS 成本攻擊 (2) 騷擾目標電話號碼 (3) 可能觸發 SMS provider rate limit 影響正常用戶
- **建議修復**：加入 rate limit：

```typescript
import { withRateLimit } from "@/lib/api/rate-limit-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";

const rateLimiter = withRateLimit(RATE_LIMITS.AUTH, { keyPrefix: "send-otp" });

export async function POST(request: Request) {
  const rateLimitResponse = rateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;
  // ...existing logic
}
```

---

### 🔴 CRITICAL-004: tenant-admin/login 端點冇 Rate Limiting

- **檔案**：`app/api/tenant-admin/login/route.ts`
- **問題**：Tenant admin password login 冇 rate limiting，可以被 brute force。
- **對比**：`/api/admin/login`（super admin）有 rate limit。

```typescript
// tenant-admin/login — 冇 rate limit ❌
export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;
  // 直接查 DB + bcrypt 驗證
}
```

- **攻擊方式**：

```bash
# Password brute force
for pw in $(cat wordlist.txt); do
  curl -X POST /api/tenant-admin/login \
    -d "{\"email\":\"admin@shop.com\",\"password\":\"$pw\"}"
done
```

- **影響**：攻擊者可以 brute force 任何 tenant admin 嘅密碼
- **建議修復**：同 send-otp 一樣加入 rate limit

---

### 🟡 HIGH-001: Timing-Unsafe Secret 比較

- **檔案及行號**：
  - `lib/auth/admin-auth.ts:56` — `headerSecret === process.env.ADMIN_SECRET`
  - `lib/admin/session.ts:63` — `secret === adminSecret`
  - `lib/api/route-helpers.ts:181` — `headerSecret !== secret`
  - `lib/api/route-helpers.ts:188` — `token === secret`
  - `lib/api/route-helpers.ts:225` — `user === expectedUser && pass === expectedPass`
- **問題**：JavaScript `===` 做 string 比較會喺第一個唔同 byte 就 return false，攻擊者可以測量 response time 來逐字元猜 secret。
- **影響**：理論上可以逐步推斷 `ADMIN_SECRET` 值
- **建議修復**：

```typescript
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
```

---

### 🟡 HIGH-002: In-Memory OTP 儲存

- **檔案**：`lib/auth.ts` — `const otpStore = new Map<string, {...}>()`
- **問題**：OTP 儲存喺 Node.js process memory。
  - Server 重啟後所有未驗證 OTP 會失效
  - 多 instance 部署時（scaling），OTP 只存喺一個 instance
  - 用戶可能發送 OTP 去 instance A，但驗證去咗 instance B
- **影響**：Production 多 instance 環境下 OTP 驗證可能隨機失敗
- **建議修復**：用 Redis 或 database 儲存 OTP

---

### 🟡 HIGH-003: In-Memory Rate Limiting

- **檔案**：`lib/rate-limit.ts` — `const requestLogs = new Map<string, RequestLog>()`
- **問題**：同 OTP 一樣，rate limit 計數只喺單一 instance。攻擊者可以 distribute 請求到唔同 instance 繞過 rate limit。
- **影響**：Rate limiting 喺多 instance 環境下無效
- **建議修復**：用 Redis 做 rate limiting（e.g. `@upstash/ratelimit`）

---

### 🟡 HIGH-004: `?tenant=` Query Param 喺 `lib/tenant.ts` 冇 Production 限制

- **檔案**：`lib/tenant.ts:72-80`
- **問題**：

```typescript
// lib/tenant.ts — 冇 localhost 限制 ❌
try {
  const url = new URL(req.url);
  const tenantParam = url.searchParams.get("tenant");
  if (tenantParam) {
    slug = tenantParam;  // 任何環境都接受
  }
} catch { }

// middleware.ts — 有 localhost 限制 ✅
if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
  const tenantParam = request.nextUrl.searchParams.get("tenant");
  if (tenantParam) tenantSlug = tenantParam;
}
```

- **實際風險**：低。因為 middleware 會先設 `x-tenant-slug` header，`resolveTenant()` 會優先讀 header（line 61-63），所以 `?tenant=` 唔會被執行。但如果有任何 code path 直接 call `resolveTenant()` 而 middleware 未 set header，就可能被利用。
- **建議修復**：喺 `lib/tenant.ts` 加入 `process.env.NODE_ENV !== "production"` check

---

### 🟡 HIGH-005: Stripe Webhook 更新 Order 冇 TenantId

- **檔案**：`app/api/stripe/webhook/route.ts:50-59, 62-74`
- **問題**：

```typescript
// Line 52: 只用 orderId
await prisma.order.update({ where: { id: orderId }, data: {...} });

// Line 64-65: 只用 paymentIntentId
await prisma.order.updateMany({
  where: { stripePaymentIntentId: paymentIntentId },
  data: {...},
});
```

- **緩解**：Stripe webhook 有 signature 驗證（line 32），所以實際上只有 Stripe 能觸發。但如果 `STRIPE_WEBHOOK_SECRET` 洩漏或者被 misconfigure，攻擊者可以修改任意 tenant 嘅 order。
- **建議修復**：從 Stripe metadata 讀取 tenantId 並加入 WHERE clause

---

### 🟡 HIGH-006: Google OAuth Email 經 URL 傳遞

- **檔案**：`app/api/tenant-admin/google/callback/route.ts:92-94`
- **問題**：

```typescript
const email = encodeURIComponent(userInfo.email || "");
const redirectUrl = `${baseUrl}/${locale}/start?google_email=${email}`;
return NextResponse.redirect(redirectUrl);
```

- **影響**：用戶 email 會出現喺：(1) Browser URL bar (2) Browser history (3) Server access logs (4) 任何 analytics/tracking script
- **建議修復**：用 encrypted cookie 或 server-side session 傳遞 email，避免放入 URL

---

### 🟢 LOW-001: Dev 模式返回 OTP

- **檔案**：`app/api/auth/send-otp/route.ts:31-38`
- **問題**：`NODE_ENV !== "production"` 時，OTP 直接返回喺 response body。設計如此，但要確保 staging 環境 `NODE_ENV` 正確設為 `production`。
- **風險**：如果 staging 環境 NODE_ENV 唔係 production，OTP 會暴露

---

### 🟢 LOW-002: Hardcoded Fallback 圖片 URL

- **檔案**：`components/ProductImageCarousel.tsx:36`
- **問題**：

```typescript
const baseImages = images.length > 0
  ? images
  : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60"];
```

- **風險**：依賴外部 URL，如果 Unsplash CDN down 或者改咗 URL，placeholder 會 break
- **建議**：用 local placeholder 圖片

---

### 🟢 LOW-003: Marketing 頁面部分圖片缺少 Alt Text

- **檔案**：`components/marketing/sections/HeroSection.tsx` — Phone mockup 內嘅 product preview 圖片
- **影響**：SEO 同 accessibility 問題，唔係安全問題
- **建議**：加入 descriptive alt text

---

### 🟢 LOW-004: `store-settings` GET 用 `getTenantId` 而唔係 `authenticateAdmin`

- **檔案**：`app/api/store-settings/route.ts:66-73`
- **問題**：雖然有 `{ admin: true }` flag（即 `assertAdmin` 會被 call），但 tenant 解析用 `getTenantId(req)` 而唔係 `authenticateAdmin(req)`。Super admin 如果冇 JWT（未 select-tenant），tenant resolution 可能 fallback 到 `DEFAULT_SLUG`。
- **實際風險**：低。`assertAdmin` 會先驗證 admin 身份。只係 tenant context 可能唔準確。
- **建議**：改用 `authenticateAdmin(req)` 保持一致

---

### 🟢 LOW-005: `tenant-admin/login` 喺 Response Body 返回 JWT Token

- **檔案**：`app/api/tenant-admin/login/route.ts:68-76`
- **問題**：

```typescript
const response = NextResponse.json({
  ok: true,
  token,  // JWT token 暴露喺 response body
  admin: { id, email, role },
});
// 同時 set 咗 httpOnly cookie
```

- **風險**：如果有 XSS 漏洞，攻擊者可以從 API response 讀取 token（httpOnly cookie 本身防唔到 XSS 讀 response）
- **建議**：只用 httpOnly cookie 傳遞 token，唔好喺 response body 返回

---

### 🟢 LOW-006: `tenant/register` Error Message 可能洩漏內部資訊

- **檔案**：`app/api/tenant/register/route.ts` — 尾部 catch block
- **問題**：`error.message` 直接返回畀 client。如果係 Prisma error 或者其他內部 error，可能包含 table name、column name 等資訊。
- **建議**：返回 generic error message，內部詳情只 log

---

## Positive Security Observations

1. **一致嘅 Tenant Resolution**：所有 86 條 route 都有 `getTenantId()` 或 `authenticateAdmin()` 調用。冇任何 route 完全冇 tenant check。
2. **Admin Auth 唔用 DEFAULT_SLUG Fallback**：`authenticateAdmin()` 強制 super admin 要有明確 tenant context（JWT 或 x-tenant-id header）。
3. **冇 Raw SQL**：整個 codebase 冇用 `$queryRaw` / `$executeRaw`，所有 query 經 Prisma ORM，SQL injection 風險極低。
4. **Facebook OAuth CSRF 保護正確**：`fb_oauth_state` cookie 生成 + 驗證 + 刪除流程完整。
5. **Bcrypt Password Hashing**：`lib/auth/password.ts` 用 bcrypt（12 rounds），且 `bcrypt.compare` 本身係 timing-safe。
6. **HttpOnly Cookie**：所有 session cookie 都係 `httpOnly: true`。
7. **OTP Brute Force 保護**：5 次錯誤嘗試後自動刪除 OTP entry。
8. **Consistent Error Handling**：`withApi` wrapper 統一處理 error，非 `ApiError` 嘅錯誤唔會將 message 暴露畀 client（返回 generic "Internal Server Error"）。
9. **Idempotency Key**：`store-settings` PUT 實作咗 idempotency key 保護。
10. **Activity Logging**：Admin 操作有 activity log（`lib/admin/activity-log.ts`）。
11. **DELETE 操作多數正確**：大部分 DELETE 用 `deleteMany({ where: { id, tenantId } })`，只有 variant DELETE 用 `delete({ where: { id: variantId } })`。

---

## 建議修復優先級

### P0（立即修復）
1. 加 `tenantId` 到所有 `.update()` WHERE clause（CRITICAL-001）
2. 加 rate limit 到 `send-otp`（CRITICAL-003）
3. 加 rate limit 到 `tenant-admin/login`（CRITICAL-004）

### P1（盡快修復）
4. Google OAuth 加 CSRF state validation（CRITICAL-002）
5. 所有 secret 比較改用 `timingSafeEqual`（HIGH-001）
6. `?tenant=` param 加 production guard（HIGH-004）
7. Google OAuth email 唔好放入 URL（HIGH-006）

### P2（計劃修復）
8. OTP 儲存改用 Redis（HIGH-002）
9. Rate limiting 改用 Redis（HIGH-003）
10. Stripe webhook 加 tenantId filter（HIGH-005）
11. `tenant-admin/login` response body 移除 token（LOW-005）

### P3（Nice to Have）
12. 其他 LOW findings
