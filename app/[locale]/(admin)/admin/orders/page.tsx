import { prisma } from "@/lib/prisma";
import { getAdminTenantId } from "@/lib/tenant";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { OrdersTable } from "./orders-table";
import { fetchOrders } from "./actions";
import SidebarToggle from "@/components/admin/SidebarToggle";
import BioLinkOrders from "@/components/admin/BioLinkOrders";

async function getTenantMode(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { mode: true },
  });
  return tenant?.mode || "biolink";
}

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function AdminOrders({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { status, q } = await searchParams;
  const l = locale as Locale;
  const t = getDict(l);

  const tenantId = await getAdminTenantId();
  const mode = await getTenantMode(tenantId);

  // Bio Link mode: simplified orders view
  if (mode === "biolink") {
    const orders = await prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        phone: true,
        items: true,
        amounts: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    });

    return (
      <BioLinkOrders
        orders={orders.map((o) => ({
          ...o,
          createdAt: o.createdAt.toISOString(),
        }))}
        locale={l}
      />
    );
  }

  // Full Store mode: existing orders table
  const result = await fetchOrders(status, q);

  return (
    <div className="p-4 pb-16">
      <div className="flex items-center gap-4 mb-6">
        <SidebarToggle />
        <div>
          <div className="text-zinc-500 text-sm">Admin</div>
          <h1 className="text-2xl font-semibold text-zinc-900">{t.admin.orders.title}</h1>
          <div className="text-zinc-500 text-sm">{t.admin.orders.subtitle}</div>
        </div>
      </div>

      {result.ok ? (
        <OrdersTable orders={result.data} locale={l} currentStatus={status} searchQuery={q} />
      ) : (
        <div className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
          <div className="text-red-400 font-semibold">{t.common.error}</div>
          <div className="mt-2 text-red-300 text-sm">
            <div className="font-mono">{result.code}</div>
            <div className="mt-1">{result.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}
