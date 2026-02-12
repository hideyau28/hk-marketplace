export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

type ImportPayload = {
  title?: unknown;
  brand?: unknown;
  category?: unknown;
  price?: unknown;
  description?: unknown;
  imageUrl?: unknown;
  sizeSystem?: unknown;
  sizes?: unknown;
  active?: unknown;
};

function toOptionalString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parsePrice(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return null;
}

function parseActive(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return undefined;
}

function parseSizes(value: unknown) {
  if (Array.isArray(value)) {
    const list = value.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean);
    return list.length > 0 ? list : null;
  }
  if (typeof value === "string") {
    const list = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    return list.length > 0 ? list : null;
  }
  return null;
}

type FailedRow = {
  rowNumber: number;
  reason: string;
};

export const POST = withApi(async (req: Request) => {
  const { tenantId } = await authenticateAdmin(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  if (!Array.isArray(body)) {
    throw new ApiError(400, "BAD_REQUEST", "Expected an array of products");
  }

  let successCount = 0;
  const failures: FailedRow[] = [];

  for (let i = 0; i < body.length; i += 1) {
    const entry = body[i] as ImportPayload;
    const rowNumber = i + 2; // +2 because: +1 for 0-index, +1 for header row

    try {
      const title = toOptionalString(entry.title);
      const brand = toOptionalString(entry.brand);
      const category = toOptionalString(entry.category);
      const imageUrl = toOptionalString(entry.imageUrl);
      const sizeSystem = toOptionalString(entry.sizeSystem);
      const sizes = parseSizes(entry.sizes);
      const price = parsePrice(entry.price);
      const active = parseActive(entry.active);

      if (!title || !brand || price === null) {
        throw new Error("Missing required fields");
      }

      if ((sizes && !sizeSystem) || (sizeSystem && !sizes)) {
        throw new Error("sizeSystem and sizes must both be provided");
      }

      await prisma.product.create({
        data: {
          tenantId,
          title,
          brand,
          price,
          category,
          imageUrl,
          sizeSystem,
          sizes: sizes ?? undefined,
          active: active ?? true,
        },
      });

      successCount += 1;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      console.error(`CSV import error at row ${rowNumber}:`, reason);
      failures.push({ rowNumber, reason });
    }
  }

  return ok(req, { successCount, failureCount: failures.length, failures });
});
