import { getAdminTenantId } from "@/lib/tenant";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

export default async function AnalyticsPage() {
  // Verify admin access
  await getAdminTenantId();

  return <AnalyticsDashboard />;
}
