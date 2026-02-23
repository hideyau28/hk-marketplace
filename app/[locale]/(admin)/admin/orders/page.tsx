import { prisma } from "@/lib/prisma";
import { getAdminTenantId } from "@/lib/tenant";
import { hasFeature } from "@/lib/plan";
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

const BIOLINK_PAGE_SIZE = 20;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
};

export default async function AdminOrders({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { status, q, page: pageParam } = await searchParams;
  const l = locale as Locale;
  const t = getDict(l);
  const page = Math.max(1, parseInt(pageParam || "1", 10));

  const tenantId = await getAdminTenantId();
  const mode = await getTenantMode(tenantId);

  // Bio Link mode: simplified orders view with pagination
  if (mode === "biolink") {
    const skip = (page - 1) * BIOLINK_PAGE_SIZE;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        skip,
        take: BIOLINK_PAGE_SIZE,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          phone: true,
          items: true,
          amounts: true,
          status: true,
          paymentStatus: true,
          paymentMethod: true,
          createdAt: true,
          fulfillmentType: true,
          fulfillmentAddress: true,
          paymentProof: true,
        },
      }),
      prisma.order.count({ where: { tenantId } }),
    ]);

    const totalPages = Math.ceil(total / BIOLINK_PAGE_SIZE);

    return (
      <BioLinkOrders
        orders={orders.map((o) => ({
          ...o,
          createdAt: o.createdAt.toISOString(),
        }))}
        locale={l}
        page={page}
        totalPages={totalPages}
      />
    );
  }

  // Full Store mode: existing orders table with pagination
  const [result, csvExportEnabled] = await Promise.all([
    fetchOrders(status, q, page),
    hasFeature(tenantId, "csv_export"),
  ]);

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
        <OrdersTable
          orders={result.data}
          locale={l}
          currentStatus={status}
          searchQuery={q}
          csvExportEnabled={csvExportEnabled}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
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
