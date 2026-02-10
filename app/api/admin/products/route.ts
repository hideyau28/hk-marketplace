export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";
import { parseBadges } from "@/lib/parse-badges";
import crypto from "node:crypto";

const ROUTE = "/api/admin/products";

function stableStringify(input: unknown): string {
  const seen = new WeakSet<object>();

  const norm = (v: any): any => {
    if (v === null || v === undefined) return v;
    if (typeof v !== "object") return v;

    if (seen.has(v)) return "[Circular]";
    seen.add(v);

    if (Array.isArray(v)) return v.map(norm);

    const out: Record<string, any> = {};
    for (const k of Object.keys(v).sort()) out[k] = norm(v[k]);
    return out;
  };

  return JSON.stringify(norm(input));
}

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function assertNonEmptyString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, "BAD_REQUEST", `Missing or invalid ${field}`);
  }
}

function assertNonNegativeNumber(value: unknown, field: string) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw new ApiError(400, "BAD_REQUEST", `${field} must be a non-negative number`);
  }
}

function assertNonNegativeInt(value: unknown, field: string) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new ApiError(400, "BAD_REQUEST", `${field} must be a non-negative integer`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSizes(value: unknown): any {
  if (value === undefined || value === null) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    // DualVariantData format — pass through
    if ("dimensions" in obj && "combinations" in obj) return obj;
    const entries = Object.entries(obj);
    if (entries.length === 0) return null;
    // New single variant format: {"S": {"qty": N, "status": "..."}}
    const firstVal = entries[0][1];
    if (typeof firstVal === "object" && firstVal !== null && "qty" in (firstVal as Record<string, unknown>)) {
      return obj;
    }
    // Legacy format: {"S": 5}
    const result: Record<string, number> = {};
    for (const [key, val] of entries) {
      if (typeof val === "number" && val >= 0) {
        result[key] = val;
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  }
  if (Array.isArray(value)) {
    const result: Record<string, number> = {};
    value.forEach((v) => {
      if (typeof v === "string" && v.trim()) {
        result[v.trim()] = 0;
      }
    });
    return Object.keys(result).length > 0 ? result : null;
  }
  if (typeof value === "string") {
    const result: Record<string, number> = {};
    value.split(",").forEach((v) => {
      if (v.trim()) {
        result[v.trim()] = 0;
      }
    });
    return Object.keys(result).length > 0 ? result : null;
  }
  throw new ApiError(400, "BAD_REQUEST", "sizes must be an object, array, or comma-separated string");
}

function getIdempotencyKey(req: Request) {
  return (req.headers.get("x-idempotency-key") ?? req.headers.get("idempotency-key") ?? "").trim();
}

type CreateProductPayload = {
  brand?: string | null;
  title: string;
  price: number;
  originalPrice?: number | null;
  imageUrl?: string | null;
  images?: string[];
  videoUrl?: string | null;
  category?: string | null;
  badges?: string[];
  sizeSystem?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sizes?: any;
  stock?: number;
  active?: boolean;
};

function parseCreatePayload(body: any): CreateProductPayload {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  assertNonEmptyString(body.title, "title");
  assertNonNegativeNumber(body.price, "price");

  let originalPrice: number | null = null;
  if (body.originalPrice !== undefined && body.originalPrice !== null) {
    assertNonNegativeNumber(body.originalPrice, "originalPrice");
    originalPrice = body.originalPrice;
  }

  const badges = body.badges === undefined ? undefined : parseBadges(body.badges);

  const brand =
    typeof body.brand === "string" && body.brand.trim().length > 0
      ? body.brand.trim()
      : null;

  let category: string | null = null;
  if (body.category !== undefined && body.category !== null) {
    if (typeof body.category !== "string") {
      throw new ApiError(400, "BAD_REQUEST", "category must be a string");
    }
    const trimmed = body.category.trim();
    if (trimmed.length > 0) {
      if (trimmed.length > 50) {
        throw new ApiError(400, "BAD_REQUEST", "category must be 50 characters or less");
      }
      category = trimmed;
    }
  }

  const sizeSystem =
    typeof body.sizeSystem === "string" && body.sizeSystem.trim().length > 0
      ? body.sizeSystem.trim()
      : null;
  const sizes = parseSizes(body.sizes);
  // DualVariantData 唔需要 sizeSystem（label 喺 dimensions 入面）
  const isDualFormat = sizes && typeof sizes === "object" && "dimensions" in sizes;
  if (!isDualFormat && ((sizeSystem && !sizes) || (!sizeSystem && sizes))) {
    throw new ApiError(400, "BAD_REQUEST", "sizeSystem and sizes must both be provided");
  }

  if (body.stock !== undefined) {
    assertNonNegativeInt(body.stock, "stock");
  }

  let images: string[] | undefined = undefined;
  if (body.images !== undefined) {
    if (Array.isArray(body.images)) {
      const validImages = body.images.every((img: unknown) => typeof img === "string");
      if (!validImages) {
        throw new ApiError(400, "BAD_REQUEST", "images must be an array of strings");
      }
      images = body.images.map((img: string) => img.trim()).filter((img: string) => img.length > 0);
    } else if (body.images !== null) {
      throw new ApiError(400, "BAD_REQUEST", "images must be an array of strings");
    }
  }

  return {
    brand,
    title: body.title.trim(),
    price: body.price,
    originalPrice,
    imageUrl: typeof body.imageUrl === "string" && body.imageUrl.trim().length > 0 ? body.imageUrl.trim() : null,
    images,
    videoUrl: typeof body.videoUrl === "string" && body.videoUrl.trim().length > 0 ? body.videoUrl.trim() : null,
    category,
    badges: badges === undefined ? undefined : badges,
    sizeSystem,
    sizes: sizes ?? undefined,
    stock: body.stock !== undefined ? body.stock : undefined,
    active: typeof body.active === "boolean" ? body.active : true,
  };
}

// GET /api/admin/products (admin)
export const GET = withApi(
  async (req) => {
    const { tenantId } = await authenticateAdmin(req);

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const activeParam = searchParams.get("active");

    const limit = limitParam ? Number(limitParam) : 50;

    if (limitParam && (Number.isNaN(limit) || limit <= 0 || limit > 200)) {
      throw new ApiError(400, "BAD_REQUEST", "limit must be between 1 and 200");
    }

    let active: boolean | undefined = undefined;
    if (activeParam !== null) {
      if (activeParam === "true") {
        active = true;
      } else if (activeParam === "false") {
        active = false;
      } else {
        throw new ApiError(400, "BAD_REQUEST", "active must be true or false");
      }
    }

    const products = await prisma.product.findMany({
      where: { tenantId, ...(active !== undefined ? { active } : {}) },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });

    return ok(req, { products });
  }
);

// POST /api/admin/products (admin create + idempotency)
export const POST = withApi(
  async (req) => {
    const { tenantId } = await authenticateAdmin(req);

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    const payload = parseCreatePayload(body);

    const idemKey = getIdempotencyKey(req);
    if (!idemKey) {
      throw new ApiError(400, "BAD_REQUEST", "Missing x-idempotency-key");
    }

    const requestHash = sha256(stableStringify({ route: ROUTE, method: "POST", body: payload }));

    const existing = await prisma.idempotencyKey.findFirst({
      where: { key: idemKey, route: ROUTE, method: "POST", tenantId },
    });

    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new ApiError(409, "CONFLICT", "Idempotency key already used with different payload");
      }
      return ok(req, existing.responseJson);
    }

    const product = await prisma.product.create({
      data: {
        tenantId,
        brand: payload.brand,
        title: payload.title,
        price: payload.price,
        originalPrice: payload.originalPrice,
        imageUrl: payload.imageUrl ?? null,
        images: payload.images ?? [],
        videoUrl: payload.videoUrl ?? null,
        category: payload.category ?? null,
        badges: payload.badges,
        sizeSystem: payload.sizeSystem ?? null,
        sizes: payload.sizes ?? undefined,
        stock: payload.stock ?? 0,
        active: payload.active ?? true,
      },
    });

    await prisma.idempotencyKey.create({
      data: {
        tenantId,
        key: idemKey,
        route: ROUTE,
        method: "POST",
        requestHash,
        status: 200,
        responseJson: product as any,
      },
    });

    return ok(req, product);
  }
);
