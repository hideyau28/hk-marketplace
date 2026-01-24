export const runtime = "nodejs";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ApiError, ok, withApi } from "@/lib/api/route-helpers";

const ROUTE = "/api/store-settings";

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

// GET /api/store-settings
export const GET = withApi(async (req) => {
  const row = await prisma.storeSettings.findUnique({ where: { id: "default" } }).catch(() => null);
  return ok(req, row ?? null);
}, { admin: true });

// PUT /api/store-settings (admin + idempotency)
export const PUT = withApi(
  async (req) => {
    // 1) parse body
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    // 2) require idempotency key
    const idemKey = (req.headers.get("x-idempotency-key") ?? "").trim();
    if (!idemKey) {
      throw new ApiError(400, "BAD_REQUEST", "Missing x-idempotency-key");
    }

    // 3) compute hash (route + method + canonical body)
    const requestHash = sha256(
      stableStringify({ route: ROUTE, method: "PUT", body })
    );

    // 4) check prior
    const existing = await prisma.idempotencyKey.findUnique({
      where: {
        key_route_method: { key: idemKey, route: ROUTE, method: "PUT" },
      },
    });

    if (existing) {
      if (existing.requestHash !== requestHash) {
        // same key but different payload => conflict
        throw new ApiError(
          409,
          "BAD_REQUEST",
          "Idempotency key already used with different payload"
        );
      }
      // replay => return stored response
      return ok(req, existing.responseJson);
    }

    // 5) first-time => do write
    const updated = await prisma.storeSettings.upsert({
      where: { id: (body?.id ?? "default") as string },
      update: body ?? {},
      create: { id: (body?.id ?? "default") as string, ...(body ?? {}) },
    });

    // 6) persist idempotency record
    await prisma.idempotencyKey.create({
      data: {
        key: idemKey,
        route: ROUTE,
        method: "PUT",
        requestHash,
        status: 200,
        responseJson: updated as any,
      },
    });

    return ok(req, updated);
  },
  { admin: true } // 必須 header x-admin-secret
);
