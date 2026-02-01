import { prisma } from "@/lib/prisma";
import SidebarToggle from "@/components/admin/SidebarToggle";
import CouponsTable from "./coupons-table";

export default async function AdminCoupons({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 pb-16">
      <div className="flex items-center gap-4 mb-6">
        <SidebarToggle />
        <div>
          <div className="text-zinc-500 text-sm">Admin</div>
          <h1 className="text-2xl font-semibold text-zinc-900">Coupons</h1>
          <div className="text-zinc-500 text-sm">Manage discount codes and promotions.</div>
        </div>
      </div>

      <CouponsTable coupons={coupons} locale={locale} />
    </div>
  );
}
