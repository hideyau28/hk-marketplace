"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Package, MessageCircle, Loader2 } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string | null;
  customerName: string;
  phone: string;
  items: any;
  amounts: any;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

type Props = {
  orders: Order[];
  locale: string;
};

type FilterTab = "all" | "pending" | "paid";

const statusConfig: Record<string, { label: string; labelZh: string; color: string }> = {
  PENDING: { label: "Pending", labelZh: "待付款", color: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "Confirmed", labelZh: "已確認", color: "bg-blue-100 text-blue-700" },
  PAID: { label: "Paid", labelZh: "已付款", color: "bg-green-100 text-green-700" },
  PROCESSING: { label: "Processing", labelZh: "處理中", color: "bg-blue-100 text-blue-700" },
  SHIPPED: { label: "Shipped", labelZh: "已出貨", color: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Delivered", labelZh: "已送達", color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Completed", labelZh: "完成", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", labelZh: "已取消", color: "bg-zinc-100 text-zinc-500" },
  ABANDONED: { label: "Abandoned", labelZh: "棄單", color: "bg-red-100 text-red-700" },
  FULFILLING: { label: "Fulfilling", labelZh: "配送中", color: "bg-blue-100 text-blue-700" },
};

export default function BioLinkOrders({ orders, locale }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const isZh = locale === "zh-HK";

  const filteredOrders = orders.filter((order) => {
    if (filter === "pending") return order.status === "PENDING";
    if (filter === "paid") return ["PAID", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED", "FULFILLING"].includes(order.status);
    return true;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setUpdatingId(null);
    }
  };

  const handleWhatsApp = (phone: string, orderNumber: string | null) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const fullPhone = cleanPhone.length === 8 ? `852${cleanPhone}` : cleanPhone;
    const text = encodeURIComponent(
      isZh
        ? `你好，關於訂單 ${orderNumber || ""}...`
        : `Hi, regarding order ${orderNumber || ""}...`
    );
    window.open(`https://wa.me/${fullPhone}?text=${text}`, "_blank");
  };

  const formatItems = (items: any) => {
    if (!Array.isArray(items)) return "";
    return items
      .map((item: any) => {
        const name = item.name || item.title || "";
        const variant = item.variant || item.size || "";
        const qty = item.quantity || item.qty || 1;
        return `${name}${variant ? ` · ${variant}` : ""} x ${qty}`;
      })
      .join(", ");
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: isZh ? "全部" : "All" },
    { key: "pending", label: isZh ? "待付款" : "Pending" },
    { key: "paid", label: isZh ? "已付款" : "Paid" },
  ];

  return (
    <div className="px-4 pb-4">
      <h1 className="text-xl font-semibold text-zinc-900 mb-4">{isZh ? "訂單" : "Orders"}</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-[#FF9500] text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <Package size={40} className="mx-auto mb-3 opacity-50" />
          <p>{isZh ? "冇訂單" : "No orders"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const amounts = order.amounts as any;
            const total = amounts?.total || 0;
            const config = statusConfig[order.status] || statusConfig.PENDING;
            const isUpdating = updatingId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-zinc-200 p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono text-zinc-400">
                      {order.orderNumber || order.id.slice(0, 12)}
                    </p>
                    <p className="text-sm font-medium text-zinc-900 mt-0.5">
                      {order.customerName} · {order.phone}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${config.color}`}>
                    {isZh ? config.labelZh : config.label}
                  </span>
                </div>

                {/* Items */}
                <p className="text-sm text-zinc-600 line-clamp-2">{formatItems(order.items)}</p>

                {/* Total + date */}
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-zinc-900">${Math.round(total)}</span>
                  <span className="text-xs text-zinc-400">
                    {new Date(order.createdAt).toLocaleDateString(isZh ? "zh-HK" : "en-HK", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => handleConfirmPayment(order.id)}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      {isUpdating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      {isZh ? "確認收款" : "Confirm Payment"}
                    </button>
                  )}
                  {(order.status === "PAID" || order.status === "CONFIRMED" || order.status === "PROCESSING") && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, "SHIPPED")}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                      {isUpdating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Package size={14} />
                      )}
                      {isZh ? "標記出貨" : "Mark Shipped"}
                    </button>
                  )}
                  <button
                    onClick={() => handleWhatsApp(order.phone, order.orderNumber)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-medium hover:bg-[#20bd5a] transition-colors"
                  >
                    <MessageCircle size={14} />
                    WhatsApp
                  </button>
                </div>
              </div>
            );
          })}

          {/* End of list */}
          <p className="text-center text-xs text-zinc-400 py-4">
            {isZh ? "── 冇更多訂單 ──" : "── No more orders ──"}
          </p>
        </div>
      )}
    </div>
  );
}
