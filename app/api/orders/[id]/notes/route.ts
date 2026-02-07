export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

type RouteContext = { params: Promise<{ id: string }> };

interface AdminNote {
    timestamp: string;
    note: string;
    author: string;
}

// POST /api/orders/:id/notes - add admin note
export const POST = withApi(
    async (req: Request, ctx: RouteContext) => {
        const { id } = await ctx.params;
        const tenantId = await getTenantId(req);

        let body: any = null;
        try {
            body = await req.json();
        } catch {
            throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
        }

        const note = typeof body?.note === "string" ? body.note.trim() : null;
        const author = typeof body?.author === "string" ? body.author.trim() : "Admin";

        if (!note) {
            throw new ApiError(400, "BAD_REQUEST", "note is required");
        }

        // Fetch current order
        const currentOrder = await prisma.order.findFirst({
            where: { id, tenantId },
            select: { adminNotes: true },
        });

        if (!currentOrder) {
            throw new ApiError(404, "NOT_FOUND", "Order not found");
        }

        // Parse existing notes and add new one
        const notes: AdminNote[] = currentOrder.adminNotes
            ? JSON.parse(currentOrder.adminNotes)
            : [];

        notes.push({
            timestamp: new Date().toISOString(),
            note,
            author,
        });

        const order = await prisma.order.update({
            where: { id },
            data: {
                adminNotes: JSON.stringify(notes),
            },
        });

        return ok(req, { order, notes });
    },
    { admin: true }
);

// GET /api/orders/:id/notes - get admin notes
export const GET = withApi(
    async (req: Request, ctx: RouteContext) => {
        const { id } = await ctx.params;
        const tenantId = await getTenantId(req);

        const order = await prisma.order.findFirst({
            where: { id, tenantId },
            select: { adminNotes: true },
        });

        if (!order) {
            throw new ApiError(404, "NOT_FOUND", "Order not found");
        }

        const notes: AdminNote[] = order.adminNotes
            ? JSON.parse(order.adminNotes)
            : [];

        return ok(req, { notes });
    },
    { admin: true }
);
