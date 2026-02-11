"use client";

import { useEffect, useState } from "react";
import StatCard from "./StatCard";
import MiniBarChart from "./MiniBarChart";

type AnalyticsData = {
  views: { today: number; week: number; month: number };
  orders: { today: number; week: number; month: number };
  revenue: { week: number; month: number };
  dailyViews: Array<{ date: string; count: number }>;
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch analytics");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-zinc-500">
        載入中...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-red-500">
        載入失敗: {error || "未知錯誤"}
      </div>
    );
  }

  const conversionRate =
    data.views.week > 0
      ? ((data.orders.week / data.views.week) * 100).toFixed(1) + "%"
      : "0%";

  return (
    <div className="p-6 pb-24 bg-zinc-50 min-h-screen">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">📊 數據統計</h1>

      {/* 今日 */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-zinc-600 mb-3">── 今日 ──</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="👁️" label="瀏覽" value={data.views.today} />
          <StatCard icon="🛒" label="訂單" value={data.orders.today} />
        </div>
      </section>

      {/* 本週 */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-zinc-600 mb-3">── 本週 ──</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <StatCard icon="👁️" label="瀏覽" value={data.views.week} />
          <StatCard icon="🛒" label="訂單" value={data.orders.week} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="💰"
            label="收入"
            value={`$${data.revenue.week.toLocaleString()}`}
          />
          <StatCard icon="📈" label="轉化率" value={conversionRate} />
        </div>
      </section>

      {/* 每日瀏覽量（7日）*/}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-zinc-600 mb-3">
          ── 每日瀏覽量（7日）──
        </h2>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-zinc-100">
          <MiniBarChart data={data.dailyViews} />
        </div>
      </section>

      {/* 本月 */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-600 mb-3">── 本月 ──</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <StatCard icon="👁️" label="瀏覽" value={data.views.month} />
          <StatCard icon="🛒" label="訂單" value={data.orders.month} />
        </div>
        <div className="grid grid-cols-1 gap-3">
          <StatCard
            icon="💰"
            label="收入"
            value={`$${data.revenue.month.toLocaleString()}`}
          />
        </div>
      </section>
    </div>
  );
}
