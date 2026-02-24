"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

type Summary = {
  today: { orderCount: number; revenue: number };
  week: { orderCount: number; revenue: number };
  month: { orderCount: number; revenue: number };
};

type DailyPoint = { date: string; orders: number; revenue: number };

type TopProduct = {
  name: string;
  quantity: number;
  revenue: number;
  imageUrl?: string | null;
};

type TopProductRange = "7d" | "30d" | "all";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-zinc-500">{label}</div>
          <div className="text-2xl font-bold text-zinc-900 mt-2 truncate">
            {value}
          </div>
        </div>
        <div className="text-zinc-400">{icon}</div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 animate-pulse">
      <div className="h-4 w-20 bg-zinc-200 rounded mb-3" />
      <div className="h-7 w-16 bg-zinc-200 rounded" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 animate-pulse">
      <div className="h-4 w-40 bg-zinc-200 rounded mb-4" />
      <div className="h-64 bg-zinc-100 rounded-xl" />
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topRange, setTopRange] = useState<TopProductRange>("30d");
  const [loading, setLoading] = useState(true);
  const [topLoading, setTopLoading] = useState(false);

  // Fetch summary + daily on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/analytics/summary").then((r) => r.json()),
      fetch("/api/admin/analytics/daily").then((r) => r.json()),
      fetch(`/api/admin/analytics/top-products?range=30d`).then((r) =>
        r.json(),
      ),
    ])
      .then(([summaryRes, dailyRes, topRes]) => {
        if (summaryRes.ok) setSummary(summaryRes.data);
        if (dailyRes.ok) setDaily(dailyRes.data || []);
        if (topRes.ok) setTopProducts(topRes.data?.topProducts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Refetch top products when range changes
  useEffect(() => {
    setTopLoading(true);
    fetch(`/api/admin/analytics/top-products?range=${topRange}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setTopProducts(res.data?.topProducts || []);
      })
      .catch(() => {})
      .finally(() => setTopLoading(false));
  }, [topRange]);

  // Format daily data for charts
  const chartData = daily.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-HK", {
      month: "short",
      day: "numeric",
    }),
    orders: d.orders,
    revenue: d.revenue,
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SkeletonChart />
          </div>
          <SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="今日訂單"
            value={summary.today.orderCount}
            icon={<ShoppingCart size={24} />}
          />
          <StatCard
            label="今日收入"
            value={`$${Math.round(summary.today.revenue)}`}
            icon={<DollarSign size={24} />}
          />
          <StatCard
            label="本月訂單"
            value={summary.month.orderCount}
            icon={<TrendingUp size={24} />}
          />
          <StatCard
            label="本月收入"
            value={`$${Math.round(summary.month.revenue)}`}
            icon={<DollarSign size={24} />}
          />
        </div>
      )}

      {/* Week stats */}
      {summary && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6">
            <div className="text-sm text-zinc-500">本週訂單</div>
            <div className="text-2xl font-bold text-zinc-900 mt-2">
              {summary.week.orderCount}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-6">
            <div className="text-sm text-zinc-500">本週收入</div>
            <div className="text-2xl font-bold text-zinc-900 mt-2">
              ${Math.round(summary.week.revenue)}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Orders trend */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2">
          <div className="mb-4 text-sm font-semibold text-zinc-900">
            訂單趨勢（過去 30 日）
          </div>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#4b5e3c"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                未有數據
              </div>
            )}
          </div>
        </div>

        {/* Revenue trend */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="mb-4 text-sm font-semibold text-zinc-900">
            收入趨勢（30 日）
          </div>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4b5e3c"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                未有數據
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-zinc-900">熱門商品</div>
          <div className="flex gap-1">
            {(["7d", "30d", "all"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTopRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  topRange === r
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {r === "7d" ? "7 日" : r === "30d" ? "30 日" : "全部"}
              </button>
            ))}
          </div>
        </div>

        {topLoading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-4 bg-zinc-200 rounded" />
                <div className="h-4 flex-1 bg-zinc-200 rounded" />
                <div className="h-4 w-12 bg-zinc-200 rounded" />
              </div>
            ))}
          </div>
        ) : topProducts.length === 0 ? (
          <div className="py-8 text-center text-zinc-400 text-sm">
            未有銷售記錄
          </div>
        ) : (
          <div className="space-y-1">
            {topProducts.map((p, idx) => (
              <div
                key={p.name}
                className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-zinc-50"
              >
                <span className="text-xs text-zinc-400 w-5 text-right font-mono">
                  {idx + 1}
                </span>
                <span className="flex-1 text-sm text-zinc-700 truncate">
                  {p.name}
                </span>
                <span className="text-sm font-semibold text-zinc-900 tabular-nums">
                  {p.quantity} 件
                </span>
                <span className="text-xs text-zinc-500 tabular-nums w-20 text-right">
                  ${Math.round(p.revenue)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Bar chart for top products */}
        {topProducts.length > 0 && (
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts.slice(0, 5).map((p) => ({
                  name:
                    p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
                  quantity: p.quantity,
                }))}
              >
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#4b5e3c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
