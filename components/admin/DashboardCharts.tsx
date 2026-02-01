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

type DashboardChartsProps = {
  ordersLast7: OrdersPoint[];
  revenueLast30: RevenuePoint[];
  topProducts: TopProduct[];
};

export default function DashboardCharts({ ordersLast7, revenueLast30, topProducts }: DashboardChartsProps) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2">
        <div className="mb-4 text-sm font-semibold text-zinc-900">Orders (Last 7 Days)</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersLast7}>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#4b5e3c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="mb-4 text-sm font-semibold text-zinc-900">Top 5 Products</div>
        <div className="space-y-3 text-sm">
          {topProducts.length === 0 ? (
            <div className="text-zinc-500">No sales yet</div>
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

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-3">
        <div className="mb-4 text-sm font-semibold text-zinc-900">Revenue Trend (Last 30 Days)</div>
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
