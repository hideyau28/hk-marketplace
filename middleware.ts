import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect /admin to /en/admin
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const adminUrl = new URL(`/en${pathname}`, request.url);
    return NextResponse.redirect(adminUrl);
  }

  const isAdminRoute = pathname.match(/^\/[^/]+\/admin(?:\/|$)/);
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
