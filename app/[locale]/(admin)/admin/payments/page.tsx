import { prisma } from "@/lib/prisma";
import { getSessionTenantId } from "@/lib/admin/session";
import { getServerTenantId } from "@/lib/tenant";
import type { Locale } from "@/lib/i18n";
import SidebarToggle from "@/components/admin/SidebarToggle";
import PaymentMethodsList from "./payments-list";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPaymentsPage({ params }: PageProps) {
  const { locale } = await params;
  const l = locale as Locale;

  const tenantId = await getSessionTenantId() ?? await getServerTenantId();
  const paymentMethods = await prisma.paymentMethod.findMany({
    where: { tenantId },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="p-4 pb-16">
      <div className="flex items-center gap-4 mb-6">
        <SidebarToggle />
        <div>
          <div className="text-zinc-500 text-sm">Admin</div>
          <h1 className="text-2xl font-semibold text-zinc-900">付款方式管理</h1>
          <div className="text-zinc-500 text-sm">管理 FPS、PayMe、Alipay HK 付款設定</div>
        </div>
      </div>

      <PaymentMethodsList methods={paymentMethods} locale={l} />
    </div>
  );
}
