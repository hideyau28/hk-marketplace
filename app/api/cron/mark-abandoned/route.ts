export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api/route-helpers";

const ABANDONED_THRESHOLD_MINUTES = 30;

/**
 * POST /api/cron/mark-abandoned
 * Cron endpoint: 將超過 30 分鐘未付款嘅 PENDING 訂單標記為 ABANDONED。
 * 需要 admin auth 或 cron secret。
 */
export const POST = withApi(
  async (req) => {
    const threshold = new Date();
    threshold.setMinutes(threshold.getMinutes() - ABANDONED_THRESHOLD_MINUTES);

    const result = await prisma.order.updateMany({
      where: {
        status: "PENDING",
        paymentStatus: "pending",
        createdAt: { lt: threshold },
      },
      data: {
        status: "ABANDONED",
        abandonedAt: new Date(),
      },
    });

    return ok(req, {
      marked: result.count,
      thresholdMinutes: ABANDONED_THRESHOLD_MINUTES,
    });
  },
  { admin: true }
);
