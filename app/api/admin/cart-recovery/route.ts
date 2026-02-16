export const runtime = "nodejs";

import { ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/cart-recovery?range=today|7d|30d|all
export const GET = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "all";

  // 計算日期範圍篩選
  const now = new Date();
  let dateFilter: Date | undefined;
  if (range === "today") {
    dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === "7d") {
    dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === "30d") {
    dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  const where: Record<string, unknown> = {
    tenantId,
    status: "PENDING",
    paymentStatus: "pending",
  };

  if (dateFilter) {
    where.createdAt = { gte: dateFilter };
  }

  // 取得棄單列表
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      phone: true,
      items: true,
      amounts: true,
      createdAt: true,
      recoveryStatus: true,
    },
  });

  // 統計：總棄單數 + 總金額
  const totalAbandoned = orders.length;
  const totalAmount = orders.reduce((sum, o) => {
    const amounts = o.amounts as Record<string, unknown> | null;
    return sum + (Number(amounts?.total) || 0);
  }, 0);

  // 挽回率：contacted 之後變成其他完成狀態嘅比例
  // 簡化計算：recoveryStatus = "recovered" / (contacted + recovered)
  const contactedCount = orders.filter(
    (o) => o.recoveryStatus === "contacted"
  ).length;
  const recoveredCount = orders.filter(
    (o) => o.recoveryStatus === "recovered"
  ).length;
  const recoveryRate =
    contactedCount + recoveredCount > 0
      ? Math.round((recoveredCount / (contactedCount + recoveredCount)) * 100)
      : 0;

  return ok(req, {
    orders: orders.map((o) => ({
      ...o,
      createdAt: o.createdAt.toISOString(),
    })),
    stats: {
      totalAbandoned,
      totalAmount,
      recoveryRate,
    },
  });
});
