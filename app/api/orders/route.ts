export const runtime = "nodejs";

import crypto from "node:crypto";
import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";
import { saveReceiptHtml } from "@/lib/email";

const ROUTE = "/api/orders";

async function generateOrderNumber(): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const prefix = `HK-${dateStr}-`;

    // Find the highest sequence number for today
    const lastOrder = await prisma.order.findFirst({
        where: {
            orderNumber: {
                startsWith: prefix,
            },
        },
        orderBy: {
            orderNumber: "desc",
        },
        select: {
            orderNumber: true,
        },
    });

    let sequence = 1;
    if (lastOrder?.orderNumber) {
        const lastSeq = parseInt(lastOrder.orderNumber.slice(-3), 10);
        if (!isNaN(lastSeq)) {
            sequence = lastSeq + 1;
        }
    }

    return `${prefix}${sequence.toString().padStart(3, "0")}`;
}

const ORDER_STATUSES = [
    // New status flow
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "COMPLETED",
    "CANCELLED",
    "REFUNDED",
    // Legacy statuses
    "PAID",
    "FULFILLING",
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
    // Local payment fields (FPS/PayMe/Alipay)
    paymentMethod?: string | null;
    paymentProof?: string | null;
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
    const defaultCurrencyRaw = process.env.DEFAULT_CURRENCY;
    if (defaultCurrencyRaw) {
        const defaultCurrency = defaultCurrencyRaw.trim().toUpperCase();
        if (defaultCurrency && currency !== defaultCurrency) {
            throw new ApiError(400, "BAD_REQUEST", `amounts.currency must be ${defaultCurrency}`);
        }
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
        paymentMethod: typeof body.paymentMethod === "string" && body.paymentMethod.trim().length > 0 ? body.paymentMethod.trim() : undefined,
        paymentProof: typeof body.paymentProof === "string" && body.paymentProof.trim().length > 0 ? body.paymentProof.trim() : undefined,
    };
}

function amountMatches(actual: number, expected: number) {
    if (Number.isInteger(actual) && Number.isInteger(expected)) {
        return actual === expected;
    }
    return Math.abs(actual - expected) < 0.0001;
}

type RepricedOrder = {
    items: CreateOrderPayload["items"];
    amounts: CreateOrderPayload["amounts"];
};

async function repriceOrder(payload: CreateOrderPayload): Promise<RepricedOrder> {
    const productIds = Array.from(new Set(payload.items.map((item) => item.productId)));
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, title: true, price: true, active: true },
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    for (const productId of productIds) {
        if (!productMap.has(productId)) {
            throw new ApiError(400, "BAD_REQUEST", "Product not found");
        }
    }

    let subtotal = 0;
    const repricedItems = payload.items.map((item) => {
        const product = productMap.get(item.productId)!;
        if (product.active === false) {
            throw new ApiError(400, "BAD_REQUEST", "Product not available");
        }
        const unitPrice = product.price;
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;
        return {
            ...item,
            name: product.title,
            unitPrice,
        };
    });

    const discount = payload.amounts.discount ?? 0;
    const deliveryFee = payload.amounts.deliveryFee ?? 0;
    const total = subtotal + deliveryFee - discount;

    const computedAmounts: CreateOrderPayload["amounts"] = {
        subtotal,
        total,
        currency: payload.amounts.currency,
    };

    if (payload.amounts.discount !== undefined) {
        computedAmounts.discount = discount;
    }
    if (payload.amounts.deliveryFee !== undefined) {
        computedAmounts.deliveryFee = deliveryFee;
    }

    if (
        !amountMatches(payload.amounts.subtotal, computedAmounts.subtotal) ||
        !amountMatches(payload.amounts.total, computedAmounts.total)
    ) {
        throw new ApiError(400, "BAD_REQUEST", "amounts mismatch (repriced)");
    }

    return {
        items: repricedItems,
        amounts: computedAmounts,
    };
}

// GET /api/orders (admin)
export const GET = withApi(
    async (req) => {
        const { searchParams } = new URL(req.url);
        const status = normalizeStatus(searchParams.get("status"));
        const search = searchParams.get("q")?.trim() || null;
        const limitParam = searchParams.get("limit");
        const limit = limitParam ? Number(limitParam) : 50;

        if (limitParam && (Number.isNaN(limit) || limit <= 0 || limit > 200)) {
            throw new ApiError(400, "BAD_REQUEST", "limit must be between 1 and 200");
        }

        // Build where clause
        const where: any = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            // Search by orderNumber or phone (case-insensitive)
            where.OR = [
                { orderNumber: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
            ];
        }

        const orders = await prisma.order.findMany({
            where: Object.keys(where).length > 0 ? where : undefined,
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                paymentAttempts: {
                    select: {
                        id: true,
                        provider: true,
                        status: true,
                        amount: true,
                        currency: true,
                        stripeCheckoutSessionId: true,
                        stripePaymentIntentId: true,
                        stripeChargeId: true,
                        failureCode: true,
                        failureMessage: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
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
    const repriced = await repriceOrder(payload);

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

    const orderNumber = await generateOrderNumber();

    // Determine payment status based on whether proof is uploaded
    const hasPaymentProof = !!payload.paymentProof;
    const paymentStatus = hasPaymentProof ? "uploaded" : "pending";

    const order = await prisma.order.create({
        data: {
            orderNumber,
            customerName: payload.customerName,
            phone: payload.phone,
            email: payload.email ?? null,
            items: repriced.items,
            amounts: repriced.amounts,
            fulfillmentType: payload.fulfillment.type === "pickup" ? "PICKUP" : "DELIVERY",
            fulfillmentAddress:
                payload.fulfillment.type === "delivery" ? (payload.fulfillment.address ?? undefined) : undefined,
            status: "PENDING",
            note: payload.note ?? null,
            paymentMethod: payload.paymentMethod ?? null,
            paymentProof: payload.paymentProof ?? null,
            paymentStatus,
        },
    });

    await saveReceiptHtml({
        id: order.id,
        customerName: order.customerName,
        phone: order.phone,
        email: order.email,
        items: Array.isArray(order.items) ? (order.items as any[]) : [],
        amounts: order.amounts as any,
        createdAt: order.createdAt,
    }).catch((error) => {
        console.error("Failed to save receipt:", error);
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
