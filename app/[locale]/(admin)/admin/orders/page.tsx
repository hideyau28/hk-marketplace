import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { OrdersTable } from "./orders-table";
import { fetchOrders } from "./actions";
import SidebarToggle from "@/components/admin/SidebarToggle";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function AdminOrders({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { status, q } = await searchParams;
  const l = locale as Locale;
  const t = getDict(l);

  // Fetch orders via API using server action
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
