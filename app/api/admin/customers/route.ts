export const runtime = "nodejs";

import { ok, withApi, ApiError } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { hasFeature } from "@/lib/plan";

type CustomerSummary = {
  phone: string;
  customerName: string;
  email: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: Date;
};

// GET /api/admin/customers — aggregate customer data from Orders
export const GET = withApi(async (req) => {
  const tenantId = await getTenantId(req);

  const allowed = await hasFeature(tenantId, "crm");
  if (!allowed) {
    throw new ApiError(403, "FORBIDDEN", "CRM feature requires Pro plan");
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.trim() || null;
  const sort = searchParams.get("sort") || "lastOrder";

  // Fetch orders for aggregation (select minimal fields)
  const orders = await prisma.order.findMany({
    where: { tenantId },
    select: {
      phone: true,
      customerName: true,
      email: true,
      amounts: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Aggregate by phone — first occurrence is the latest (ordered desc)
  const customerMap = new Map<string, CustomerSummary>();

  for (const order of orders) {
    const total = Number((order.amounts as Record<string, unknown>)?.total) || 0;
    const existing = customerMap.get(order.phone);

    if (!existing) {
      customerMap.set(order.phone, {
        phone: order.phone,
        customerName: order.customerName,
        email: order.email,
        orderCount: 1,
        totalSpent: total,
        lastOrderDate: order.createdAt,
      });
    } else {
      existing.orderCount++;
      existing.totalSpent += total;
    }
  }

  let customers = Array.from(customerMap.values());

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    customers = customers.filter(
      (c) =>
        c.customerName.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }

  // Sort
  if (sort === "totalSpent") {
    customers.sort((a, b) => b.totalSpent - a.totalSpent);
  } else {
    customers.sort((a, b) => b.lastOrderDate.getTime() - a.lastOrderDate.getTime());
  }

  return ok(req, { customers });
}, { admin: true });
