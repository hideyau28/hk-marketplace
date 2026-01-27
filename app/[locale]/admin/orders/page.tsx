import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { OrdersTable } from "./orders-table";
import { fetchOrders } from "./actions";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminOrders({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { status } = await searchParams;
  const l = locale as Locale;
  const t = getDict(l);

  // Fetch orders via API using server action
  const result = await fetchOrders(status);

  return (
    <div className="px-4 pb-16 pt-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-white/60 text-sm">Admin</div>
          <h1 className="mt-1 text-2xl font-semibold text-white">Orders</h1>
          <div className="mt-2 text-white/60 text-sm">Track payment, fulfillment, refunds.</div>
        </div>
      </div>

      {result.ok ? (
        <OrdersTable orders={result.data} locale={l} currentStatus={status} />
      ) : (
        <div className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
          <div className="text-red-400 font-semibold">Error loading orders</div>
          <div className="mt-2 text-red-300 text-sm">
            <div className="font-mono">{result.code}</div>
            <div className="mt-1">{result.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}
