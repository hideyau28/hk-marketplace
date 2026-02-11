export const runtime = "nodejs";

import { ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/analytics
export const GET = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Page Views
  const [viewsToday, viewsWeek, viewsMonth] = await Promise.all([
    prisma.pageView.count({ where: { tenantId, createdAt: { gte: today } } }),
    prisma.pageView.count({ where: { tenantId, createdAt: { gte: thisWeek } } }),
    prisma.pageView.count({ where: { tenantId, createdAt: { gte: thisMonth } } }),
  ]);

  // Orders
  const [ordersToday, ordersWeek, ordersMonth] = await Promise.all([
    prisma.order.count({ where: { tenantId, createdAt: { gte: today } } }),
    prisma.order.count({ where: { tenantId, createdAt: { gte: thisWeek } } }),
    prisma.order.count({ where: { tenantId, createdAt: { gte: thisMonth } } }),
  ]);

  // Revenue (exclude cancelled/refunded orders)
  // Since amounts is a JSON field, we need to fetch and sum manually
  const [ordersWeekRevenue, ordersMonthRevenue] = await Promise.all([
    prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { gte: thisWeek },
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      select: { amounts: true },
    }),
    prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { gte: thisMonth },
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      select: { amounts: true },
    }),
  ]);

  const revenueWeek = ordersWeekRevenue.reduce((sum: number, order: any) => {
    const total = order.amounts?.total || 0;
    return sum + total;
  }, 0);

  const revenueMonth = ordersMonthRevenue.reduce((sum: number, order: any) => {
    const total = order.amounts?.total || 0;
    return sum + total;
  }, 0);

  // Daily views (last 7 days for chart)
  const dailyViews = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT DATE("createdAt") as date, COUNT(*) as count
    FROM "PageView"
    WHERE "tenantId" = ${tenantId}
    AND "createdAt" >= ${thisWeek}
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  // Convert BigInt to number for JSON serialization
  const dailyViewsFormatted = dailyViews.map((d: { date: Date; count: bigint }) => ({
    date: d.date.toISOString().split('T')[0],
    count: Number(d.count),
  }));

  return ok(req, {
    views: {
      today: viewsToday,
      week: viewsWeek,
      month: viewsMonth,
    },
    orders: {
      today: ordersToday,
      week: ordersWeek,
      month: ordersMonth,
    },
    revenue: {
      week: revenueWeek,
      month: revenueMonth,
    },
    dailyViews: dailyViewsFormatted,
  });
});
