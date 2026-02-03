export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";
import { isValidTransition, getTransitionError } from "@/lib/orders/status-transitions";

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

// Map status to its corresponding timestamp field
const STATUS_TIMESTAMP_MAP: Record<string, string> = {
    FULFILLING: "fulfillingAt",
    SHIPPED: "shippedAt",
    COMPLETED: "completedAt",
    CANCELLED: "cancelledAt",
    REFUNDED: "refundedAt",
    DISPUTED: "disputedAt",
};

const PAYMENT_STATUSES = ["pending", "uploaded", "confirmed", "rejected"] as const;

function normalizePaymentStatus(value?: string | null) {
    if (!value) return null;
    const status = value.trim().toLowerCase();
    if (!PAYMENT_STATUSES.includes(status as (typeof PAYMENT_STATUSES)[number])) {
        throw new ApiError(400, "BAD_REQUEST", `Invalid payment status: ${value}`);
    }
    return status as (typeof PAYMENT_STATUSES)[number];
}

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
        const paymentStatus = normalizePaymentStatus(body?.paymentStatus);
        const note = typeof body?.note === "string" ? body.note.trim() : null;

        // At least one field must be provided
        if (!status && !paymentStatus) {
            throw new ApiError(400, "BAD_REQUEST", "status or paymentStatus is required");
        }

        // Fetch current order to validate transition
        const currentOrder = await prisma.order.findUnique({
            where: { id },
            select: { status: true, paymentStatus: true },
        });

        if (!currentOrder) {
            throw new ApiError(404, "NOT_FOUND", "Order not found");
        }

        // Build update data
        const updateData: Record<string, any> = {};

        // Handle order status update
        if (status) {
            // Validate status transition
            if (!isValidTransition(currentOrder.status, status)) {
                throw new ApiError(400, "BAD_REQUEST", getTransitionError(currentOrder.status, status));
            }
            updateData.status = status;

            // Auto-set timestamp if this status has one and it's not already set
            const timestampField = STATUS_TIMESTAMP_MAP[status];
            if (timestampField) {
                const existing = await prisma.order.findUnique({
                    where: { id },
                    select: { [timestampField]: true },
                });
                if (existing && existing[timestampField] === null) {
                    updateData[timestampField] = new Date();
                }
            }

            // Set paidAt when transitioning to PAID
            if (status === "PAID") {
                updateData.paidAt = new Date();
            }
        }

        // Handle payment status update
        if (paymentStatus) {
            updateData.paymentStatus = paymentStatus;
        }

        // Handle note update (for rejection reason, etc.)
        if (note !== null) {
            updateData.note = note;
        }

        const order = await prisma.order.update({
            where: { id },
            data: updateData,
        }).catch(() => null);

        if (!order) {
            throw new ApiError(404, "NOT_FOUND", "Order not found");
        }

        return ok(req, order);
    },
    { admin: true }
);
