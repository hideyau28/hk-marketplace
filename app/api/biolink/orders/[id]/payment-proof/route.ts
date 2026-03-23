export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";

// POST /api/biolink/orders/[id]/payment-proof
// Attach payment proof to an existing PENDING order
export const POST = withApi(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id: orderId } = await params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    if (
      !body ||
      typeof body !== "object" ||
      typeof (body as Record<string, unknown>).paymentProof !== "string" ||
      !(body as Record<string, unknown>).paymentProof
    ) {
      throw new ApiError(400, "BAD_REQUEST", "Missing paymentProof URL");
    }

    const paymentProof = (
      (body as Record<string, unknown>).paymentProof as string
    ).trim();

    // Validate order exists + is PENDING (awaiting payment)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true },
    });

    if (!order) {
      throw new ApiError(404, "NOT_FOUND", "Order not found");
    }

    if (order.status !== "PENDING") {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        "Payment proof can only be submitted for pending orders",
      );
    }

    // Update order with proof + advance status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentProof,
        paymentStatus: "uploaded",
        status: "PENDING_CONFIRMATION",
      },
    });

    return ok(req, {
      orderId,
      status: "pending_confirmation",
      paymentProof: true,
    });
  },
);
