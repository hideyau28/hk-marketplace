import { prisma } from "@/lib/prisma";
import { getServerTenantId } from "@/lib/tenant";
import SidebarToggle from "@/components/admin/SidebarToggle";
import CouponsTable from "./coupons-table";
import { getDict, type Locale } from "@/lib/i18n";

export default async function AdminCoupons({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getDict(locale as Locale);

  const tenantId = await getServerTenantId();
  const coupons = await prisma.coupon.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 pb-16">
      <div className="flex items-center gap-4 mb-6">
        <SidebarToggle />
        <div>
          <div className="text-zinc-500 text-sm">Admin</div>
          <h1 className="text-2xl font-semibold text-zinc-900">{t.admin.coupons.title}</h1>
          <div className="text-zinc-500 text-sm">{t.admin.products.subtitle}</div>
        </div>
      </div>

      <CouponsTable coupons={coupons} locale={locale} />
    </div>
  );
}
