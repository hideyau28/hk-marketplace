import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { OrdersTable } from "./orders-table";
import type { OrderStatus } from "@prisma/client";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminOrders({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { status } = await searchParams;
  const l = locale as Locale;
  const t = getDict(l);

  // Fetch orders from database
  const whereClause = status ? { status: status.toUpperCase() as OrderStatus } : undefined;
  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="px-4 pb-16 pt-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-white/60 text-sm">Admin</div>
          <h1 className="mt-1 text-2xl font-semibold text-white">Orders</h1>
          <div className="mt-2 text-white/60 text-sm">Track payment, fulfillment, refunds.</div>
        </div>
      </div>

      <OrdersTable orders={orders} locale={l} currentStatus={status} />
    </div>
  );
}
