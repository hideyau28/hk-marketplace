export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, withApi, ApiError } from "@/lib/api/route-helpers";
import { getTenantId } from "@/lib/tenant";
import { hasFeature } from "@/lib/plan";

/**
 * GET /api/admin/cart-recovery
 * 棄單挽回 — 列出棄單訂單 + checkout drafts + 統計
 */
export const GET = withApi(
  async (req) => {
    const tenantId = await getTenantId(req);

    const enabled = await hasFeature(tenantId, "cart_recovery");
    if (!enabled) {
      throw new ApiError(403, "FORBIDDEN", "cart_recovery feature requires Pro plan");
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // 棄單訂單（ABANDONED status）
    const abandonedOrders = await prisma.order.findMany({
      where: {
        tenantId,
        status: "ABANDONED",
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        phone: true,
        email: true,
        items: true,
        amounts: true,
        createdAt: true,
        abandonedAt: true,
      },
    });

    // 未完成 checkout drafts（未轉化嘅）
    const drafts = await prisma.checkoutDraft.findMany({
      where: {
        tenantId,
        convertedAt: null,
        // 只顯示有基本資料嘅 draft
        phone: { not: null },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        customerName: true,
        phone: true,
        email: true,
        items: true,
        amounts: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 統計：最近 30 天
    const [totalOrdersLast30, abandonedOrdersLast30, allPaidOrders] = await Promise.all([
      prisma.order.count({
        where: {
          tenantId,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.order.count({
        where: {
          tenantId,
          status: "ABANDONED",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.order.findMany({
        where: {
          tenantId,
          status: "ABANDONED",
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { amounts: true },
      }),
    ]);

    // 棄單金額
    const abandonedRevenue = allPaidOrders.reduce((sum, order) => {
      const amounts = order.amounts as any;
      return sum + (amounts?.total || 0);
    }, 0);

    const abandonmentRate =
      totalOrdersLast30 > 0
        ? ((abandonedOrdersLast30 / totalOrdersLast30) * 100).toFixed(1)
        : "0";

    return ok(req, {
      abandonedOrders: abandonedOrders.map((o) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
        abandonedAt: o.abandonedAt?.toISOString() || null,
      })),
      drafts: drafts.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
      stats: {
        totalOrdersLast30,
        abandonedOrdersLast30,
        abandonmentRate: Number(abandonmentRate),
        abandonedRevenue,
      },
    });
  },
  { admin: true }
);
