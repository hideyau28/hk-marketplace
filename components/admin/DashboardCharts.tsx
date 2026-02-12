"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

type OrdersPoint = { date: string; orders: number };
type RevenuePoint = { date: string; revenue: number };
type TopProduct = { name: string; quantity: number };
type PageViewsPoint = { date: string; views: number };

type DashboardChartsProps = {
  ordersLast30: OrdersPoint[];
  revenueLast30: RevenuePoint[];
  topProducts: TopProduct[];
  pageViewsLast7: PageViewsPoint[];
};

export default function DashboardCharts({ ordersLast30, revenueLast30, topProducts, pageViewsLast7 }: DashboardChartsProps) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      {/* Page Views Chart - Last 7 Days */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2">
        <div className="mb-4 text-sm font-semibold text-zinc-900">瀏覽量 (過去 7 日)</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pageViewsLast7}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 5 Products */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="mb-4 text-sm font-semibold text-zinc-900">熱門商品 Top 5</div>
        <div className="space-y-3 text-sm">
          {topProducts.length === 0 ? (
            <div className="text-zinc-500">未有銷售記錄</div>
          ) : (
            topProducts.map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="text-zinc-700">
                  {idx + 1}. {p.name}
                </div>
                <div className="text-zinc-900 font-semibold">{p.quantity}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Orders Trend - Last 30 Days */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2">
        <div className="mb-4 text-sm font-semibold text-zinc-900">訂單趨勢 (過去 30 日)</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ordersLast30}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#4b5e3c" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Trend - Last 30 Days */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-1">
        <div className="mb-4 text-sm font-semibold text-zinc-900">收入趨勢 (30 日)</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueLast30}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#4b5e3c" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
