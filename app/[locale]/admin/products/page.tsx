import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { mockProducts } from "@/lib/mock";

function badgeClass(status: string) {
  if (status === "active") return "bg-emerald-500/15 text-emerald-200 border-emerald-500/20";
  if (status === "draft") return "bg-white/10 text-white/70 border-white/10";
  if (status === "pending") return "bg-amber-500/15 text-amber-200 border-amber-500/20";
  return "bg-rose-500/15 text-rose-200 border-rose-500/20";
}

export default async function AdminProducts({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = getDict(l);

  // mock status（之後接 DB 再換）
  const rows = mockProducts.map((p, i) => ({
    ...p,
    sku: `SKU-${String(i + 1).padStart(4, "0")}`,
    stock: 10 + (i % 7) * 3,
    status: i % 5 === 0 ? "draft" : i % 7 === 0 ? "pending" : "active"
  }));

  return (
    <div className="px-4 pb-16 pt-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-white/60 text-sm">Admin</div>
          <h1 className="mt-1 text-2xl font-semibold text-white">Products</h1>
          <div className="mt-2 text-white/60 text-sm">Shopify-style table, dark theme.</div>
        </div>

        <button className="rounded-2xl bg-white px-4 py-3 text-black font-semibold hover:bg-white/90">
          + Add product
        </button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-12">
        <div className="md:col-span-7">
          <input
            placeholder="Search title / SKU"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        <div className="md:col-span-2">
          <select className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20">
            <option value="">Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <select className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20">
            <option value="">Stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </div>

        <div className="md:col-span-1">
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
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="text-white/60">
                <th className="px-4 py-3 text-left w-10"></th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="h-4 w-4 accent-white" />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                        <img src={r.image} alt={r.title} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{r.title}</div>
                        <div className="text-white/50 text-xs">{r.shopName}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-white/80">{r.sku}</td>
                  <td className="px-4 py-3 text-right text-white font-medium">HK$ {r.price}</td>
                  <td className="px-4 py-3 text-right text-white/80">{r.stock}</td>

                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${badgeClass(r.status)}`}>
                      {r.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-white/60 text-sm">
          <div>Showing {rows.length} items</div>
          <div className="flex gap-2">
            <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10">Prev</button>
            <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10">Next</button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-white/50 text-xs">
        Note: Filters/search are UI-only for MVP. Next step will wire to real data and RBAC.
      </div>
    </div>
  );
}
