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
};

const ORDER_STATUSES_EN = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "FULFILLING", label: "Fulfilling" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "DISPUTED", label: "Disputed" },
];

const ORDER_STATUSES_ZH = [
  { value: "", label: "所有狀態" },
  { value: "PENDING", label: "待付款" },
  { value: "PAID", label: "已付款" },
  { value: "FULFILLING", label: "配送中" },
  { value: "SHIPPED", label: "已發貨" },
  { value: "COMPLETED", label: "已完成" },
  { value: "CANCELLED", label: "已取消" },
  { value: "REFUNDED", label: "已退款" },
  { value: "DISPUTED", label: "爭議中" },
];

const STATUS_DISPLAY: Record<string, { en: string; zh: string }> = {
  PENDING: { en: "Pending", zh: "待付款" },
  PAID: { en: "Paid", zh: "已付款" },
  CREATED: { en: "Created", zh: "已建立" },
  FULFILLING: { en: "Fulfilling", zh: "配送中" },
  SHIPPED: { en: "Shipped", zh: "已發貨" },
  COMPLETED: { en: "Completed", zh: "已完成" },
  CANCELLED: { en: "Cancelled", zh: "已取消" },
  REFUNDED: { en: "Refunded", zh: "已退款" },
  DISPUTED: { en: "Disputed", zh: "爭議中" },
  succeeded: { en: "Succeeded", zh: "成功" },
  processing: { en: "Processing", zh: "處理中" },
  requires_action: { en: "Requires Action", zh: "需操作" },
  failed: { en: "Failed", zh: "失敗" },
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

function badgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === "paid" || s === "completed" || s === "succeeded") {
    return "bg-olive-100 text-olive-700 border border-olive-200 rounded-full px-2 py-1 text-xs font-medium";
  }
  if (s === "pending" || s === "created") {
    return "bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full px-2 py-1 text-xs";
  }
  if (s === "fulfilling" || s === "shipped" || s === "processing" || s === "requires_action") {
    return "bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-1 text-xs";
  }
  if (s === "refunded") {
    return "bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-2 py-1 text-xs";
  }
  if (s === "failed" || s === "disputed") {
    return "bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-1 text-xs";
  }
  return "bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-full px-2 py-1 text-xs";
}

function getLastPaymentStatus(order: OrderWithPayments): string | null {
  if (order.paymentAttempts && order.paymentAttempts.length > 0) {
    return order.paymentAttempts[0].status;
  }
  return null;
}

function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-HK", { month: "short", day: "numeric" });
}

function getKeyTimestamp(order: OrderWithPayments): { label: string; date: string } | null {
  // Show the most relevant timestamp based on order progress
  if (order.shippedAt) return { label: "Shipped", date: formatShortDate(order.shippedAt) };
  if (order.paidAt) return { label: "Paid", date: formatShortDate(order.paidAt) };
  if (order.cancelledAt) return { label: "Cancelled", date: formatShortDate(order.cancelledAt) };
  if (order.refundedAt) return { label: "Refunded", date: formatShortDate(order.refundedAt) };
  return null;
}

export function OrdersTable({ orders, locale, currentStatus }: OrdersTableProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || "");
  const ORDER_STATUSES = locale === "zh-HK" ? ORDER_STATUSES_ZH : ORDER_STATUSES_EN;

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    const url = status ? `/${locale}/admin/orders?status=${status}` : `/${locale}/admin/orders`;
    router.push(url);
  };

  return (
    <>
      <div className="mt-6 grid gap-3 md:grid-cols-12">
        <div className="md:col-span-9">
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <a
            href="/api/admin/orders/export"
            className="inline-flex w-full items-center justify-center rounded-2xl bg-olive-600 px-4 py-3 text-sm font-semibold text-white hover:bg-olive-700"
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead>
              <tr className="text-zinc-600 border-b border-zinc-200">
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Fulfillment</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Last Payment</th>
                <th className="px-4 py-3 text-left">Key Date</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-zinc-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const amounts = order.amounts as any;
                  const lastPayment = getLastPaymentStatus(order);
                  const keyTimestamp = getKeyTimestamp(order);
                  return (
                    <tr key={order.id} className="border-t border-zinc-200 hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <div className="text-zinc-900 font-medium font-mono text-xs">
                          {order.orderNumber || order.id.slice(0, 12) + "..."}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{order.customerName}</td>
                      <td className="px-4 py-3 text-zinc-700">{order.phone}</td>
                      <td className="px-4 py-3 text-zinc-700">{translateFulfillment(order.fulfillmentType, locale)}</td>
                      <td className="px-4 py-3 text-right text-zinc-900 font-medium">
                        ${amounts?.total || 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center ${badgeClass(order.status)}`}>
                          {translateStatus(order.status, locale)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {lastPayment ? (
                          <span className={`inline-flex items-center ${badgeClass(lastPayment)}`}>
                            {translateStatus(lastPayment, locale)}
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-xs">—</span>
                        )}
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
                          View
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
          <div>Showing {orders.length} orders</div>
        </div>
      </div>
    </>
  );
}
