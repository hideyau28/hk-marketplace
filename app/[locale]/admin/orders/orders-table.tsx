"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import type { Order } from "@prisma/client";
import { OrderDetailModal } from "./order-detail-modal";

type OrdersTableProps = {
  orders: Order[];
  locale: Locale;
  currentStatus?: string;
};

const ORDER_STATUSES = [
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

function badgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === "paid" || s === "completed") return "bg-emerald-500/15 text-emerald-200 border-emerald-500/20";
  if (s === "pending") return "bg-white/10 text-white/70 border-white/10";
  if (s === "fulfilling" || s === "shipped") return "bg-sky-500/15 text-sky-200 border-sky-500/20";
  if (s === "refunded") return "bg-amber-500/15 text-amber-200 border-amber-500/20";
  return "bg-rose-500/15 text-rose-200 border-rose-500/20";
}

export function OrdersTable({ orders, locale, currentStatus }: OrdersTableProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || "");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    const url = status ? `/${locale}/admin/orders?status=${status}` : `/${locale}/admin/orders`;
    router.push(url);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  return (
    <>
      <div className="mt-6 grid gap-3 md:grid-cols-12">
        <div className="md:col-span-10">
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead>
              <tr className="text-white/60 border-b border-white/10">
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Fulfillment</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-white/60">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const amounts = order.amounts as any;
                  return (
                    <tr key={order.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="text-white font-medium font-mono text-xs">
                          {order.id.slice(0, 12)}...
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/80">{order.customerName}</td>
                      <td className="px-4 py-3 text-white/80">{order.phone}</td>
                      <td className="px-4 py-3 text-white/80">{order.fulfillmentType}</td>
                      <td className="px-4 py-3 text-right text-white font-medium">
                        {amounts?.currency || "HKD"} {amounts?.total || 0}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${badgeClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-white/60 text-sm">
          <div>Showing {orders.length} orders</div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={handleCloseModal} locale={locale} />
      )}
    </>
  );
}
