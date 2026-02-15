import { prisma } from "@/lib/prisma";
import { getAdminTenantId } from "@/lib/tenant";
import { hasFeature } from "@/lib/plan";
import { getDict, type Locale } from "@/lib/i18n";
import SidebarToggle from "@/components/admin/SidebarToggle";
import CartRecoveryClient from "./cart-recovery-client";
import Link from "next/link";

export default async function CartRecoveryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = getDict(l);
  const tenantId = await getAdminTenantId();

  // Plan gating
  const enabled = await hasFeature(tenantId, "cart_recovery");

  if (!enabled) {
    return (
      <div className="p-4 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <SidebarToggle />
          <div>
            <div className="text-zinc-500 text-sm">Admin</div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              {l === "zh-HK" ? "棄單挽回" : "Cart Recovery"}
            </h1>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <div className="text-lg font-semibold text-amber-800 mb-2">
            {l === "zh-HK" ? "此功能需要 Pro 計劃" : "This feature requires Pro plan"}
          </div>
          <div className="text-sm text-amber-700">
            {l === "zh-HK"
              ? "升級到 Pro 計劃以追蹤棄單、查看潛在收入並透過 WhatsApp 跟進客人。"
              : "Upgrade to Pro plan to track abandoned carts, view potential revenue, and follow up with customers via WhatsApp."}
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Fetch data server-side
  const [abandonedOrders, drafts, totalOrdersLast30, abandonedOrdersLast30] =
    await Promise.all([
      prisma.order.findMany({
        where: { tenantId, status: "ABANDONED" },
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
      }),
      prisma.checkoutDraft.findMany({
        where: {
          tenantId,
          convertedAt: null,
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
      }),
      prisma.order.count({
        where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.order.count({
        where: {
          tenantId,
          status: "ABANDONED",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

  // 棄單金額
  const abandonedRevenue = abandonedOrders.reduce((sum, order) => {
    const amounts = order.amounts as any;
    return sum + (amounts?.total || 0);
  }, 0);

  const abandonmentRate =
    totalOrdersLast30 > 0
      ? Number(((abandonedOrdersLast30 / totalOrdersLast30) * 100).toFixed(1))
      : 0;

  // Get tenant whatsapp for the follow-up button
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { whatsapp: true },
  });

  return (
    <div className="p-4 pb-16">
      <div className="flex items-center gap-4 mb-6">
        <SidebarToggle />
        <div>
          <div className="text-zinc-500 text-sm">Admin</div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            {l === "zh-HK" ? "棄單挽回" : "Cart Recovery"}
          </h1>
          <div className="text-zinc-500 text-sm">
            {l === "zh-HK"
              ? "追蹤未完成訂單並跟進客人"
              : "Track abandoned orders and follow up with customers"}
          </div>
        </div>
      </div>

      <CartRecoveryClient
        locale={l}
        abandonedOrders={abandonedOrders.map((o) => ({
          ...o,
          createdAt: o.createdAt.toISOString(),
          abandonedAt: o.abandonedAt?.toISOString() || null,
        }))}
        drafts={drafts.map((d) => ({
          ...d,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        }))}
        stats={{
          totalOrdersLast30,
          abandonedOrdersLast30,
          abandonmentRate,
          abandonedRevenue,
        }}
        merchantWhatsApp={tenant?.whatsapp || null}
      />
    </div>
  );
}
