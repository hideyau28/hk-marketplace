import { Suspense } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getAdminTenantId } from "@/lib/tenant";
import { verifyToken } from "@/lib/auth/jwt";
import { Package, CheckCircle, ShoppingCart, DollarSign, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import SidebarToggle from "@/components/admin/SidebarToggle";
import DashboardCharts from "@/components/admin/DashboardCharts";
import WelcomeToast from "@/components/admin/WelcomeToast";
import BioLinkDashboard from "@/components/admin/BioLinkDashboard";
import { getDict, type Locale } from "@/lib/i18n";

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

  // Full Store mode: existing dashboard
  const now = new Date();
  const start30 = new Date(now);
  start30.setDate(now.getDate() - 29);
  const start7 = new Date(now);
  start7.setDate(now.getDate() - 6);

  const [tenant, totalProducts, activeProducts, totalOrders, pendingOrders, abandonedOrders, ordersWithAmounts, recentOrders, recentOrdersForCharts] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    }),
    prisma.product.count({ where: { tenantId } }),
    prisma.product.count({ where: { tenantId, active: true } }),
    prisma.order.count({ where: { tenantId } }),
    prisma.order.count({ where: { tenantId, status: "PENDING" } }),
    prisma.order.count({ where: { tenantId, status: "ABANDONED" } }),
    prisma.order.findMany({
      where: { tenantId, status: { in: ["PAID", "FULFILLING", "SHIPPED", "COMPLETED"] } },
      select: { amounts: true },
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
      where: { tenantId, createdAt: { gte: start30 } },
      orderBy: { createdAt: "asc" },
      select: {
        createdAt: true,
        status: true,
        amounts: true,
        items: true,
      },
    }),
  ]);

  const totalRevenue = ordersWithAmounts.reduce((sum, order) => {
    const amounts = order.amounts as any;
    return sum + (amounts?.total || 0);
  }, 0);

  const formattedRevenue = `$${totalRevenue.toFixed(0)}`;
  const paidStatuses = new Set(["PAID", "FULFILLING", "SHIPPED", "COMPLETED"]);

  const ordersLast30Map = new Map<string, number>();
  const revenueLast30Map = new Map<string, number>();
  const productCounts = new Map<string, number>();

  for (const order of recentOrdersForCharts) {
    const dateKey = order.createdAt.toISOString().slice(0, 10);
    // Count all orders in last 30 days
    ordersLast30Map.set(dateKey, (ordersLast30Map.get(dateKey) || 0) + 1);

    if (paidStatuses.has(order.status)) {
      const amounts = order.amounts as any;
      const total = amounts?.total || 0;
      revenueLast30Map.set(dateKey, (revenueLast30Map.get(dateKey) || 0) + total);
      const items = Array.isArray(order.items) ? (order.items as any[]) : [];
      for (const item of items) {
        const name = String(item?.name || item?.title || "Item");
        const qty = Number(item?.quantity ?? item?.qty ?? 0);
        if (!Number.isFinite(qty) || qty <= 0) continue;
        productCounts.set(name, (productCounts.get(name) || 0) + qty);
      }
    }
  }

  const ordersLast30 = Array.from({ length: 30 }).map((_, idx) => {
    const d = new Date(start30);
    d.setDate(start30.getDate() + idx);
    const key = d.toISOString().slice(0, 10);
    return {
      date: d.toLocaleDateString("en-HK", { month: "short", day: "numeric" }),
      orders: ordersLast30Map.get(key) || 0,
    };
  });

  // Mock data for page views (API 未有，用 mock data)
  const pageViewsLast7 = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(start7);
    d.setDate(start7.getDate() + idx);
    return {
      date: d.toLocaleDateString("en-HK", { month: "short", day: "numeric" }),
      views: Math.floor(Math.random() * 200) + 50, // Mock: 50-250 views per day
    };
  });

  const revenueLast30 = Array.from({ length: 30 }).map((_, idx) => {
    const d = new Date(start30);
    d.setDate(start30.getDate() + idx);
    const key = d.toISOString().slice(0, 10);
    return {
      date: d.toLocaleDateString("en-HK", { month: "short", day: "numeric" }),
      revenue: revenueLast30Map.get(key) || 0,
    };
  });

  const topProducts = Array.from(productCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  const paidOrdersCount = recentOrdersForCharts.filter((order) => paidStatuses.has(order.status)).length;
  const revenueLast30Total = revenueLast30.reduce((sum, entry) => sum + entry.revenue, 0);
  const avgOrderAmount = paidOrdersCount > 0 ? revenueLast30Total / paidOrdersCount : 0;

  return (
    <div className="p-4 pb-16 max-w-full overflow-hidden">
      <Suspense fallback={null}>
        <WelcomeToast />
      </Suspense>
      <div className="flex items-center gap-4 mb-6">
        <SidebarToggle />
        <div>
          <div className="text-zinc-500 text-sm">Admin</div>
          <h1 className="text-2xl font-semibold text-zinc-900">{t.admin.dashboard.title}</h1>
          <div className="text-zinc-500 text-sm">{t.admin.dashboard.subtitle}</div>
        </div>
      </div>

      {/* Welcome message and quick stats */}
      <div className="bg-gradient-to-r from-olive-50 to-olive-100/50 rounded-2xl border border-olive-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-zinc-900 mb-4">
          👋 歡迎返嚟，{tenant?.name || "店主"}！
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white/80 rounded-xl p-4 border border-olive-100">
            <div className="text-sm text-zinc-600 mb-1">總商品數</div>
            <div className="text-2xl font-bold text-zinc-900">{totalProducts}</div>
          </div>
          <div className="bg-white/80 rounded-xl p-4 border border-olive-100">
            <div className="text-sm text-zinc-600 mb-1">待處理訂單</div>
            <div className="text-2xl font-bold text-zinc-900">{pendingOrders}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-8">
        <StatCard label={t.admin.dashboard.totalProducts} value={totalProducts} icon={<Package size={24} />} />
        <StatCard label={t.admin.dashboard.activeProducts} value={activeProducts} icon={<CheckCircle size={24} />} />
        <StatCard label={t.admin.dashboard.totalOrders} value={totalOrders} icon={<ShoppingCart size={24} />} />
        <StatCard label={t.admin.dashboard.totalRevenue} value={formattedRevenue} icon={<DollarSign size={24} />} />
        <StatCard label={t.admin.dashboard.averageOrder} value={`$${avgOrderAmount.toFixed(0)}`} icon={<DollarSign size={24} />} />
        <StatCard label={locale === "zh-HK" ? "棄單數" : "Abandoned"} value={abandonedOrders} icon={<ShoppingBag size={24} />} />
      </div>

      <DashboardCharts ordersLast30={ordersLast30} revenueLast30={revenueLast30} topProducts={topProducts} pageViewsLast7={pageViewsLast7} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Link
          href={`/${locale}/admin/products`}
          className="flex items-center justify-between bg-white rounded-2xl border border-zinc-200 p-4 hover:bg-zinc-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package size={20} className="text-zinc-400" />
            <span className="font-medium text-zinc-900">View All Products</span>
          </div>
          <ArrowRight size={20} className="text-zinc-400" />
        </Link>
        <Link
          href={`/${locale}/admin/orders`}
          className="flex items-center justify-between bg-white rounded-2xl border border-zinc-200 p-4 hover:bg-zinc-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} className="text-zinc-400" />
            <span className="font-medium text-zinc-900">View All Orders</span>
          </div>
          <ArrowRight size={20} className="text-zinc-400" />
        </Link>
        <Link
          href={`/${locale}/admin/cart-recovery`}
          className="flex items-center justify-between bg-white rounded-2xl border border-zinc-200 p-4 hover:bg-zinc-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-zinc-400" />
            <span className="font-medium text-zinc-900">
              {locale === "zh-HK" ? "棄單挽回" : "Cart Recovery"}
            </span>
          </div>
          <ArrowRight size={20} className="text-zinc-400" />
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">Recent Orders</h2>
          <Link href={`/${locale}/admin/orders`} className="text-sm text-olive-600 hover:text-olive-700 font-medium">
            View All
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">No orders yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full text-sm">
                <thead>
                  <tr className="text-zinc-600 border-b border-zinc-200">
                    <th className="px-4 py-3 text-left">Order ID</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const amounts = order.amounts as any;
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
                        <td className="px-4 py-3 text-right text-zinc-900 font-medium">${Math.round(amounts?.total || 0)}</td>
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
