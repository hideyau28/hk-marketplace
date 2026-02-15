import { prisma } from "@/lib/prisma";
import { getAdminTenantId } from "@/lib/tenant";
import { hasFeature } from "@/lib/plan";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import SidebarToggle from "@/components/admin/SidebarToggle";
import Link from "next/link";

type PageProps = {
  params: Promise<{ locale: string; phone: string }>;
};

const STATUS_DISPLAY: Record<string, { en: string; zh: string }> = {
  PENDING: { en: "Pending", zh: "待處理" },
  CONFIRMED: { en: "Confirmed", zh: "已確認" },
  PROCESSING: { en: "Processing", zh: "處理中" },
  SHIPPED: { en: "Shipped", zh: "已發貨" },
  DELIVERED: { en: "Delivered", zh: "已送達" },
  COMPLETED: { en: "Completed", zh: "已完成" },
  CANCELLED: { en: "Cancelled", zh: "已取消" },
  REFUNDED: { en: "Refunded", zh: "已退款" },
  PAID: { en: "Paid", zh: "已付款" },
  FULFILLING: { en: "Fulfilling", zh: "配送中" },
  DISPUTED: { en: "Disputed", zh: "爭議中" },
};

function translateStatus(status: string, locale: Locale): string {
  const t = STATUS_DISPLAY[status];
  return t ? (locale === "zh-HK" ? t.zh : t.en) : status;
}

function orderStatusBadgeClass(status: string) {
  const s = status.toUpperCase();
  if (s === "PENDING")
    return "bg-yellow-100 text-yellow-700 border border-yellow-200";
  if (s === "PAID" || s === "CONFIRMED")
    return "bg-green-100 text-green-700 border border-green-200";
  if (s === "SHIPPED" || s === "PROCESSING" || s === "FULFILLING")
    return "bg-blue-100 text-blue-700 border border-blue-200";
  if (s === "COMPLETED" || s === "DELIVERED")
    return "bg-zinc-100 text-zinc-600 border border-zinc-200";
  if (s === "CANCELLED")
    return "bg-red-100 text-red-700 border border-red-200";
  if (s === "REFUNDED")
    return "bg-amber-100 text-amber-700 border border-amber-200";
  return "bg-zinc-100 text-zinc-600 border border-zinc-200";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-HK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { locale, phone } = await params;
  const l = locale as Locale;
  const t = getDict(l);
  const decodedPhone = decodeURIComponent(phone);

  const tenantId = await getAdminTenantId();

  const crmEnabled = await hasFeature(tenantId, "crm");
  if (!crmEnabled) {
    return (
      <div className="p-4 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <SidebarToggle />
          <div>
            <div className="text-zinc-500 text-sm">Admin</div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              {t.admin.customers.proFeature}
            </h1>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-12 text-center">
          <p className="text-zinc-500 mb-6">{t.admin.customers.proFeatureDesc}</p>
          <Link
            href={`/${locale}/admin/settings`}
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
          >
            {t.admin.customers.upgrade}
          </Link>
        </div>
      </div>
    );
  }

  // Fetch all orders for this customer
  const orders = await prisma.order.findMany({
    where: { tenantId, phone: decodedPhone },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      phone: true,
      email: true,
      items: true,
      amounts: true,
      status: true,
      fulfillmentType: true,
      createdAt: true,
      paymentStatus: true,
    },
  });

  if (orders.length === 0) {
    return (
      <div className="p-4 pb-16">
        <div className="flex items-center gap-4 mb-6">
          <SidebarToggle />
          <div>
            <div className="text-zinc-500 text-sm">Admin</div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              {t.admin.customers.customerDetail}
            </h1>
          </div>
        </div>
        <div className="mt-4 text-zinc-500">
          {locale === "zh-HK" ? "找不到客戶" : "Customer not found"}
        </div>
        <Link
          href={`/${locale}/admin/customers`}
          className="mt-4 inline-flex items-center text-sm text-olive-600 hover:underline"
        >
          {t.admin.customers.back}
        </Link>
      </div>
    );
  }

  const latestOrder = orders[0];
  const totalSpent = orders.reduce(
    (sum, o) => sum + (Number((o.amounts as Record<string, unknown>)?.total) || 0),
    0
  );

  // WhatsApp link — strip non-numeric for wa.me
  const whatsappPhone = decodedPhone.replace(/[^0-9+]/g, "");
  const whatsappUrl = `https://wa.me/${whatsappPhone.replace("+", "")}`;

  return (
    <div className="p-4 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <SidebarToggle />
        <div>
          <div className="text-zinc-500 text-sm">Admin</div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            {t.admin.customers.customerDetail}
          </h1>
        </div>
      </div>

      {/* Back link */}
      <Link
        href={`/${locale}/admin/customers`}
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t.admin.customers.back}
      </Link>

      {/* Customer info card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              {latestOrder.customerName}
            </h2>
            <div className="mt-2 space-y-1 text-sm text-zinc-600">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="font-mono">{decodedPhone}</span>
              </div>
              {latestOrder.email && (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{latestOrder.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors flex-shrink-0"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t.admin.customers.whatsappContact}
          </a>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-zinc-100 pt-4">
          <div className="text-center">
            <div className="text-2xl font-semibold text-zinc-900">
              {orders.length}
            </div>
            <div className="text-xs text-zinc-500">
              {t.admin.customers.totalOrders}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-zinc-900">
              {formatCurrency(totalSpent)}
            </div>
            <div className="text-xs text-zinc-500">
              {t.admin.customers.totalSpent}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-zinc-900">
              {formatCurrency(orders.length > 0 ? totalSpent / orders.length : 0)}
            </div>
            <div className="text-xs text-zinc-500">
              {locale === "zh-HK" ? "平均消費" : "Avg. Order"}
            </div>
          </div>
        </div>
      </div>

      {/* Order history */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">
          {t.admin.customers.orderHistory}
        </h3>

        <div className="space-y-3">
          {orders.map((order) => {
            const amounts = order.amounts as Record<string, unknown>;
            const items = order.items as Array<Record<string, unknown>>;
            const productCount = Array.isArray(items)
              ? items.reduce(
                  (sum, item) => sum + (Number(item.quantity) || 1),
                  0
                )
              : 0;

            return (
              <Link
                key={order.id}
                href={`/${locale}/admin/orders/${order.id}`}
                className="block rounded-xl border border-zinc-100 p-4 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-zinc-500">
                        {order.orderNumber || `#${order.id.slice(0, 8)}`}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${orderStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {translateStatus(order.status, l)}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {formatDate(order.createdAt)} · {productCount}{" "}
                      {locale === "zh-HK" ? "件商品" : "items"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-zinc-900">
                      ${Number(amounts?.total) || 0}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
