# TASK: Admin Authentication 加強

> **執行者:** Codex 5.2  
> **自主權限:** 完全自主，唔需要人工介入  
> **目標:** 將 Admin Auth 從 sessionStorage 改為 HTTP-only Cookie + JWT

---

## ⚠️ 執行規則

1. **唔好問問題** — 所有決策已經喺呢份文件定義
2. **遇到 error 先嘗試自己解決** — 如果解決唔到，記錄 error 繼續下一步
3. **每步完成後自我驗證** — 確保冇 TypeScript error
4. **最後先 commit** — 所有改動完成 + build pass 先 commit

---

## 📋 執行清單

按順序執行，每步完成打 ✓：
```
[ ] Step 1: 安裝依賴
[ ] Step 2: 建立 lib/admin/session.ts
[ ] Step 3: 建立 app/api/admin/login/route.ts
[ ] Step 4: 建立 app/api/admin/logout/route.ts
[ ] Step 5: 建立 middleware.ts
[ ] Step 6: 建立 app/[locale]/admin/login/page.tsx
[ ] Step 7: 更新 app/api/admin/products/route.ts
[ ] Step 8: 更新 app/api/admin/products/[id]/route.ts
[ ] Step 9: 更新 Admin Pages (移除 client-side auth)
[ ] Step 10: 驗證 build
[ ] Step 11: Commit
```

---

## Step 1: 安裝依賴
```bash
npm install jose
```

**驗證:** package.json 有 "jose" 依賴

---

## Step 2: 建立 lib/admin/session.ts
```typescript
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const EXPIRY = "24h";

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecretKey());
  return token;
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

export async function getSessionFromCookie(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) return false;
    return verifySession(sessionCookie.value);
  } catch {
    return false;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function validateAdminSecret(secret: string): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;
  return secret === adminSecret;
}
```

**驗證:** 檔案存在 + 冇 TypeScript error

---

## Step 3: 建立 app/api/admin/login/route.ts
```typescript
import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  setSessionCookie,
  validateAdminSecret,
} from "@/lib/admin/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret } = body;

    if (!secret || typeof secret !== "string") {
      return NextResponse.json(
        { ok: false, error: "Secret is required" },
        { status: 400 }
      );
    }

    if (!validateAdminSecret(secret)) {
      return NextResponse.json(
        { ok: false, error: "Invalid admin secret" },
        { status: 401 }
      );
    }

    const token = await createSession();
    await setSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { ok: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
```

**驗證:** 檔案存在 + 冇 TypeScript error

---

## Step 4: 建立 app/api/admin/logout/route.ts
```typescript
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/admin/session";

export const runtime = "nodejs";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { ok: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
```

**驗證:** 檔案存在 + 冇 TypeScript error

---

## Step 5: 建立 middleware.ts (project root)

**重要:** 如果已經有 middleware.ts，merge 入去而唔係 overwrite。
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.match(/^\/[^/]+\/admin(?:\/|$)/);
  const isLoginRoute = pathname.match(/^\/[^/]+\/admin\/login/);

  if (isAdminRoute && !isLoginRoute) {
    const sessionCookie = request.cookies.get("admin_session");

    if (!sessionCookie?.value) {
      const localeMatch = pathname.match(/^\/([^/]+)/);
      const locale = localeMatch ? localeMatch[1] : "en";
      
      const loginUrl = new URL(\`/\${locale}/admin/login\`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
```

**驗證:** 檔案存在 + 冇 TypeScript error

---

## Step 6: 建立 app/[locale]/admin/login/page.tsx
```typescript
"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AdminLoginPage() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      const data = await res.json();

      if (data.ok) {
        router.push(\`/\${locale}/admin/products\`);
        router.refresh();
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
          <h1 className="text-2xl font-semibold text-zinc-900 text-center">
            Admin Login
          </h1>
          <p className="mt-2 text-zinc-500 text-center text-sm">
            Enter your admin secret to continue
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="secret"
                className="block text-sm font-medium text-zinc-700"
              >
                Admin Secret
              </label>
              <input
                id="secret"
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                placeholder="Enter admin secret"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !secret}
              className="w-full rounded-xl bg-zinc-900 py-3 text-white font-semibold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

**驗證:** 檔案存在 + 冇 TypeScript error

---

## Step 7: 更新 app/api/admin/products/route.ts

喺檔案頂部加入 import：
```typescript
import { getSessionFromCookie } from "@/lib/admin/session";
```

喺每個 handler (GET, POST) 嘅開頭加入：
```typescript
const isAuthenticated = await getSessionFromCookie();
if (!isAuthenticated) {
  return NextResponse.json(
    { ok: false, error: "Unauthorized" },
    { status: 401 }
  );
}
```

**驗證:** 檔案更新 + 冇 TypeScript error

---

## Step 8: 更新 app/api/admin/products/[id]/route.ts

同 Step 7 一樣：

1. 加入 import getSessionFromCookie
2. 喺每個 handler 開頭加入 auth check

**驗證:** 檔案更新 + 冇 TypeScript error

---

## Step 9: 更新 Admin Pages

需要更新嘅檔案：
- app/[locale]/admin/products/page.tsx
- app/[locale]/admin/orders/page.tsx
- app/[locale]/admin/settings/page.tsx

**改動：**

1. 移除任何 getAdminSecret 或 client-secret 相關嘅 import
2. 移除 useEffect 入面嘅 secret validation logic
3. 移除相關嘅 redirect logic（middleware 已經 handle）
4. 如果有 "Enter Admin Secret" 嘅 UI，移除佢

**加入 Logout Button（每個 admin page）：**
```typescript
const router = useRouter();
const params = useParams();
const locale = (params.locale as string) || "en";

const handleLogout = async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  router.push(\`/\${locale}/admin/login\`);
  router.refresh();
};
```

喺 UI 適當位置加入 logout button：
```tsx
<button
  onClick={handleLogout}
  className="rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-200 transition-colors"
>
  Logout
</button>
```

**驗證:** 所有檔案更新 + 冇 TypeScript error

---

## Step 10: 驗證 Build
```bash
npm run build
```

**預期結果:** Build successful，冇 error

**如果有 error：**
1. 讀 error message
2. 修正問題
3. 再跑 npm run build
4. 重複直到 pass

---

## Step 11: Commit
```bash
git add -A
git commit -m "feat: implement secure admin auth with HTTP-only cookies

- Add JWT-based session management using jose
- Create login/logout API endpoints
- Add middleware to protect admin routes
- Create admin login page
- Add auth checks to admin API routes
- Add logout button to admin pages
- Remove insecure sessionStorage-based auth"
```

---

## 🔍 最終驗證清單

完成所有步驟後，確認以下全部 pass：

| # | 測試 | 預期結果 |
|---|------|----------|
| 1 | npm run build | Pass |
| 2 | 檔案存在: lib/admin/session.ts | Yes |
| 3 | 檔案存在: app/api/admin/login/route.ts | Yes |
| 4 | 檔案存在: app/api/admin/logout/route.ts | Yes |
| 5 | 檔案存在: middleware.ts | Yes |
| 6 | 檔案存在: app/[locale]/admin/login/page.tsx | Yes |
| 7 | Git commit 成功 | Yes |

---

## 📝 完成報告格式

執行完成後，輸出以下報告：
```
## Admin Auth Implementation - Complete

### Status: SUCCESS / FAILED

### Completed Steps:
- [x] Step 1-11

### Files Created:
- lib/admin/session.ts
- app/api/admin/login/route.ts
- app/api/admin/logout/route.ts
- app/[locale]/admin/login/page.tsx
- middleware.ts

### Files Modified:
- app/api/admin/products/route.ts
- app/api/admin/products/[id]/route.ts
- app/[locale]/admin/products/page.tsx
- app/[locale]/admin/orders/page.tsx
- app/[locale]/admin/settings/page.tsx
- package.json

### Build Result:
npm run build - SUCCESS/FAILED

### Issues Encountered:
- (list any)

### Commit:
- Hash: [hash]
- Message: feat: implement secure admin auth with HTTP-only cookies
```

---

**END OF TASK**
