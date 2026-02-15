export const runtime = "nodejs";

import { ok, withApi, ApiError } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { hasFeature } from "@/lib/plan";

// GET /api/admin/customers/[phone] — customer detail + order list
export const GET = withApi(
  async (req: Request, { params }: { params: Promise<{ phone: string }> }) => {
    const tenantId = await getTenantId(req);
    const { phone } = await params;
    const decodedPhone = decodeURIComponent(phone);

    const allowed = await hasFeature(tenantId, "crm");
    if (!allowed) {
      throw new ApiError(403, "FORBIDDEN", "CRM feature requires Pro plan");
    }

    const orders = await prisma.order.findMany({
      where: { tenantId, phone: decodedPhone },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        phone: true,
        email: true,
        items: true,
        amounts: true,
        status: true,
        fulfillmentType: true,
        createdAt: true,
        paymentStatus: true,
      },
    });

    if (orders.length === 0) {
      throw new ApiError(404, "NOT_FOUND", "Customer not found");
    }

    const latestOrder = orders[0];
    const totalSpent = orders.reduce(
      (sum, o) => sum + (Number((o.amounts as Record<string, unknown>)?.total) || 0),
      0
    );

    return ok(req, {
      customer: {
        phone: decodedPhone,
        customerName: latestOrder.customerName,
        email: latestOrder.email,
        orderCount: orders.length,
        totalSpent,
        lastOrderDate: latestOrder.createdAt,
      },
      orders,
    });
  },
  { admin: true }
);
