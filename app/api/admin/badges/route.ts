export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

type BadgePayload = {
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

export const GET = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  const badges = await prisma.badge.findMany({
    where: { tenantId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return ok(req, { badges });
});

export const POST = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  let body: BadgePayload;
  try {
    body = (await req.json()) as BadgePayload;
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  assertNonEmptyString(body.nameZh, "nameZh");
  assertNonEmptyString(body.nameEn, "nameEn");
  const color = normalizeColor(body.color);

  const badge = await prisma.badge.create({
    data: {
      nameZh: (body.nameZh as string).trim(),
      nameEn: (body.nameEn as string).trim(),
      color,
      tenantId,
    },
  });

  return ok(req, badge);
});
