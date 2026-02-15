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
  { value: "ABANDONED", label: { en: "Abandoned", zh: "棄單" } },
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
  ABANDONED: { en: "Abandoned", zh: "棄單" },
  // Legacy statuses
  PAID: { en: "Paid", zh: "已付款" },
  FULFILLING: { en: "Fulfilling", zh: "配送中" },
  DISPUTED: { en: "Disputed", zh: "爭議中" },
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

// 按規格：PENDING=黃, PAID=綠, SHIPPED=藍, COMPLETED=灰, CANCELLED=紅
function orderStatusBadgeClass(status: string) {
  const s = status.toUpperCase();
  if (s === "PENDING") {
    return "bg-yellow-100 text-yellow-700 border border-yellow-200";
  }
  if (s === "PAID" || s === "CONFIRMED") {
    return "bg-green-100 text-green-700 border border-green-200";
  }
  if (s === "SHIPPED" || s === "PROCESSING" || s === "FULFILLING") {
    return "bg-blue-100 text-blue-700 border border-blue-200";
  }
  if (s === "COMPLETED" || s === "DELIVERED") {
    return "bg-zinc-100 text-zinc-600 border border-zinc-200";
  }
  if (s === "CANCELLED" || s === "ABANDONED") {
    return "bg-red-100 text-red-700 border border-red-200";
  }
  if (s === "REFUNDED") {
    return "bg-amber-100 text-amber-700 border border-amber-200";
  }
  if (s === "DISPUTED") {
    return "bg-rose-100 text-rose-700 border border-rose-200";
  }
  return "bg-zinc-100 text-zinc-600 border border-zinc-200";
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-HK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getProductCount(items: any): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

export function OrdersTable({ orders, locale, currentStatus, searchQuery }: OrdersTableProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || "");
  const [search, setSearch] = useState(searchQuery || "");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
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

      {/* Orders cards */}
      {orders.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-zinc-200 bg-white px-4 py-12 text-center text-zinc-500">
          {locale === "zh-HK" ? "沒有訂單" : "No orders found"}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => {
            const amounts = order.amounts as any;
            const items = order.items as any[];
            const fulfillmentAddress = order.fulfillmentAddress as any;
            const isExpanded = expandedOrderId === order.id;
            const productCount = getProductCount(items);

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-zinc-200 bg-white overflow-hidden transition-shadow hover:shadow-md"
              >
                {/* Card header - clickable */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Left side: Order info */}
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
                          {translateStatus(order.status, locale)}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-900 font-medium">
                        {order.customerName}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {formatDate(order.createdAt)} · {productCount} {locale === "zh-HK" ? "件商品" : "items"}
                      </div>
                    </div>

                    {/* Right side: Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-zinc-900">
                          ${amounts?.total || 0}
                        </div>
                      </div>
                      <svg
                        className={`h-5 w-5 text-zinc-400 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-zinc-200 bg-zinc-50 p-4 space-y-4">
                    {/* Product list */}
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900 mb-2">
                        {locale === "zh-HK" ? "商品列表" : "Products"}
                      </h4>
                      <div className="space-y-2">
                        {items && items.length > 0 ? (
                          items.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex justify-between text-sm bg-white rounded-lg p-2"
                            >
                              <div>
                                <div className="text-zinc-900">{item.name}</div>
                                {item.variant && (
                                  <div className="text-zinc-500 text-xs">{item.variant}</div>
                                )}
                              </div>
                              <div className="text-zinc-600">
                                x{item.quantity} · ${item.unitPrice}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-zinc-500 text-sm">
                            {locale === "zh-HK" ? "無商品資料" : "No items"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customer info */}
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900 mb-2">
                        {locale === "zh-HK" ? "客人資料" : "Customer Info"}
                      </h4>
                      <div className="bg-white rounded-lg p-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-600">
                            {locale === "zh-HK" ? "姓名" : "Name"}:
                          </span>
                          <span className="text-zinc-900">{order.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600">
                            {locale === "zh-HK" ? "電話" : "Phone"}:
                          </span>
                          <span className="text-zinc-900 font-mono">{order.phone}</span>
                        </div>
                        {order.email && (
                          <div className="flex justify-between">
                            <span className="text-zinc-600">Email:</span>
                            <span className="text-zinc-900">{order.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delivery address */}
                    {order.fulfillmentType === "DELIVERY" && fulfillmentAddress && (
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 mb-2">
                          {locale === "zh-HK" ? "送貨地址" : "Delivery Address"}
                        </h4>
                        <div className="bg-white rounded-lg p-3 text-sm text-zinc-900">
                          <div>{fulfillmentAddress.line1}</div>
                          {fulfillmentAddress.district && (
                            <div className="text-zinc-600">{fulfillmentAddress.district}</div>
                          )}
                          {fulfillmentAddress.notes && (
                            <div className="text-zinc-500 text-xs mt-2">
                              {locale === "zh-HK" ? "備註" : "Note"}: {fulfillmentAddress.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pickup info */}
                    {order.fulfillmentType === "PICKUP" && (
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 mb-2">
                          {locale === "zh-HK" ? "自取" : "Pickup"}
                        </h4>
                        <div className="bg-white rounded-lg p-3 text-sm text-zinc-600">
                          {translateFulfillment(order.fulfillmentType, locale)}
                        </div>
                      </div>
                    )}

                    {/* View full details button */}
                    <div className="pt-2">
                      <Link
                        href={`/${locale}/admin/orders/${order.id}`}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                      >
                        {locale === "zh-HK" ? "查看完整訂單詳情" : "View Full Order Details"}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Summary */}
          <div className="flex items-center justify-between px-4 py-3 text-zinc-600 text-sm">
            <div>
              {locale === "zh-HK"
                ? `顯示 ${orders.length} 個訂單`
                : `Showing ${orders.length} orders`}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
