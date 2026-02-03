export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";
import { isValidTransition, getTransitionError } from "@/lib/orders/status-transitions";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/orders/:id/payment - confirm or reject payment
export const PATCH = withApi(
    async (req: Request, ctx: RouteContext) => {
        const { id } = await ctx.params;

        let body: any = null;
        try {
            body = await req.json();
        } catch {
            throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
        }

        const action = body?.action;
        const rejectionNote = typeof body?.note === "string" ? body.note.trim() : null;

        if (action !== "confirm" && action !== "reject") {
            throw new ApiError(400, "BAD_REQUEST", "action must be 'confirm' or 'reject'");
        }

        // Fetch current order
        const currentOrder = await prisma.order.findUnique({
            where: { id },
            select: {
                status: true,
                paymentStatus: true,
                statusHistory: true,
            },
        });

        if (!currentOrder) {
            throw new ApiError(404, "NOT_FOUND", "Order not found");
        }

        // Payment can only be confirmed/rejected if paymentStatus is "uploaded"
        if (currentOrder.paymentStatus !== "uploaded") {
            throw new ApiError(
                400,
                "BAD_REQUEST",
                `Cannot ${action} payment when payment status is '${currentOrder.paymentStatus}'`
            );
        }

        const updateData: Record<string, any> = {};

        if (action === "confirm") {
            // Confirm payment: update paymentStatus and transition order to CONFIRMED
            updateData.paymentStatus = "confirmed";
            updateData.paidAt = new Date();

            // Transition order status from PENDING to CONFIRMED if valid
            if (currentOrder.status === "PENDING") {
                if (!isValidTransition("PENDING", "CONFIRMED")) {
                    throw new ApiError(400, "BAD_REQUEST", getTransitionError("PENDING", "CONFIRMED"));
                }
                updateData.status = "CONFIRMED";
                updateData.confirmedAt = new Date();

                // Record status history
                const history = currentOrder.statusHistory
                    ? JSON.parse(currentOrder.statusHistory)
                    : [];
                history.push({
                    timestamp: new Date().toISOString(),
                    fromStatus: currentOrder.status,
                    toStatus: "CONFIRMED",
                });
                updateData.statusHistory = JSON.stringify(history);
            }
        } else {
            // Reject payment: update paymentStatus and optionally add note
            updateData.paymentStatus = "rejected";
            if (rejectionNote) {
                updateData.note = rejectionNote;
            }
        }

        const order = await prisma.order.update({
            where: { id },
            data: updateData,
        });

        return ok(req, order);
    },
    { admin: true }
);
