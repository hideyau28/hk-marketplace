import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";

type OrderStatus =
  | "pending_payment"
  | "paid"
  | "fulfilling"
  | "shipped"
  | "completed"
  | "cancelled"
  | "refunded"
  | "disputed";

function badgeClass(status: OrderStatus) {
  if (status === "paid" || status === "completed") return "bg-emerald-500/15 text-emerald-200 border-emerald-500/20";
  if (status === "pending_payment") return "bg-white/10 text-white/70 border-white/10";
  if (status === "fulfilling" || status === "shipped") return "bg-sky-500/15 text-sky-200 border-sky-500/20";
  if (status === "refunded") return "bg-amber-500/15 text-amber-200 border-amber-500/20";
  return "bg-rose-500/15 text-rose-200 border-rose-500/20";
}

function makeMockOrders() {
  const statuses: OrderStatus[] = [
    "pending_payment","paid","fulfilling","shipped","completed","cancelled","refunded","disputed"
  ];
  return Array.from({ length: 18 }).map((_, i) => {
    const status = statuses[i % statuses.length];
    const orderNo = `HK${new Date().getFullYear()}-${String(10001 + i)}`;
    const total = 198 + (i % 9) * 57;
    const items = 1 + (i % 4);
    const createdAt = new Date(Date.now() - i * 6 * 60 * 60 * 1000);
    const customer = i % 3 === 0 ? "Guest" : `Customer ${i}`;
    const shopName = "Demo Shop";
    return { id: String(i + 1), orderNo, status, total, items, createdAt, customer, shopName };
  });
}

export default async function AdminOrders({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = getDict(l);
  const rows = makeMockOrders();

  return (
    <div className="px-4 pb-16 pt-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-white/60 text-sm">Admin</div>
          <h1 className="mt-1 text-2xl font-semibold text-white">Orders</h1>
          <div className="mt-2 text-white/60 text-sm">Track payment, fulfillment, refunds.</div>
        </div>

        <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white hover:bg-white/10">
          Export CSV
        </button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-12">
        <div className="md:col-span-7">
          <input
            placeholder="Search order no / customer"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        <div className="md:col-span-3">
          <select className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20">
            <option value="">Status</option>
            <option value="pending_payment">pending_payment</option>
            <option value="paid">paid</option>
            <option value="fulfilling">fulfilling</option>
            <option value="shipped">shipped</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
            <option value="refunded">refunded</option>
            <option value="disputed">disputed</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <button className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80 hover:bg-white/10">
            Filter
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <input type="checkbox" className="h-4 w-4 accent-white" />
          <div className="text-white/60 text-sm">Bulk actions (MVP placeholder)</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead>
              <tr className="text-white/60">
                <th className="px-4 py-3 text-left w-10"></th>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Shop</th>
                <th className="px-4 py-3 text-right">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-4 py-3"><input type="checkbox" className="h-4 w-4 accent-white" /></td>
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{r.orderNo}</div>
                    <div className="text-white/50 text-xs">HKD • Stripe</div>
                  </td>
                  <td className="px-4 py-3 text-white/80">{r.customer}</td>
                  <td className="px-4 py-3 text-white/80">{r.shopName}</td>
                  <td className="px-4 py-3 text-right text-white/80">{r.items}</td>
                  <td className="px-4 py-3 text-right text-white font-medium">HK$ {r.total}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${badgeClass(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/70">{r.createdAt.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-white/60 text-sm">
          <div>Showing {rows.length} orders</div>
          <div className="flex gap-2">
            <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10">Prev</button>
            <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
