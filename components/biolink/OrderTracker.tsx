"use client";

import { useState, useCallback } from "react";
import { useTemplate } from "@/lib/template-context";
import { formatPrice } from "@/lib/biolink-helpers";

type OrderItem = {
  name: string;
  qty: number;
  unitPrice: number;
  image?: string | null;
};

type OrderData = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  items: OrderItem[];
  amounts: {
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    currency: string;
  };
  delivery: {
    method: string;
    address: string | null;
  };
  trackingNumber: string | null;
  paymentStatus: string | null;
  timestamps: {
    created: string;
    paid: string | null;
    confirmed: string | null;
    processing: string | null;
    shipped: string | null;
    delivered: string | null;
    completed: string | null;
  };
  store: { name: string; slug: string };
};

type Props = {
  orderId: string;
  storeSlug: string;
  storeName: string;
  logoUrl: string | null;
  currency: string;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待確認",
  PENDING_CONFIRMATION: "等待確認付款",
  CONFIRMED: "已確認",
  PROCESSING: "處理中",
  SHIPPED: "已發貨",
  DELIVERED: "已送達",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  REFUNDED: "已退款",
  PAYMENT_REJECTED: "付款被拒",
};

const STATUS_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
];

function getStatusIndex(status: string): number {
  // Map PENDING_CONFIRMATION to PENDING level
  const normalized =
    status === "PENDING_CONFIRMATION" ? "PENDING" : status;
  const idx = STATUS_STEPS.indexOf(normalized);
  return idx >= 0 ? idx : 0;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-HK", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderTracker({
  orderId,
  storeSlug,
  storeName,
  logoUrl,
  currency,
}: Props) {
  const tmpl = useTemplate();
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtleBorder = `${tmpl.subtext}20`;
  const cardBg = `${tmpl.card}18`;
  const inputBg = `${tmpl.card}18`;
  const borderColor = `${tmpl.subtext}30`;

  const handleTrack = useCallback(async () => {
    if (!/^\d{8}$/.test(phone.trim())) {
      setError("請輸入 8 位電話號碼");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/biolink/orders/${orderId}/track?phone=${phone.trim()}`,
      );
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json?.error?.message || "查詢失敗");
        setOrder(null);
      } else {
        setOrder(json.data);
      }
    } catch {
      setError("查詢失敗，請重試");
    } finally {
      setLoading(false);
    }
  }, [orderId, phone]);

  const currentStepIdx = order ? getStatusIndex(order.status) : 0;
  const isCancelled =
    order &&
    ["CANCELLED", "REFUNDED", "PAYMENT_REJECTED"].includes(order.status);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: tmpl.bg }}
    >
      {/* Header */}
      <div
        className="px-5 pt-6 pb-4"
        style={{ borderBottom: `1px solid ${subtleBorder}` }}
      >
        <div className="flex items-center gap-3">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={storeName}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <h1 className="font-bold text-base" style={{ color: tmpl.text }}>
              {storeName}
            </h1>
            <p className="text-xs" style={{ color: tmpl.subtext }}>
              訂單追蹤
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-5 pb-8">
        {/* Phone verification form */}
        {!order && (
          <div className="mt-8">
            <h2
              className="text-lg font-bold mb-2"
              style={{ color: tmpl.text }}
            >
              查詢訂單
            </h2>
            <p className="text-sm mb-6" style={{ color: tmpl.subtext }}>
              請輸入落單時嘅電話號碼以查詢訂單狀態
            </p>

            <div className="space-y-3">
              <div>
                <label
                  className="text-xs mb-1 block"
                  style={{ color: tmpl.subtext }}
                >
                  電話號碼
                </label>
                <input
                  type="tel"
                  placeholder="9XXX XXXX"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 8));
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTrack();
                  }}
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                  style={{
                    backgroundColor: inputBg,
                    color: tmpl.text,
                    border: `1px solid ${borderColor}`,
                  }}
                />
              </div>

              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}

              <button
                onClick={handleTrack}
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm transition-opacity"
                style={{
                  backgroundColor: tmpl.accent,
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? "查詢中..." : "查詢訂單"}
              </button>
            </div>
          </div>
        )}

        {/* Order details */}
        {order && (
          <div className="mt-6 space-y-5">
            {/* Order header */}
            <div className="text-center">
              <p className="text-sm" style={{ color: tmpl.subtext }}>
                訂單編號
              </p>
              <p
                className="text-lg font-bold font-mono"
                style={{ color: tmpl.text }}
              >
                {order.orderNumber}
              </p>
              <div
                className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: isCancelled
                    ? "#ef444420"
                    : `${tmpl.accent}20`,
                  color: isCancelled ? "#ef4444" : tmpl.accent,
                }}
              >
                {STATUS_LABELS[order.status] || order.status}
              </div>
            </div>

            {/* Status timeline */}
            {!isCancelled && (
              <div
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${subtleBorder}`,
                }}
              >
                <div className="space-y-0">
                  {STATUS_STEPS.map((step, idx) => {
                    const isComplete = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const isLast = idx === STATUS_STEPS.length - 1;

                    return (
                      <div key={step} className="flex gap-3">
                        {/* Dot + line */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: isComplete
                                ? tmpl.accent
                                : `${tmpl.subtext}30`,
                              boxShadow: isCurrent
                                ? `0 0 0 4px ${tmpl.accent}30`
                                : "none",
                            }}
                          />
                          {!isLast && (
                            <div
                              className="w-0.5 h-8"
                              style={{
                                backgroundColor: isComplete
                                  ? tmpl.accent
                                  : `${tmpl.subtext}20`,
                              }}
                            />
                          )}
                        </div>

                        {/* Label */}
                        <div className="pb-5">
                          <p
                            className="text-sm font-medium -mt-0.5"
                            style={{
                              color: isComplete
                                ? tmpl.text
                                : `${tmpl.subtext}80`,
                            }}
                          >
                            {STATUS_LABELS[step] || step}
                          </p>
                          {isComplete &&
                            getTimestampForStep(step, order.timestamps) && (
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: tmpl.subtext }}
                              >
                                {formatDate(
                                  getTimestampForStep(
                                    step,
                                    order.timestamps,
                                  )!,
                                )}
                              </p>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tracking number */}
            {order.trackingNumber && (
              <div
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${subtleBorder}`,
                }}
              >
                <p className="text-xs" style={{ color: tmpl.subtext }}>
                  追蹤編號
                </p>
                <p
                  className="font-mono font-bold text-sm mt-1"
                  style={{ color: tmpl.text }}
                >
                  {order.trackingNumber}
                </p>
              </div>
            )}

            {/* Items */}
            <div
              className="rounded-2xl p-4"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${subtleBorder}`,
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: `${tmpl.text}CC` }}
              >
                訂單內容
              </p>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <span
                      className="flex-1 min-w-0 truncate"
                      style={{ color: `${tmpl.text}CC` }}
                    >
                      {item.name} × {item.qty}
                    </span>
                    <span
                      className="font-medium ml-3 flex-shrink-0"
                      style={{ color: tmpl.text }}
                    >
                      {formatPrice(
                        item.unitPrice * item.qty,
                        order.amounts.currency,
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="mt-3 pt-3 space-y-1"
                style={{ borderTop: `1px solid ${subtleBorder}` }}
              >
                <div className="flex justify-between text-sm">
                  <span style={{ color: tmpl.subtext }}>小計</span>
                  <span style={{ color: `${tmpl.text}B3` }}>
                    {formatPrice(
                      order.amounts.subtotal,
                      order.amounts.currency,
                    )}
                  </span>
                </div>
                {order.amounts.deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: tmpl.subtext }}>運費</span>
                    <span style={{ color: `${tmpl.text}B3` }}>
                      {formatPrice(
                        order.amounts.deliveryFee,
                        order.amounts.currency,
                      )}
                    </span>
                  </div>
                )}
                {order.amounts.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#4ade80" }}>優惠折扣</span>
                    <span style={{ color: "#4ade80" }}>
                      −
                      {formatPrice(
                        order.amounts.discount,
                        order.amounts.currency,
                      )}
                    </span>
                  </div>
                )}
                <div
                  className="flex justify-between pt-2"
                  style={{ borderTop: `1px solid ${subtleBorder}` }}
                >
                  <span
                    className="font-medium"
                    style={{ color: tmpl.text }}
                  >
                    合計
                  </span>
                  <span
                    className="font-bold text-lg"
                    style={{ color: tmpl.accent }}
                  >
                    {formatPrice(
                      order.amounts.total,
                      order.amounts.currency,
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery info */}
            {order.delivery.address && (
              <div
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${subtleBorder}`,
                }}
              >
                <p className="text-xs" style={{ color: tmpl.subtext }}>
                  送貨地址
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: tmpl.text }}
                >
                  {order.delivery.address}
                </p>
              </div>
            )}

            {/* Back to store */}
            <a
              href={`/${storeSlug}`}
              className="block w-full py-3.5 rounded-xl font-medium text-sm text-center transition-colors"
              style={{
                backgroundColor: `${tmpl.text}15`,
                color: `${tmpl.text}CC`,
              }}
            >
              返回商店
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function getTimestampForStep(
  step: string,
  timestamps: OrderData["timestamps"],
): string | null {
  switch (step) {
    case "PENDING":
      return timestamps.created;
    case "CONFIRMED":
      return timestamps.confirmed;
    case "PROCESSING":
      return timestamps.processing;
    case "SHIPPED":
      return timestamps.shipped;
    case "DELIVERED":
      return timestamps.delivered;
    case "COMPLETED":
      return timestamps.completed;
    default:
      return null;
  }
}
