"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, Package, MessageCircle, Loader2, Copy, CheckCheck } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string | null;
  customerName: string;
  phone: string;
  items: any;
  amounts: any;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  fulfillmentType: string;
  fulfillmentAddress: any;
  paymentProof: string | null;
  createdAt: string;
};

type Props = {
  orders: Order[];
  locale: string;
  page: number;
  totalPages: number;
};

type FilterTab = "all" | "pending" | "shipping" | "shipped";

const statusConfig: Record<string, { label: string; labelZh: string; color: string }> = {
  PENDING: { label: "Pending Payment", labelZh: "待付款", color: "bg-wlx-cream text-amber-700" },
  PENDING_CONFIRMATION: { label: "Awaiting Confirmation", labelZh: "待確認收款", color: "bg-wlx-cream text-amber-700" },
  CONFIRMED: { label: "To Ship", labelZh: "待出貨", color: "bg-blue-100 text-blue-700" },
  PAID: { label: "To Ship", labelZh: "待出貨", color: "bg-blue-100 text-blue-700" },
  PROCESSING: { label: "To Ship", labelZh: "待出貨", color: "bg-blue-100 text-blue-700" },
  FULFILLING: { label: "To Ship", labelZh: "待出貨", color: "bg-blue-100 text-blue-700" },
  SHIPPED: { label: "Shipped", labelZh: "已出貨", color: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Delivered", labelZh: "已送達", color: "bg-green-100 text-green-700" },
  COMPLETED: { label: "Completed", labelZh: "完成", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", labelZh: "已取消", color: "bg-wlx-cream text-wlx-stone" },
};

const paymentMethodLabels: Record<string, string> = {
  fps: "FPS 轉帳",
  payme: "PayMe",
  alipay: "AlipayHK",
  bank_transfer: "銀行轉帳",
};

function CopyableField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <div className="flex items-baseline gap-1">
      <span className="text-wlx-stone text-xs shrink-0">{label}</span>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 text-sm text-wlx-stone hover:text-wlx-ink transition-colors min-w-0"
      >
        {copied ? (
          <>
            <span className="text-green-600 text-xs">已複製 ✓</span>
          </>
        ) : (
          <>
            <span className="truncate">{value}</span>
            <Copy size={12} className="text-zinc-300 shrink-0" />
          </>
        )}
      </button>
    </div>
  );
}

export default function BioLinkOrders({ orders, locale, page, totalPages }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const isZh = locale === "zh-HK";

  const filteredOrders = orders.filter((order) => {
    if (filter === "pending") return order.status === "PENDING" || order.status === "PENDING_CONFIRMATION";
    if (filter === "shipping") return ["PAID", "CONFIRMED", "PROCESSING", "FULFILLING"].includes(order.status);
    if (filter === "shipped") return ["SHIPPED", "DELIVERED", "COMPLETED"].includes(order.status);
    return true;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        console.error(`Failed to update order ${orderId} to ${newStatus}:`, res.status);
      }
    } catch (err) {
      console.error("Error updating order status:", err);
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours();
    const minute = d.getMinutes().toString().padStart(2, "0");
    const ampm = hour >= 12 ? "下午" : "上午";
    const h12 = hour % 12 || 12;
    return `${month}月${day}日 ${ampm}${h12}:${minute}`;
  };

  const getAddress = (order: Order): string | null => {
    const addr = order.fulfillmentAddress;
    if (!addr) return null;
    return addr.address || null;
  };

  const getFulfillmentLabel = (order: Order): string | null => {
    const addr = order.fulfillmentAddress;
    if (!addr) return null;
    return addr.line1 || null;
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "全部" },
    { key: "pending", label: "待付款" },
    { key: "shipping", label: "待出貨" },
    { key: "shipped", label: "已出貨" },
  ];

  return (
    <div className="px-4 pb-4">
      <h1 className="text-xl font-semibold text-wlx-ink mb-4">{isZh ? "訂單" : "Orders"}</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-wlx-ink text-white"
                : "bg-wlx-cream text-wlx-stone hover:bg-wlx-mist"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="付款截圖"
            className="max-w-full max-h-[80vh] rounded-xl object-contain"
          />
        </div>
      )}

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-wlx-stone">
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
            const address = getAddress(order);
            const showConfirm = order.status === "PENDING" || order.status === "PENDING_CONFIRMATION";
            const showShip = ["PAID", "CONFIRMED", "PROCESSING", "FULFILLING"].includes(order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-wlx-mist overflow-hidden"
              >
                {/* Header: order number + status */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <span className="text-xs font-mono text-wlx-stone">
                    {order.orderNumber || order.id.slice(0, 12)}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${config.color}`}>
                    {isZh ? config.labelZh : config.label}
                  </span>
                </div>

                <div className="border-t border-wlx-mist mx-4" />

                {/* 👤 客人 */}
                <div className="px-4 py-3 flex justify-between items-start">
                  <div className="space-y-1.5 min-w-0">
                    <CopyableField label="姓名：" value={order.customerName} />
                    <CopyableField label="電話：" value={order.phone} />
                    {address && <CopyableField label="地址：" value={address} />}
                  </div>
                  <button
                    onClick={() => handleWhatsApp(order.phone, order.orderNumber)}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors shrink-0 ml-2"
                  >
                    <MessageCircle size={20} />
                  </button>
                </div>

                <div className="border-t border-wlx-mist mx-4" />

                {/* 🛒 商品 */}
                <div className="px-4 py-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-wlx-stone text-xs shrink-0">商品：</span>
                    <span className="text-sm text-wlx-stone">{formatItems(order.items)}</span>
                  </div>
                </div>

                <div className="border-t border-wlx-mist mx-4" />

                {/* 💰 訂單 */}
                <div className="px-4 py-3 flex justify-between items-start">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-wlx-stone text-xs shrink-0">金額：</span>
                      <span className="text-sm font-semibold text-wlx-stone">${Math.round(total)}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-wlx-stone text-xs shrink-0">日期：</span>
                      <span className="text-sm text-wlx-stone">{formatDate(order.createdAt)}</span>
                    </div>
                    {order.paymentMethod && (
                      <div className="flex items-baseline gap-1">
                        <span className="text-wlx-stone text-xs shrink-0">付款：</span>
                        <span className="text-sm text-wlx-stone">
                          {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                        </span>
                      </div>
                    )}
                    {getFulfillmentLabel(order) && (
                      <div className="flex items-baseline gap-1">
                        <span className="text-wlx-stone text-xs shrink-0">取貨方式：</span>
                        <span className="text-sm text-wlx-stone">{getFulfillmentLabel(order)}</span>
                      </div>
                    )}
                  </div>
                  {order.paymentProof && (
                    <button onClick={() => setLightbox(order.paymentProof)} className="shrink-0 ml-3">
                      <img
                        src={order.paymentProof}
                        alt="付款截圖"
                        className="w-20 h-20 rounded-lg object-cover border border-wlx-mist hover:border-zinc-400 transition-colors"
                      />
                    </button>
                  )}
                </div>

                {/* Footer: actions */}
                {(showConfirm || showShip) && (
                  <>
                    <div className="border-t border-wlx-mist mx-4" />
                    <div className="px-4 py-3 flex gap-2">
                      {showConfirm && (
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
                          確認收款
                        </button>
                      )}
                      {showShip && (
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
                          標記出貨
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-4 px-1">
              <span className="text-xs text-wlx-stone">
                {isZh ? `第 ${page} / ${totalPages} 頁` : `Page ${page} of ${totalPages}`}
              </span>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Link
                    href={`?page=${page - 1}`}
                    className="rounded-lg border border-wlx-mist bg-white px-3 py-1.5 text-xs font-medium text-wlx-stone hover:bg-wlx-cream transition-colors"
                  >
                    {isZh ? "上一頁" : "Prev"}
                  </Link>
                ) : (
                  <span className="rounded-lg border border-wlx-mist px-3 py-1.5 text-xs font-medium text-zinc-300 cursor-not-allowed">
                    {isZh ? "上一頁" : "Prev"}
                  </span>
                )}
                {page < totalPages ? (
                  <Link
                    href={`?page=${page + 1}`}
                    className="rounded-lg border border-wlx-mist bg-white px-3 py-1.5 text-xs font-medium text-wlx-stone hover:bg-wlx-cream transition-colors"
                  >
                    {isZh ? "下一頁" : "Next"}
                  </Link>
                ) : (
                  <span className="rounded-lg border border-wlx-mist px-3 py-1.5 text-xs font-medium text-zinc-300 cursor-not-allowed">
                    {isZh ? "下一頁" : "Next"}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
