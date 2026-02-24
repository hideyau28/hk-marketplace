import { getAdminTenantId } from "@/lib/tenant";
import { hasFeature } from "@/lib/plan";
import { Lock } from "lucide-react";
import Link from "next/link";
import SidebarToggle from "@/components/admin/SidebarToggle";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tenantId = await getAdminTenantId();
  const analyticsEnabled = await hasFeature(tenantId, "analytics");

  return (
    <div className="p-4 pb-16 max-w-full overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <SidebarToggle />
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">數據分析</h1>
          <div className="text-zinc-500 text-sm">
            訂單、收入同熱門商品一覽
          </div>
        </div>
      </div>

      {analyticsEnabled ? (
        <AnalyticsDashboard />
      ) : (
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
          <Lock size={32} className="mx-auto text-zinc-400 mb-3" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            升級解鎖數據分析
          </h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-4">
            升級至 Lite 或 Pro 計劃，即可查看訂單趨勢、收入報表同熱門商品排行。
          </p>
          <Link
            href={`/${locale}/admin/billing`}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            查看計劃
          </Link>
        </div>
      )}
    </div>
  );
}
