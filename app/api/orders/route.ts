export const runtime = "nodejs";

import crypto from "node:crypto";
import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";

const ROUTE = "/api/orders";
const ORDER_STATUSES = [
    "PENDING",
    "PAID",
    "FULFILLING",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
    "DISPUTED",
] as const;

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

function normalizeStatus(value?: string | null) {
    if (!value) return null;
    const status = value.trim().toUpperCase();
    if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
        throw new ApiError(400, "BAD_REQUEST", `Invalid status: ${value}`);
    }
    return status as (typeof ORDER_STATUSES)[number];
}

type CreateOrderPayload = {
    customerName: string;
    phone: string;
    email?: string | null;
    items: Array<{ productId: string; name: string; unitPrice: number; quantity: number }>;
    amounts: {
        subtotal: number;
        discount?: number;
        deliveryFee?: number;
        total: number;
        currency: string;
    };
    fulfillment: {
        type: "pickup" | "delivery";
        address?: {
            line1: string;
            district?: string;
            notes?: string;
        };
    };
    note?: string | null;
};

function assertNonEmptyString(value: unknown, field: string) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new ApiError(400, "BAD_REQUEST", `Missing or invalid ${field}`);
    }
}

function assertPositiveNumber(value: unknown, field: string) {
    if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
        throw new ApiError(400, "BAD_REQUEST", `Missing or invalid ${field}`);
    }
}

function assertPositiveInt(value: unknown, field: string) {
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
        throw new ApiError(400, "BAD_REQUEST", `Missing or invalid ${field}`);
    }
}

function getIdempotencyKey(req: Request) {
    return (req.headers.get("x-idempotency-key") ?? req.headers.get("idempotency-key") ?? "").trim();
}

function parseCreatePayload(body: any): CreateOrderPayload {
    if (!body || typeof body !== "object") {
        throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    assertNonEmptyString(body.customerName, "customerName");
    assertNonEmptyString(body.phone, "phone");

    if (!Array.isArray(body.items) || body.items.length === 0) {
        throw new ApiError(400, "BAD_REQUEST", "Missing or invalid items");
    }

    for (const [idx, item] of body.items.entries()) {
        if (!item || typeof item !== "object") {
            throw new ApiError(400, "BAD_REQUEST", `Invalid items[${idx}]`);
        }
        assertNonEmptyString(item.productId, `items[${idx}].productId`);
        assertNonEmptyString(item.name, `items[${idx}].name`);
        assertPositiveNumber(item.unitPrice, `items[${idx}].unitPrice`);
        assertPositiveInt(item.quantity, `items[${idx}].quantity`);
    }

    if (!body.amounts || typeof body.amounts !== "object") {
        throw new ApiError(400, "BAD_REQUEST", "Missing or invalid amounts");
    }

    assertPositiveNumber(body.amounts.subtotal, "amounts.subtotal");
    if (body.amounts.discount !== undefined) {
        assertPositiveNumber(body.amounts.discount, "amounts.discount");
    }
    if (body.amounts.deliveryFee !== undefined) {
        assertPositiveNumber(body.amounts.deliveryFee, "amounts.deliveryFee");
    }
    assertPositiveNumber(body.amounts.total, "amounts.total");

    const currencyRaw = body.amounts.currency;
    if (typeof currencyRaw !== "string" || currencyRaw.trim().length === 0) {
        throw new ApiError(400, "BAD_REQUEST", "Missing or invalid amounts.currency");
    }
    const currency = currencyRaw.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) {
        throw new ApiError(400, "BAD_REQUEST", "amounts.currency must be 3 letters");
    }

    if (!body.fulfillment || typeof body.fulfillment !== "object") {
        throw new ApiError(400, "BAD_REQUEST", "Missing or invalid fulfillment");
    }

    if (body.fulfillment.type !== "pickup" && body.fulfillment.type !== "delivery") {
        throw new ApiError(400, "BAD_REQUEST", "fulfillment.type must be pickup or delivery");
    }

    if (body.fulfillment.type === "delivery") {
        if (!body.fulfillment.address || typeof body.fulfillment.address !== "object") {
            throw new ApiError(400, "BAD_REQUEST", "fulfillment.address is required for delivery");
        }
        assertNonEmptyString(body.fulfillment.address.line1, "fulfillment.address.line1");
    }

    return {
        customerName: body.customerName.trim(),
        phone: body.phone.trim(),
        email: typeof body.email === "string" && body.email.trim().length > 0 ? body.email.trim() : undefined,
        items: body.items,
        amounts: {
            ...body.amounts,
            currency,
        },
        fulfillment: body.fulfillment,
        note: typeof body.note === "string" && body.note.trim().length > 0 ? body.note.trim() : undefined,
    };
}

// GET /api/orders (admin)
export const GET = withApi(
    async (req) => {
        const { searchParams } = new URL(req.url);
        const status = normalizeStatus(searchParams.get("status"));
        const limitParam = searchParams.get("limit");
        const limit = limitParam ? Number(limitParam) : 50;

        if (limitParam && (Number.isNaN(limit) || limit <= 0 || limit > 200)) {
            throw new ApiError(400, "BAD_REQUEST", "limit must be between 1 and 200");
        }

        const orders = await prisma.order.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return ok(req, { orders });
    },
    { admin: true }
);

// POST /api/orders (customer create + idempotency)
export const POST = withApi(async (req) => {
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

    const requestHash = sha256(
        stableStringify({ route: ROUTE, method: "POST", body: payload })
    );

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

    const order = await prisma.order.create({
        data: {
            customerName: payload.customerName,
            phone: payload.phone,
            email: payload.email ?? null,
            items: payload.items,
            amounts: payload.amounts,
            fulfillmentType: payload.fulfillment.type === "pickup" ? "PICKUP" : "DELIVERY",
            fulfillmentAddress:
                payload.fulfillment.type === "delivery" ? (payload.fulfillment.address ?? undefined) : undefined,
            status: "PENDING",
            note: payload.note ?? null,
        },
    });

    await prisma.idempotencyKey.create({
        data: {
            key: idemKey,
            route: ROUTE,
            method: "POST",
            requestHash,
            status: 200,
            responseJson: order as any,
        },
    });

    return ok(req, order);
});