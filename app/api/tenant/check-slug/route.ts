import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApi, ok, ApiError } from "@/lib/api/route-helpers";

const RESERVED_SLUGS = new Set([
  "admin", "api", "auth", "login", "start", "_next", "maysshop",
  "app", "checkout", "cart", "search", "orders", "profile",
  "collections", "settings", "signup", "about", "contact",
  "terms", "privacy", "favicon.ico",
]);

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export const GET = withApi(async (req: Request) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug")?.trim().toLowerCase();

  if (!slug) {
    throw new ApiError(400, "BAD_REQUEST", "slug parameter required");
  }

  if (!SLUG_REGEX.test(slug)) {
    return ok(req, {
      available: false,
      reason: "格式唔啱：3-30 個字，只可以用細楷英文、數字同連字號，頭尾唔可以係連字號",
    });
  }

  if (RESERVED_SLUGS.has(slug)) {
    return ok(req, { available: false, reason: "呢個名係保留字，唔可以用" });
  }

  // Query database for existing tenant with this slug
  const existing = await prisma.tenant.findUnique({
    where: { slug: slug },
  });

  if (existing) {
    return ok(req, { available: false, reason: "呢個名已經有人用咗" });
  }

  return ok(req, { available: true });
});
