import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_SLUG = process.env.DEFAULT_TENANT_SLUG || "maysshop";
const DEFAULT_HOSTS = new Set(["hk-marketplace", "www", "localhost", "127.0.0.1"]);

/**
 * Bare platform domain 偵測。
 * wowlix.com / www.wowlix.com → true（show landing page）
 * maysshop.wowlix.com → false（tenant subdomain）
 */
const PLATFORM_ROOT = process.env.PLATFORM_ROOT || "wowlix";

function isPlatformBare(hostname: string): boolean {
  const host = hostname.split(":")[0];
  const parts = host.split(".");
  if (parts.length === 2 && parts[0] === PLATFORM_ROOT) return true;
  if (parts.length === 3 && parts[0] === "www" && parts[1] === PLATFORM_ROOT) return true;
  return false;
}

/**
 * 保留字清單 — 呢啲 path segment 唔會被當成 tenant slug。
 * 用於 /{slug} 路由（P4-F 先用到），而家預留。
 */
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "auth",
  "login",
  "signup",
  "settings",
  "checkout",
  "cart",
  "about",
  "contact",
  "terms",
  "privacy",
  "start",
  "_next",
  "favicon.ico",
]);

/**
 * Extract tenant slug from hostname.
 * Pattern: {slug}.hk-marketplace.vercel.app
 * Returns DEFAULT_SLUG for bare domain, www, or localhost.
 */
function resolveSlugFromHostname(hostname: string): string {
  const host = hostname.split(":")[0];

  if (!host.includes(".")) {
    return DEFAULT_SLUG;
  }

  const subdomain = host.split(".")[0];

  if (DEFAULT_HOSTS.has(subdomain)) {
    return DEFAULT_SLUG;
  }

  return subdomain;
}

/**
 * Check if the first path segment could be a tenant slug (for future /{slug} routing).
 * Returns the slug if it matches, null otherwise.
 */
function resolveSlugFromPath(pathname: string): string | null {
  // Match /{slug} or /{slug}/... where slug is not a reserved word or locale
  const match = pathname.match(/^\/([a-z0-9][\w-]*?)(?:\/|$)/);
  if (!match) return null;

  const segment = match[1];

  // Skip reserved paths
  if (RESERVED_SLUGS.has(segment)) return null;

  // Skip locale prefixes (en, zh, zh-HK etc.)
  if (/^[a-z]{2}(-[a-z]{2,4})?$/i.test(segment)) return null;

  return segment;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Tenant resolution ---
  // Resolve slug from subdomain or ?tenant= dev fallback
  let tenantSlug = resolveSlugFromHostname(request.headers.get("host") || "");

  // Dev fallback: ?tenant=slug query param (localhost only)
  const host = request.headers.get("host") || "";
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    const tenantParam = request.nextUrl.searchParams.get("tenant");
    if (tenantParam) {
      tenantSlug = tenantParam;
    }
  }

  // --- Platform bare domain detection ---
  const isPlatform = isPlatformBare(request.headers.get("host") || "");
  if (isPlatform) {
    tenantSlug = DEFAULT_SLUG;
  }

  // --- Path-based slug routing: /{slug} → /en/{slug} rewrite ---
  // When the first segment is a tenant slug (not a locale or reserved word),
  // rewrite to add /en prefix so Next.js matches app/[locale]/[slug]/page.tsx
  const pathSlug = resolveSlugFromPath(pathname);
  if (pathSlug && tenantSlug === DEFAULT_SLUG) {
    // Check if the remaining path after slug is /admin/...
    // /{slug}/admin/... → redirect to /en/admin/... so admin route group matches
    const restPath = pathname.substring(pathSlug.length + 1); // e.g. "/admin/login"
    if (restPath === "/admin" || restPath.startsWith("/admin/")) {
      const adminUrl = new URL(`/zh-HK${restPath}`, request.url);
      return NextResponse.redirect(adminUrl);
    }

    // Path slug only takes effect when no subdomain tenant is set
    // Rewrite /{slug}/... → /en/{slug}/...
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/zh-HK${pathname}`;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-tenant-slug", tenantSlug);
    requestHeaders.set("x-tenant-path-slug", pathSlug);
    if (isPlatform) {
      requestHeaders.set("x-is-platform", "true");
    }
    return NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
  }

  // --- Skip admin guards for API routes (they handle auth themselves) ---
  const isApiRoute = pathname.startsWith("/api/");

  // --- /start redirect: /start → /en/start ---
  if (!isApiRoute && pathname === "/start") {
    const startUrl = new URL("/zh-HK/start", request.url);
    return NextResponse.redirect(startUrl);
  }

  // --- Admin redirect: /admin → /en/admin ---
  if (!isApiRoute && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    const adminUrl = new URL(`/zh-HK${pathname}`, request.url);
    return NextResponse.redirect(adminUrl);
  }

  // --- Admin auth guard (page routes only) ---
  const isAdminRoute = !isApiRoute && pathname.match(/^\/[^/]+\/admin(?:\/|$)/);
  const isLoginRoute = pathname.match(/^\/[^/]+\/admin\/login/);

  if (isAdminRoute && !isLoginRoute) {
    const sessionCookie = request.cookies.get("admin_session");
    const tenantAdminCookie = request.cookies.get("tenant-admin-token");

    if (!sessionCookie?.value && !tenantAdminCookie?.value) {
      const localeMatch = pathname.match(/^\/([^/]+)/);
      const locale = localeMatch ? localeMatch[1] : "zh-HK";

      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- Auto-redirect from login if already authenticated via JWT ---
  if (isLoginRoute) {
    const tenantAdminCookie = request.cookies.get("tenant-admin-token");
    if (tenantAdminCookie?.value) {
      const localeMatch = pathname.match(/^\/([^/]+)/);
      const locale = localeMatch ? localeMatch[1] : "zh-HK";
      const dashboardUrl = new URL(`/${locale}/admin`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // --- Forward tenant slug via request header ---
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-slug", tenantSlug);
  if (isPlatform) {
    requestHeaders.set("x-is-platform", "true");
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Skip static assets; include API routes so they also receive x-tenant-slug
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
