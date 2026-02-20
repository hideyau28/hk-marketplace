import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getAdminTenantId } from "@/lib/tenant";
import { ShoppingCart, DollarSign, ArrowRight, Package, TrendingUp, Lock } from "lucide-react";
import Link from "next/link";
import SidebarToggle from "@/components/admin/SidebarToggle";
import DashboardCharts from "@/components/admin/DashboardCharts";
import TopSellingProducts from "@/components/admin/TopSellingProducts";
import WelcomeToast from "@/components/admin/WelcomeToast";
import BioLinkDashboard from "@/components/admin/BioLinkDashboard";
import { getDict, type Locale } from "@/lib/i18n";
import { hasFeature } from "@/lib/plan";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
};

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-zinc-500">{label}</div>
          <div className="text-2xl font-bold text-zinc-900 mt-2 truncate">{value}</div>
        </div>
        <div className="text-zinc-400">{icon}</div>
      </div>
    </div>
  );
}

const PAID_STATUSES = new Set(["PAID", "FULFILLING", "SHIPPED", "COMPLETED"]);

async function getTenantMode(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { mode: true },
  });
  return tenant?.mode || "biolink";
}

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale as Locale);
  const tenantId = await getAdminTenantId();
  const mode = await getTenantMode(tenantId);

  // Bio Link mode: show storefront-style dashboard
  if (mode === "biolink") {
    const [tenant, products, pendingOrders] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true, slug: true, coverPhoto: true, coverTemplate: true, logoUrl: true, brandColor: true },
      }),
      prisma.product.findMany({
        where: { tenantId, active: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, title: true, price: true, originalPrice: true, imageUrl: true, images: true, videoUrl: true, sizes: true, sizeSystem: true, hidden: true, featured: true, sortOrder: true, createdAt: true },
      }),
      prisma.order.count({
        where: { tenantId, status: "PENDING" },
      }),
    ]);

    return (
      <>
        <Suspense fallback={null}>
          <WelcomeToast />
        </Suspense>
        <BioLinkDashboard
          locale={locale}
          tenant={tenant!}
          products={products.map((p) => ({
            ...p,
            sizes: (p.sizes as Record<string, unknown>) ?? null,
            createdAt: p.createdAt.toISOString(),
          }))}
          pendingOrders={pendingOrders}
        />
      </>
    );
  }

  // Full Store mode: analytics dashboard
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const start30 = new Date(now);
  start30.setDate(now.getDate() - 29);

  // Fetch earliest date needed (whichever is earlier: monthStart or start30)
  const fetchSince = monthStart < start30 ? monthStart : start30;

  const [analyticsEnabled, topSellersEnabled] = await Promise.all([
    hasFeature(tenantId, "analytics"),
    hasFeature(tenantId, "top_sellers"),
  ]);

  const [tenant, recentOrders, allRecentOrders] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, coverPhoto: true, logoUrl: true },
    }),
    prisma.order.findMany({
      where: { tenantId },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerName: true,
        status: true,
        amounts: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: { tenantId, createdAt: { gte: fetchSince } },
      orderBy: { createdAt: "asc" },
      select: {
        createdAt: true,
        status: true,
        amounts: true,
        items: true,
      },
    }),
  ]);

  // Compute today/week/month aggregates
  function aggregate(since: Date) {
    let orderCount = 0;
    let revenue = 0;
    for (const o of allRecentOrders) {
      if (o.createdAt < since) continue;
      orderCount++;
      if (PAID_STATUSES.has(o.status)) {
        const amounts = o.amounts as Record<string, unknown> | null;
        revenue += Number(amounts?.total) || 0;
      }
    }
    return { orderCount, revenue };
  }

  const todayStats = aggregate(todayStart);
  const weekStats = aggregate(weekStart);
  const monthStats = aggregate(monthStart);

  // Build chart data (only if analytics enabled)
  let ordersLast30: { date: string; orders: number }[] = [];
  let revenueLast30: { date: string; revenue: number }[] = [];
  let topProducts: { name: string; quantity: number }[] = [];
  let pageViewsLast7: { date: string; views: number }[] = [];

  if (analyticsEnabled) {
    const ordersLast30Map = new Map<string, number>();
    const revenueLast30Map = new Map<string, number>();
    const productCounts = new Map<string, number>();

    for (const order of allRecentOrders) {
      if (order.createdAt < start30) continue;
      const dateKey = order.createdAt.toISOString().slice(0, 10);
      ordersLast30Map.set(dateKey, (ordersLast30Map.get(dateKey) || 0) + 1);

      if (PAID_STATUSES.has(order.status)) {
        const amounts = order.amounts as Record<string, unknown> | null;
        const total = Number(amounts?.total) || 0;
        revenueLast30Map.set(dateKey, (revenueLast30Map.get(dateKey) || 0) + total);
        const items = Array.isArray(order.items) ? (order.items as Record<string, unknown>[]) : [];
        for (const item of items) {
          const name = String(item?.name || item?.title || "Item");
          const qty = Number(item?.quantity ?? item?.qty ?? 0);
          if (!Number.isFinite(qty) || qty <= 0) continue;
          productCounts.set(name, (productCounts.get(name) || 0) + qty);
        }
      }
    }

    ordersLast30 = Array.from({ length: 30 }).map((_, idx) => {
      const d = new Date(start30);
      d.setDate(start30.getDate() + idx);
      const key = d.toISOString().slice(0, 10);
      return {
        date: d.toLocaleDateString("en-HK", { month: "short", day: "numeric" }),
        orders: ordersLast30Map.get(key) || 0,
      };
    });

    revenueLast30 = Array.from({ length: 30 }).map((_, idx) => {
      const d = new Date(start30);
      d.setDate(start30.getDate() + idx);
      const key = d.toISOString().slice(0, 10);
      return {
        date: d.toLocaleDateString("en-HK", { month: "short", day: "numeric" }),
        revenue: revenueLast30Map.get(key) || 0,
      };
    });

    topProducts = Array.from(productCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    // Mock page views (API 未有)
    const start7 = new Date(now);
    start7.setDate(now.getDate() - 6);
    pageViewsLast7 = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(start7);
      d.setDate(start7.getDate() + idx);
      return {
        date: d.toLocaleDateString("en-HK", { month: "short", day: "numeric" }),
        views: Math.floor(Math.random() * 200) + 50,
      };
    });
  }

  return (
    <div className="p-4 pb-16 max-w-full overflow-hidden">
      <Suspense fallback={null}>
        <WelcomeToast />
      </Suspense>
      <div className="flex items-center gap-4 mb-6">
        <SidebarToggle />
        <div>
          <div className="text-zinc-500 text-sm">{t.admin.dashboard.adminLabel}</div>
          <h1 className="text-2xl font-semibold text-zinc-900">{t.admin.dashboard.title}</h1>
          <div className="text-zinc-500 text-sm">{t.admin.dashboard.subtitle}</div>
        </div>
      </div>

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-olive-50 to-olive-100/50 rounded-2xl border border-olive-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-4">
          👋 歡迎返嚟，{tenant?.name || "店主"}！
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white/80 rounded-xl p-4 border border-olive-100">
            <div className="text-sm text-zinc-600 mb-1">{t.admin.dashboard.todayOrders}</div>
            <div className="text-2xl font-bold text-zinc-900">{todayStats.orderCount}</div>
          </div>
          <div className="bg-white/80 rounded-xl p-4 border border-olive-100">
            <div className="text-sm text-zinc-600 mb-1">{t.admin.dashboard.monthOrders}</div>
            <div className="text-2xl font-bold text-zinc-900">{monthStats.orderCount}</div>
          </div>
        </div>

        {/* 店舖設定提示 — 未設定 Banner 或頭像時顯示 */}
        {(!tenant?.coverPhoto || !tenant?.logoUrl) && (
          <Link
            href={`/${locale}/admin/settings`}
            className="mt-4 flex items-center justify-between rounded-xl border border-olive-200 bg-white/60 px-4 py-3 hover:bg-white/80 transition-colors"
          >
            <p className="text-sm text-zinc-600">去設定換你嘅店舖 Banner 同頭像</p>
            <span className="text-zinc-400 text-sm">→</span>
          </Link>
        )}
      </div>

      {/* Analytics stat cards */}
      {analyticsEnabled ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t.admin.dashboard.todayOrders}
            value={todayStats.orderCount}
            icon={<ShoppingCart size={24} />}
          />
          <StatCard
            label={t.admin.dashboard.todayRevenue}
            value={`$${Math.round(todayStats.revenue)}`}
            icon={<DollarSign size={24} />}
          />
          <StatCard
            label={t.admin.dashboard.monthOrders}
            value={monthStats.orderCount}
            icon={<TrendingUp size={24} />}
          />
          <StatCard
            label={t.admin.dashboard.monthRevenue}
            value={`$${Math.round(monthStats.revenue)}`}
            icon={<DollarSign size={24} />}
          />
        </div>
      ) : (
        /* Free plan: only today's order count */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            label={t.admin.dashboard.todayOrders}
            value={todayStats.orderCount}
            icon={<ShoppingCart size={24} />}
          />
        </div>
      )}

      {/* Full analytics: charts + top products (Lite/Pro only) */}
      {analyticsEnabled ? (
        <DashboardCharts
          ordersLast30={ordersLast30}
          revenueLast30={revenueLast30}
          topProducts={topProducts}
          pageViewsLast7={pageViewsLast7}
        />
      ) : (
        /* Upgrade CTA for free plan */
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
          <Lock size={32} className="mx-auto text-zinc-400 mb-3" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">{t.admin.dashboard.upgradeTitle}</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">{t.admin.dashboard.upgradeDesc}</p>
        </div>
      )}

      {/* Top Sellers section (Pro only) */}
      {topSellersEnabled ? (
        <TopSellingProducts t={t.admin.dashboard} />
      ) : analyticsEnabled ? (
        /* Lite plan: show upgrade CTA for top sellers */
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
          <Lock size={32} className="mx-auto text-zinc-400 mb-3" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">{t.admin.dashboard.topSellersProOnly}</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">{t.admin.dashboard.topSellersProDesc}</p>
        </div>
      ) : null}

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <Link
          href={`/${locale}/admin/products`}
          className="flex items-center justify-between bg-white rounded-2xl border border-zinc-200 p-4 hover:bg-zinc-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package size={20} className="text-zinc-400" />
            <span className="font-medium text-zinc-900">{t.admin.dashboard.viewAllProducts}</span>
          </div>
          <ArrowRight size={20} className="text-zinc-400" />
        </Link>
        <Link
          href={`/${locale}/admin/orders`}
          className="flex items-center justify-between bg-white rounded-2xl border border-zinc-200 p-4 hover:bg-zinc-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} className="text-zinc-400" />
            <span className="font-medium text-zinc-900">{t.admin.dashboard.viewAllOrders}</span>
          </div>
          <ArrowRight size={20} className="text-zinc-400" />
        </Link>
      </div>

      {/* Recent orders table */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">{t.admin.dashboard.recentOrders}</h2>
          <Link href={`/${locale}/admin/orders`} className="text-sm text-olive-600 hover:text-olive-700 font-medium">
            {t.admin.dashboard.viewAll}
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">{t.admin.dashboard.noOrders}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full text-sm">
                <thead>
                  <tr className="text-zinc-600 border-b border-zinc-200">
                    <th className="px-4 py-3 text-left">{t.admin.dashboard.tableOrderId}</th>
                    <th className="px-4 py-3 text-left">{t.admin.dashboard.tableCustomer}</th>
                    <th className="px-4 py-3 text-left">{t.admin.dashboard.tableStatus}</th>
                    <th className="px-4 py-3 text-right">{t.admin.dashboard.tableTotal}</th>
                    <th className="px-4 py-3 text-left">{t.admin.dashboard.tableDate}</th>
                    <th className="px-4 py-3 text-right">{t.admin.dashboard.tableAction}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const amounts = order.amounts as Record<string, unknown> | null;
                    return (
                      <tr key={order.id} className="border-t border-zinc-200 hover:bg-zinc-50">
                        <td className="px-4 py-3">
                          <div className="text-zinc-900 font-mono text-xs">{order.id.slice(0, 12)}...</div>
                        </td>
                        <td className="px-4 py-3 text-zinc-700">{order.customerName}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-full px-2 py-1 text-xs">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-900 font-medium">${Math.round(Number(amounts?.total) || 0)}</td>
                        <td className="px-4 py-3 text-zinc-600 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/${locale}/admin/orders/${order.id}`} className="text-olive-600 hover:text-olive-700 text-xs font-medium">
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
