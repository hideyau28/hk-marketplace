export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
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

function getIdempotencyKey(req: Request) {
  return (req.headers.get("x-idempotency-key") ?? req.headers.get("idempotency-key") ?? "").trim();
}

type CreateProductPayload = {
  brand?: string | null;
  title: string;
  price: number;
  imageUrl?: string | null;
  category?: string | null;
  badges?: string[];
  active?: boolean;
  sizes?: any;
  stock?: number;
};

function parseCreatePayload(body: any): CreateProductPayload {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  assertNonEmptyString(body.title, "title");
  assertNonNegativeNumber(body.price, "price");

  const badges = parseBadges(body.badges);

  const brand =
    typeof body.brand === "string" && body.brand.trim().length > 0
      ? body.brand.trim()
      : null;

  // Validate category: optional, 1-50 chars if provided
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

  // Sizes: accept any JSON value (validated by client)
  const sizes = body.sizes !== undefined && body.sizes !== null ? body.sizes : undefined;

  // Stock: optional non-negative integer
  let stock: number | undefined = undefined;
  if (body.stock !== undefined && body.stock !== null) {
    if (typeof body.stock !== "number" || body.stock < 0) {
      throw new ApiError(400, "BAD_REQUEST", "stock must be a non-negative number");
    }
    stock = Math.floor(body.stock);
  }

  return {
    brand,
    title: body.title.trim(),
    price: body.price,
    imageUrl: typeof body.imageUrl === "string" && body.imageUrl.trim().length > 0 ? body.imageUrl.trim() : null,
    category,
    badges: badges.length > 0 ? badges : undefined,
    active: typeof body.active === "boolean" ? body.active : true,
    sizes,
    stock,
  };
}

// GET /api/admin/products (admin)
export const GET = withApi(
  async (req) => {
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
      where: active !== undefined ? { active } : undefined,
      orderBy: { updatedAt: "desc" },
      take: limit,
    });

    return ok(req, { products });
  },
  { admin: true }
);

// POST /api/admin/products (admin create + idempotency)
export const POST = withApi(
  async (req) => {
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

    const existing = await prisma.idempotencyKey.findUnique({
      where: {
        key_route_method: { key: idemKey, route: ROUTE, method: "POST" },
      },
    });

    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new ApiError(409, "CONFLICT", "Idempotency key already used with different payload");
      }
      return ok(req, existing.responseJson);
    }

    const product = await prisma.product.create({
      data: {
        brand: payload.brand,
        title: payload.title,
        price: payload.price,
        imageUrl: payload.imageUrl ?? null,
        category: payload.category ?? null,
        badges: payload.badges,
        active: payload.active ?? true,
        ...(payload.sizes !== undefined ? { sizes: payload.sizes } : {}),
        ...(payload.stock !== undefined ? { stock: payload.stock } : {}),
      },
    });

    await prisma.idempotencyKey.create({
      data: {
        key: idemKey,
        route: ROUTE,
        method: "POST",
        requestHash,
        status: 200,
        responseJson: product as any,
      },
    });

    return ok(req, product);
  },
  { admin: true }
);
