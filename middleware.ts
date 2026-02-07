import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_SLUG = "hk-marketplace";
const DEFAULT_HOSTS = new Set(["hk-marketplace", "www", "localhost", "127.0.0.1"]);

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

  // --- Skip admin guards for API routes (they handle auth themselves) ---
  const isApiRoute = pathname.startsWith("/api/");

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

    if (!sessionCookie?.value) {
      const localeMatch = pathname.match(/^\/([^/]+)/);
      const locale = localeMatch ? localeMatch[1] : "en";

      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- Forward tenant slug via request header ---
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-slug", tenantSlug);

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
