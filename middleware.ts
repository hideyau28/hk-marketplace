import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_SLUG = "wowlix";
const DEFAULT_HOSTS = new Set(["hk-marketplace", "www", "localhost", "127.0.0.1"]);

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

  // --- Path-based slug routing (future: /{slug} → tenant storefront) ---
  // For now, just detect and set header. P4-F will add actual rendering.
  const pathSlug = resolveSlugFromPath(pathname);
  let tenantPathSlug: string | null = null;
  if (pathSlug && tenantSlug === DEFAULT_SLUG) {
    // Path slug only takes effect when no subdomain tenant is set
    tenantPathSlug = pathSlug;
  }

  // --- Skip admin guards for API routes (they handle auth themselves) ---
  const isApiRoute = pathname.startsWith("/api/");

  // --- /start redirect: /start → /en/start ---
  if (!isApiRoute && pathname === "/start") {
    const startUrl = new URL("/en/start", request.url);
    return NextResponse.redirect(startUrl);
  }

  // --- Admin redirect: /admin → /en/admin ---
  if (!isApiRoute && (pathname === "/admin" || pathname.startsWith("/admin/"))) {
    const adminUrl = new URL(`/en${pathname}`, request.url);
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
      const locale = localeMatch ? localeMatch[1] : "en";

      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- Auto-redirect from login if already authenticated via JWT ---
  if (isLoginRoute) {
    const tenantAdminCookie = request.cookies.get("tenant-admin-token");
    if (tenantAdminCookie?.value) {
      const localeMatch = pathname.match(/^\/([^/]+)/);
      const locale = localeMatch ? localeMatch[1] : "en";
      const dashboardUrl = new URL(`/${locale}/admin`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // --- Forward tenant slug via request header ---
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-slug", tenantSlug);
  if (tenantPathSlug) {
    requestHeaders.set("x-tenant-path-slug", tenantPathSlug);
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
