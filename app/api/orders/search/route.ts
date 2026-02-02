export const runtime = "nodejs";

import { ok, withApi, ApiError } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";

// GET /api/orders/search?phone=12345678
export const GET = withApi(async (req) => {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone")?.trim();

    if (!phone) {
        throw new ApiError(400, "BAD_REQUEST", "Phone number is required");
    }

    // Validate phone format (8 digits)
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length !== 8) {
        throw new ApiError(400, "BAD_REQUEST", "Invalid phone number format");
    }

    const orders = await prisma.order.findMany({
        where: { phone: digitsOnly },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            orderNumber: true,
            status: true,
            items: true,
            amounts: true,
            createdAt: true,
        },
        take: 20,
    });

    return ok(req, { orders });
});
