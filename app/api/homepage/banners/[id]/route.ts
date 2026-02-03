export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { getSessionFromCookie } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/homepage/banners/[id] - update a banner
export const PUT = withApi(async (req: Request, ctx: RouteContext) => {
  const headerSecret = req.headers.get("x-admin-secret");
  const isAuthenticated = headerSecret
    ? headerSecret === process.env.ADMIN_SECRET
    : await getSessionFromCookie();
  if (!isAuthenticated) {
    throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");
  }

  const { id } = await ctx.params;
  const body = await req.json();

  const existing = await prisma.homepageBanner.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Banner not found");
  }

  const banner = await prisma.homepageBanner.update({
    where: { id },
    data: {
      imageUrl: body.imageUrl !== undefined ? body.imageUrl.trim() : undefined,
      title: body.title !== undefined ? (body.title?.trim() || null) : undefined,
      subtitle: body.subtitle !== undefined ? (body.subtitle?.trim() || null) : undefined,
      linkUrl: body.linkUrl !== undefined ? (body.linkUrl?.trim() || null) : undefined,
      sortOrder: body.sortOrder !== undefined ? body.sortOrder : undefined,
      active: body.active !== undefined ? body.active : undefined,
      position: body.position !== undefined ? body.position : undefined,
    },
  });

  return ok(req, { banner });
});

// DELETE /api/homepage/banners/[id] - delete a banner
export const DELETE = withApi(async (req: Request, ctx: RouteContext) => {
  const headerSecret = req.headers.get("x-admin-secret");
  const isAuthenticated = headerSecret
    ? headerSecret === process.env.ADMIN_SECRET
    : await getSessionFromCookie();
  if (!isAuthenticated) {
    throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");
  }

  const { id } = await ctx.params;

  const existing = await prisma.homepageBanner.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Banner not found");
  }

  await prisma.homepageBanner.delete({ where: { id } });

  return ok(req, { success: true });
});
