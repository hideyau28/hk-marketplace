import { prisma } from "@/lib/prisma";
import { Package, CheckCircle, ShoppingCart, DollarSign } from "lucide-react";

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

export default async function AdminDashboard() {
  // Fetch dashboard stats
  const [totalProducts, activeProducts, totalOrders, ordersWithAmounts] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.findMany({
      where: { status: { in: ["PAID", "FULFILLING", "SHIPPED", "COMPLETED"] } },
      select: { amounts: true },
    }),
  ]);

  // Calculate total revenue from paid orders
  const totalRevenue = ordersWithAmounts.reduce((sum, order) => {
    const amounts = order.amounts as any;
    return sum + (amounts?.total || 0);
  }, 0);

  const formattedRevenue = `HK$${totalRevenue.toFixed(2)}`;

  return (
    <div className="pl-16 pr-4 pb-16 pt-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-zinc-500 text-sm">Admin</div>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900">Dashboard</h1>
          <div className="mt-2 text-zinc-500 text-sm">Overview of your store performance.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
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
    </div>
  );
}
