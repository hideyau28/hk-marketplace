"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import { useToast } from "@/components/Toast";

// Valid transitions for each status
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  // New status flow
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED", "REFUNDED"],
  COMPLETED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
  ABANDONED: ["PENDING"],
  // Legacy statuses
  PAID: ["FULFILLING", "CONFIRMED", "CANCELLED", "REFUNDED", "DISPUTED"],
  FULFILLING: ["SHIPPED", "PROCESSING", "CANCELLED"],
  DISPUTED: [],
};

const STATUS_DISPLAY: Record<OrderStatus, { en: string; zh: string }> = {
  PENDING: { en: "Pending", zh: "待處理" },
  CONFIRMED: { en: "Confirmed", zh: "已確認" },
  PROCESSING: { en: "Processing", zh: "處理中" },
  SHIPPED: { en: "Shipped", zh: "已發貨" },
  DELIVERED: { en: "Delivered", zh: "已送達" },
  COMPLETED: { en: "Completed", zh: "已完成" },
  CANCELLED: { en: "Cancelled", zh: "已取消" },
  REFUNDED: { en: "Refunded", zh: "已退款" },
  ABANDONED: { en: "Abandoned", zh: "棄單" },
  PAID: { en: "Paid", zh: "已付款" },
  FULFILLING: { en: "Fulfilling", zh: "配送中" },
  DISPUTED: { en: "Disputed", zh: "爭議中" },
};

type OrderStatusUpdateProps = {
  order: {
    id: string;
    status: OrderStatus;
    trackingNumber?: string | null;
    cancelReason?: string | null;
    refundReason?: string | null;
    statusHistory?: string | null;
  };
  locale: Locale;
};

export default function OrderStatusUpdate({ order, locale }: OrderStatusUpdateProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [cancelReason, setCancelReason] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const validTransitions = VALID_TRANSITIONS[order.status] || [];
  const isTerminal = validTransitions.length === 0;

  const translateStatus = (status: OrderStatus) => {
    const t = STATUS_DISPLAY[status];
    return t ? (locale === "zh-HK" ? t.zh : t.en) : status;
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status) return;
    if (!validTransitions.includes(selectedStatus)) {
      setError(locale === "zh-HK" ? "無效的狀態轉換" : "Invalid status transition");
      return;
    }

    setIsUpdating(true);
    setError("");

    try {
      const body: Record<string, any> = { status: selectedStatus };

      // Add tracking number for SHIPPED status
      if (selectedStatus === "SHIPPED" && trackingNumber) {
        body.trackingNumber = trackingNumber;
      }

      // Add cancel reason
      if (selectedStatus === "CANCELLED" && cancelReason) {
        body.cancelReason = cancelReason;
      }

      // Add refund reason
      if (selectedStatus === "REFUNDED" && refundReason) {
        body.refundReason = refundReason;
      }

      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast(locale === "zh-HK" ? "狀態已更新" : "Status updated!");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error?.message || "Update failed");
      }
    } catch (e) {
      setError(locale === "zh-HK" ? "網絡錯誤" : "Network error");
    } finally {
      setIsUpdating(false);
    }
  };

  // Parse status history
  const statusHistory = order.statusHistory ? JSON.parse(order.statusHistory) : [];

  return (
    <div className="space-y-4 pb-8">
      {/* Current Status */}
      <div>
        <label className="block text-sm text-zinc-500 mb-2">
          {locale === "zh-HK" ? "當前狀態" : "Current Status"}
        </label>
        <div className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ${
          order.status === "COMPLETED" || order.status === "DELIVERED" ? "bg-olive-100 text-olive-700" :
          order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
          order.status === "CANCELLED" || order.status === "DISPUTED" ? "bg-red-100 text-red-700" :
          order.status === "REFUNDED" ? "bg-amber-100 text-amber-700" :
          "bg-blue-100 text-blue-700"
        }`}>
          {translateStatus(order.status)}
        </div>
      </div>

      {/* Status Update (only show if not terminal) */}
      {!isTerminal && (
        <>
          <div>
            <label htmlFor="status" className="block text-sm text-zinc-500 mb-2">
              {locale === "zh-HK" ? "更新狀態" : "Update Status"}
            </label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value={order.status}>{translateStatus(order.status)}</option>
              {validTransitions.map((status) => (
                <option key={status} value={status}>
                  {translateStatus(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Tracking Number Input (show when transitioning to SHIPPED) */}
          {selectedStatus === "SHIPPED" && (
            <div>
              <label htmlFor="tracking" className="block text-sm text-zinc-500 mb-2">
                {locale === "zh-HK" ? "追蹤號碼" : "Tracking Number"}
              </label>
              <input
                id="tracking"
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder={locale === "zh-HK" ? "輸入追蹤號碼" : "Enter tracking number"}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          )}

          {/* Cancel Reason Input */}
          {selectedStatus === "CANCELLED" && (
            <div>
              <label htmlFor="cancelReason" className="block text-sm text-zinc-500 mb-2">
                {locale === "zh-HK" ? "取消原因" : "Cancel Reason"}
              </label>
              <textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={locale === "zh-HK" ? "輸入取消原因（選填）" : "Enter cancel reason (optional)"}
                rows={2}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          )}

          {/* Refund Reason Input */}
          {selectedStatus === "REFUNDED" && (
            <div>
              <label htmlFor="refundReason" className="block text-sm text-zinc-500 mb-2">
                {locale === "zh-HK" ? "退款原因" : "Refund Reason"}
              </label>
              <textarea
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder={locale === "zh-HK" ? "輸入退款原因（選填）" : "Enter refund reason (optional)"}
                rows={2}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              />
            </div>
          )}

          <button
            onClick={handleUpdateStatus}
            disabled={isUpdating || selectedStatus === order.status}
            className="w-full rounded-xl bg-olive-600 py-2.5 text-white font-semibold hover:bg-olive-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating
              ? (locale === "zh-HK" ? "更新中..." : "Updating...")
              : (locale === "zh-HK" ? "更新狀態" : "Update Status")}
          </button>
        </>
      )}

      {/* Show existing tracking number */}
      {order.trackingNumber && (
        <div className="pt-3 border-t border-zinc-200">
          <div className="text-sm text-zinc-500 mb-1">
            {locale === "zh-HK" ? "追蹤號碼" : "Tracking Number"}
          </div>
          <div className="text-zinc-900 font-mono text-sm">{order.trackingNumber}</div>
        </div>
      )}

      {/* Show cancel/refund reason */}
      {order.cancelReason && (
        <div className="pt-3 border-t border-zinc-200">
          <div className="text-sm text-zinc-500 mb-1">
            {locale === "zh-HK" ? "取消原因" : "Cancel Reason"}
          </div>
          <div className="text-zinc-900 text-sm">{order.cancelReason}</div>
        </div>
      )}

      {order.refundReason && (
        <div className="pt-3 border-t border-zinc-200">
          <div className="text-sm text-zinc-500 mb-1">
            {locale === "zh-HK" ? "退款原因" : "Refund Reason"}
          </div>
          <div className="text-zinc-900 text-sm">{order.refundReason}</div>
        </div>
      )}

      {/* Status History */}
      {statusHistory.length > 0 && (
        <div className="pt-3 border-t border-zinc-200">
          <div className="text-sm text-zinc-500 mb-2">
            {locale === "zh-HK" ? "狀態歷史" : "Status History"}
          </div>
          <div className="space-y-2">
            {statusHistory.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">
                  {translateStatus(entry.fromStatus)} → {translateStatus(entry.toStatus)}
                </span>
                <span className="text-zinc-400">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
