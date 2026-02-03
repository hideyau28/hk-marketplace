"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { OrderWithPayments } from "./actions";

type OrdersTableProps = {
  orders: OrderWithPayments[];
  locale: Locale;
  currentStatus?: string;
  searchQuery?: string;
};

// Tab filters for the new status flow
const STATUS_TABS = [
  { value: "", label: { en: "All", zh: "全部" } },
  { value: "PENDING", label: { en: "Pending", zh: "待處理" } },
  { value: "CONFIRMED", label: { en: "Confirmed", zh: "已確認" } },
  { value: "PROCESSING", label: { en: "Processing", zh: "處理中" } },
  { value: "SHIPPED", label: { en: "Shipped", zh: "已發貨" } },
  { value: "DELIVERED", label: { en: "Delivered", zh: "已送達" } },
  { value: "COMPLETED", label: { en: "Completed", zh: "已完成" } },
  { value: "CANCELLED", label: { en: "Cancelled", zh: "已取消" } },
];

const STATUS_DISPLAY: Record<string, { en: string; zh: string }> = {
  // New statuses
  PENDING: { en: "Pending", zh: "待處理" },
  CONFIRMED: { en: "Confirmed", zh: "已確認" },
  PROCESSING: { en: "Processing", zh: "處理中" },
  SHIPPED: { en: "Shipped", zh: "已發貨" },
  DELIVERED: { en: "Delivered", zh: "已送達" },
  COMPLETED: { en: "Completed", zh: "已完成" },
  CANCELLED: { en: "Cancelled", zh: "已取消" },
  REFUNDED: { en: "Refunded", zh: "已退款" },
  // Legacy statuses
  PAID: { en: "Paid", zh: "已付款" },
  FULFILLING: { en: "Fulfilling", zh: "配送中" },
  DISPUTED: { en: "Disputed", zh: "爭議中" },
  // Payment statuses
  pending: { en: "Pending", zh: "待上傳" },
  uploaded: { en: "Uploaded", zh: "待確認" },
  confirmed: { en: "Confirmed", zh: "已確認" },
  rejected: { en: "Rejected", zh: "已拒絕" },
};

const PAYMENT_METHOD_ICONS: Record<string, string> = {
  fps: "💸",
  payme: "💳",
  alipay: "🔷",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  fps: "FPS",
  payme: "PayMe",
  alipay: "Alipay",
};

const FULFILLMENT_DISPLAY: Record<string, { en: string; zh: string }> = {
  PICKUP: { en: "Pickup", zh: "自取" },
  DELIVERY: { en: "Delivery", zh: "送貨" },
  pickup: { en: "Pickup", zh: "自取" },
  delivery: { en: "Delivery", zh: "送貨" },
};

function translateStatus(status: string, locale: Locale): string {
  const t = STATUS_DISPLAY[status];
  return t ? (locale === "zh-HK" ? t.zh : t.en) : status;
}

function translateFulfillment(type: string, locale: Locale): string {
  const t = FULFILLMENT_DISPLAY[type];
  return t ? (locale === "zh-HK" ? t.zh : t.en) : type;
}

function orderStatusBadgeClass(status: string) {
  const s = status.toUpperCase();
  // Green for completed states
  if (s === "COMPLETED" || s === "DELIVERED") {
    return "bg-olive-100 text-olive-700 border border-olive-200";
  }
  // Yellow for pending/awaiting
  if (s === "PENDING") {
    return "bg-yellow-100 text-yellow-700 border border-yellow-200";
  }
  // Blue for in-progress states
  if (s === "CONFIRMED" || s === "PROCESSING" || s === "SHIPPED" || s === "FULFILLING" || s === "PAID") {
    return "bg-blue-100 text-blue-700 border border-blue-200";
  }
  // Red for cancelled/disputed
  if (s === "CANCELLED" || s === "DISPUTED") {
    return "bg-red-100 text-red-700 border border-red-200";
  }
  // Amber for refunded
  if (s === "REFUNDED") {
    return "bg-amber-100 text-amber-700 border border-amber-200";
  }
  return "bg-zinc-100 text-zinc-600 border border-zinc-200";
}

function paymentStatusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === "confirmed") {
    return "bg-olive-100 text-olive-700 border border-olive-200";
  }
  if (s === "uploaded") {
    return "bg-yellow-100 text-yellow-700 border border-yellow-200";
  }
  if (s === "rejected") {
    return "bg-red-100 text-red-700 border border-red-200";
  }
  // pending
  return "bg-zinc-100 text-zinc-500 border border-zinc-200";
}

function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-HK", { month: "short", day: "numeric" });
}

function getKeyTimestamp(order: OrderWithPayments): { label: string; date: string } | null {
  // Show the most relevant timestamp based on order progress
  if ((order as any).deliveredAt) return { label: "Delivered", date: formatShortDate((order as any).deliveredAt) };
  if (order.shippedAt) return { label: "Shipped", date: formatShortDate(order.shippedAt) };
  if ((order as any).processingAt) return { label: "Processing", date: formatShortDate((order as any).processingAt) };
  if ((order as any).confirmedAt) return { label: "Confirmed", date: formatShortDate((order as any).confirmedAt) };
  if (order.paidAt) return { label: "Paid", date: formatShortDate(order.paidAt) };
  if (order.cancelledAt) return { label: "Cancelled", date: formatShortDate(order.cancelledAt) };
  if (order.refundedAt) return { label: "Refunded", date: formatShortDate(order.refundedAt) };
  return null;
}

export function OrdersTable({ orders, locale, currentStatus, searchQuery }: OrdersTableProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || "");
  const [search, setSearch] = useState(searchQuery || "");

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("q", search);
    const url = params.toString()
      ? `/${locale}/admin/orders?${params.toString()}`
      : `/${locale}/admin/orders`;
    router.push(url);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedStatus) params.set("status", selectedStatus);
    if (search) params.set("q", search);
    const url = params.toString()
      ? `/${locale}/admin/orders?${params.toString()}`
      : `/${locale}/admin/orders`;
    router.push(url);
  };

  return (
    <>
      {/* Tab filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedStatus === tab.value
                ? "bg-olive-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {locale === "zh-HK" ? tab.label.zh : tab.label.en}
          </button>
        ))}
      </div>

      {/* Search and export */}
      <div className="mt-4 grid gap-3 md:grid-cols-12">
        <form onSubmit={handleSearch} className="md:col-span-9">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={locale === "zh-HK" ? "搜尋訂單編號或電話..." : "Search order ID or phone..."}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-olive-300"
            />
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>
        <div className="md:col-span-3">
          <a
            href="/api/admin/orders/export"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-olive-600 px-4 py-3 text-sm font-semibold text-white hover:bg-olive-700"
          >
            {locale === "zh-HK" ? "匯出 CSV" : "Export CSV"}
          </a>
        </div>
      </div>

      {/* Orders table */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] w-full text-sm">
            <thead>
              <tr className="text-zinc-600 border-b border-zinc-200 bg-zinc-50">
                <th className="px-4 py-3 text-left font-medium">
                  {locale === "zh-HK" ? "訂單編號" : "Order ID"}
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  {locale === "zh-HK" ? "客戶" : "Customer"}
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  {locale === "zh-HK" ? "電話" : "Phone"}
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  {locale === "zh-HK" ? "配送" : "Fulfillment"}
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  {locale === "zh-HK" ? "總額" : "Total"}
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  {locale === "zh-HK" ? "訂單狀態" : "Status"}
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  {locale === "zh-HK" ? "付款" : "Payment"}
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  {locale === "zh-HK" ? "關鍵日期" : "Key Date"}
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  {locale === "zh-HK" ? "建立日期" : "Created"}
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  {locale === "zh-HK" ? "操作" : "Actions"}
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-zinc-500">
                    {locale === "zh-HK" ? "沒有訂單" : "No orders found"}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const amounts = order.amounts as any;
                  const keyTimestamp = getKeyTimestamp(order);
                  const paymentMethod = (order as any).paymentMethod;
                  const paymentStatus = (order as any).paymentStatus || "pending";
                  return (
                    <tr key={order.id} className="border-t border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <div className="text-zinc-900 font-medium font-mono text-xs">
                          {order.orderNumber || order.id.slice(0, 12) + "..."}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{order.customerName}</td>
                      <td className="px-4 py-3 text-zinc-700 font-mono text-xs">{order.phone}</td>
                      <td className="px-4 py-3 text-zinc-700">
                        {translateFulfillment(order.fulfillmentType, locale)}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-900 font-medium">
                        ${amounts?.total || 0}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${orderStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {translateStatus(order.status, locale)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {paymentMethod && (
                            <span className="text-sm" title={PAYMENT_METHOD_LABELS[paymentMethod] || paymentMethod}>
                              {PAYMENT_METHOD_ICONS[paymentMethod] || "💰"}
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${paymentStatusBadgeClass(
                              paymentStatus
                            )}`}
                          >
                            {translateStatus(paymentStatus, locale)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {keyTimestamp ? (
                          <div className="text-xs">
                            <span className="text-zinc-500">{keyTimestamp.label}</span>
                            <span className="text-zinc-700 ml-1">{keyTimestamp.date}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 text-xs">
                        {new Date(order.createdAt).toISOString().slice(0, 10)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/${locale}/admin/orders/${order.id}`}
                          className="inline-block rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50"
                        >
                          {locale === "zh-HK" ? "查看" : "View"}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-zinc-600 text-sm">
          <div>
            {locale === "zh-HK"
              ? `顯示 ${orders.length} 個訂單`
              : `Showing ${orders.length} orders`}
          </div>
        </div>
      </div>
    </>
  );
}
