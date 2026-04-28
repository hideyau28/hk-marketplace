import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getAdminTenantId } from "@/lib/tenant";
import SidebarToggle from "@/components/admin/SidebarToggle";
import { formatDistanceToNow } from "date-fns";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

const ITEMS_PER_PAGE = 50;

export default async function AdminLogsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  const l = locale as Locale;
  const t = getDict(l);

  const page = parseInt(pageParam || "1");
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const tenantId = await getAdminTenantId();

  // Fetch logs with pagination
  const [logs, totalCount] = await Promise.all([
    prisma.adminLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: ITEMS_PER_PAGE,
      skip,
    }),
    prisma.adminLog.count({ where: { tenantId } }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="p-4 pb-16">
      <div className="flex items-center gap-4 mb-6">
        <SidebarToggle />
        <div>
          <div className="text-wlx-stone text-sm">Admin</div>
          <h1 className="text-2xl font-semibold text-wlx-ink">{t.admin.logs.title}</h1>
          <div className="text-wlx-stone text-sm">{t.admin.products.subtitle}</div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-wlx-mist bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="text-wlx-stone border-b border-wlx-mist">
                <th className="px-4 py-3 text-left">{t.admin.logs.timestamp}</th>
                <th className="px-4 py-3 text-left">{t.admin.logs.action}</th>
                <th className="px-4 py-3 text-left">{t.admin.logs.resource}</th>
                <th className="px-4 py-3 text-left">{t.admin.logs.details}</th>
                <th className="px-4 py-3 text-left">{t.admin.logs.ipAddress}</th>
              </tr>
            </thead>

            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-wlx-stone">
                    {t.admin.common.noData}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-t border-wlx-mist hover:bg-wlx-cream">
                    <td className="px-4 py-3 text-wlx-stone">
                      <div className="text-wlx-ink">
                        {new Date(log.createdAt).toLocaleString(l === "zh-HK" ? "zh-HK" : "en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-xs text-wlx-stone">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full border border-olive-200 bg-olive-100 px-2 py-1 text-xs text-olive-700 font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-wlx-stone">
                      {log.resource && (
                        <div>
                          <div className="text-wlx-ink">{log.resource}</div>
                          {log.resourceId && <div className="text-xs text-wlx-stone font-mono">{log.resourceId}</div>}
                        </div>
                      )}
                      {!log.resource && <span className="text-wlx-stone">—</span>}
                    </td>
                    <td className="px-4 py-3 text-wlx-stone">
                      {log.details && typeof log.details === "object" && Object.keys(log.details).length > 0 ? (
                        <pre className="text-xs text-wlx-stone font-mono max-w-xs overflow-hidden text-ellipsis">
                          {JSON.stringify(log.details, null, 2).slice(0, 100)}
                          {JSON.stringify(log.details).length > 100 ? "..." : ""}
                        </pre>
                      ) : (
                        <span className="text-wlx-stone">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-wlx-stone font-mono text-xs">
                      {log.ipAddress || <span className="text-wlx-stone">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-wlx-mist px-4 py-3 text-wlx-stone text-sm">
          <div>
            Showing {skip + 1}-{Math.min(skip + ITEMS_PER_PAGE, totalCount)} of {totalCount} logs
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/${locale}/admin/logs?page=${page - 1}`}
                className="rounded-lg border border-wlx-mist bg-white px-3 py-1.5 text-wlx-stone hover:bg-wlx-cream"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/${locale}/admin/logs?page=${page + 1}`}
                className="rounded-lg border border-wlx-mist bg-white px-3 py-1.5 text-wlx-stone hover:bg-wlx-cream"
              >
                Next
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
