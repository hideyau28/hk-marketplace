export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { getSessionFromCookie } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma";

type BadgeUpdatePayload = {
  nameZh?: unknown;
  nameEn?: unknown;
  color?: unknown;
};

const COLOR_PRESETS: Record<string, string> = {
  red: "#EF4444",
  green: "#22C55E",
  black: "#18181B",
  blue: "#3B82F6",
  orange: "#F97316",
};

function assertNonEmptyString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, "BAD_REQUEST", `${field} must be a non-empty string`);
  }
}

function normalizeColor(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, "BAD_REQUEST", "color must be a non-empty string");
  }
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  if (COLOR_PRESETS[lower]) return COLOR_PRESETS[lower];
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) return trimmed.toUpperCase();
  throw new ApiError(400, "BAD_REQUEST", "color must be a valid hex or preset name");
}

export const PUT = withApi(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const headerSecret = req.headers.get("x-admin-secret");
  const isAuthenticated = headerSecret ? headerSecret === process.env.ADMIN_SECRET : await getSessionFromCookie();
  if (!isAuthenticated) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let body: BadgeUpdatePayload;
  try {
    body = (await req.json()) as BadgeUpdatePayload;
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  const updateData: { nameZh?: string; nameEn?: string; color?: string } = {};

  if (body.nameZh !== undefined) {
    assertNonEmptyString(body.nameZh, "nameZh");
    updateData.nameZh = (body.nameZh as string).trim();
  }

  if (body.nameEn !== undefined) {
    assertNonEmptyString(body.nameEn, "nameEn");
    updateData.nameEn = (body.nameEn as string).trim();
  }

  if (body.color !== undefined) {
    updateData.color = normalizeColor(body.color);
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "BAD_REQUEST", "No valid fields to update");
  }

  const badge = await prisma.badge
    .update({
      where: { id },
      data: updateData,
    })
    .catch(() => null);

  if (!badge) throw new ApiError(404, "NOT_FOUND", "Badge not found");
  return ok(req, badge);
});

export const DELETE = withApi(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const headerSecret = req.headers.get("x-admin-secret");
  const isAuthenticated = headerSecret ? headerSecret === process.env.ADMIN_SECRET : await getSessionFromCookie();
  if (!isAuthenticated) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const badge = await prisma.badge
    .delete({ where: { id } })
    .catch(() => null);

  if (!badge) throw new ApiError(404, "NOT_FOUND", "Badge not found");
  return ok(req, { success: true });
});
