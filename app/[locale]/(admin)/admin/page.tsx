import { prisma } from "@/lib/prisma";
import { Package, CheckCircle, ShoppingCart, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";

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
          <div className="text-3xl font-bold text-zinc-900 mt-2">{value}</div>
        </div>
        <div className="text-zinc-400">{icon}</div>
      </div>
    </div>
  );
}

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Fetch dashboard stats and recent orders
  const [totalProducts, activeProducts, totalOrders, ordersWithAmounts, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.findMany({
      where: { status: { in: ["PAID", "FULFILLING", "SHIPPED", "COMPLETED"] } },
      select: { amounts: true },
    }),
    prisma.order.findMany({
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
  ]);

  // Calculate total revenue from paid orders
  const totalRevenue = ordersWithAmounts.reduce((sum, order) => {
    const amounts = order.amounts as any;
    return sum + (amounts?.total || 0);
  }, 0);

  const formattedRevenue = `HK$${totalRevenue.toFixed(2)}`;

  return (
    <div className="pl-16 pr-4 pb-16 pt-4 max-w-full overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-zinc-500 text-sm">Admin</div>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900">Dashboard</h1>
          <div className="mt-2 text-zinc-500 text-sm">Overview of your store performance.</div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard
          label="Total Products"
          value={totalProducts}
          icon={<Package size={24} />}
        />
        <StatCard
          label="Active Products"
          value={activeProducts}
          icon={<CheckCircle size={24} />}
        />
        <StatCard
          label="Total Orders"
          value={totalOrders}
          icon={<ShoppingCart size={24} />}
        />
        <StatCard
          label="Total Revenue"
          value={formattedRevenue}
          icon={<DollarSign size={24} />}
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
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
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900">Recent Orders</h2>
          <Link
            href={`/${locale}/admin/orders`}
            className="text-sm text-olive-600 hover:text-olive-700 font-medium"
          >
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
                          <div className="text-zinc-900 font-mono text-xs">
                            {order.id.slice(0, 12)}...
                          </div>
                        </td>
                        <td className="px-4 py-3 text-zinc-700">{order.customerName}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-full px-2 py-1 text-xs">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-900 font-medium">
                          HK${(amounts?.total || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 text-xs">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/${locale}/admin/orders/${order.id}`}
                            className="text-olive-600 hover:text-olive-700 text-xs font-medium"
                          >
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
