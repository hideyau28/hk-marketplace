export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { hasFeature } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ phone: string }> };

// GET /api/admin/customers/:phone/notes
export const GET = withApi(
  async (req: Request, ctx: RouteContext) => {
    const { phone } = await ctx.params;
    const decodedPhone = decodeURIComponent(phone);
    const { tenantId } = await authenticateAdmin(req);

    const allowed = await hasFeature(tenantId, "crm");
    if (!allowed) {
      throw new ApiError(403, "FORBIDDEN", "CRM feature requires Pro plan");
    }

    const notes = await prisma.customerNote.findMany({
      where: { tenantId, phone: decodedPhone },
      orderBy: { createdAt: "desc" },
    });

    return ok(req, { notes });
  },
  { admin: true },
);

// POST /api/admin/customers/:phone/notes
export const POST = withApi(
  async (req: Request, ctx: RouteContext) => {
    const { phone } = await ctx.params;
    const decodedPhone = decodeURIComponent(phone);
    const { tenantId } = await authenticateAdmin(req);

    const allowed = await hasFeature(tenantId, "crm");
    if (!allowed) {
      throw new ApiError(403, "FORBIDDEN", "CRM feature requires Pro plan");
    }

    let body: unknown = null;
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    const note =
      typeof (body as Record<string, unknown>)?.note === "string"
        ? ((body as Record<string, unknown>).note as string).trim()
        : null;

    if (!note) {
      throw new ApiError(400, "BAD_REQUEST", "note is required");
    }

    const created = await prisma.customerNote.create({
      data: {
        tenantId,
        phone: decodedPhone,
        note,
      },
    });

    return ok(req, { note: created });
  },
  { admin: true },
);
