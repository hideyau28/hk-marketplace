export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";

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

function normalizeStatus(value?: string | null) {
    if (!value) return null;
    const status = value.trim().toUpperCase();
    if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
        throw new ApiError(400, "BAD_REQUEST", `Invalid status: ${value}`);
    }
    return status as (typeof ORDER_STATUSES)[number];
}

// GET /api/orders/:id (admin)
export const GET = withApi(
    async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
        const { id } = await params;
        const order = await prisma.order.findUnique({
            where: { id },
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
        if (!order) {
            throw new ApiError(404, "NOT_FOUND", "Order not found");
        }
        return ok(_req, order);
    },
    { admin: true }
);

// PATCH /api/orders/:id (admin update)
export const PATCH = withApi(
    async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
        const { id } = await params;

        let body: any = null;
        try {
            body = await req.json();
        } catch {
            throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
        }

        const status = normalizeStatus(body?.status);
        if (!status) {
            throw new ApiError(400, "BAD_REQUEST", "status is required");
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status },
        }).catch(() => null);

        if (!order) {
            throw new ApiError(404, "NOT_FOUND", "Order not found");
        }

        return ok(req, order);
    },
    { admin: true }
);