"use client";

import { useState } from "react";
import type { OrderStatus } from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import { updateOrderStatus, type OrderWithPayments } from "./actions";

type OrderDetailModalProps = {
  order: OrderWithPayments;
  onClose: () => void;
  locale: Locale;
};

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PENDING_CONFIRMATION",
  "PAID",
  "PAYMENT_REJECTED",
  "FULFILLING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
  "DISPUTED",
];

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  fps: "FPS 轉數快",
  payme: "PayMe",
  alipay: "Alipay HK",
  bank_transfer: "銀行轉帳",
  crypto: "加密貨幣",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-1 px-1.5 py-0.5 text-xs rounded border border-wlx-mist bg-white hover:bg-wlx-cream text-wlx-stone hover:text-wlx-stone"
      title="Copy to clipboard"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function PaymentProofImage({ url }: { url: string }) {
  const [enlarged, setEnlarged] = useState(false);

  return (
    <>
      <div
        className="relative cursor-zoom-in rounded-xl overflow-hidden border border-wlx-mist bg-wlx-cream"
        onClick={() => setEnlarged(true)}
        title="點擊放大檢視"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="付款截圖"
          className="w-full max-h-48 object-contain"
        />
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
          點擊放大
        </div>
      </div>

      {/* Lightbox */}
      {enlarged && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setEnlarged(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="付款截圖"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setEnlarged(false)}
              className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white text-wlx-stone shadow-lg hover:bg-wlx-cream text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function OrderDetailModal({ order, onClose, locale }: OrderDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const amounts = order.amounts as any;
  const items = order.items as any[];
  const fulfillmentAddress = order.fulfillmentAddress as any;

  const currency = amounts?.currency || "HKD";
  const total = amounts?.total || 0;

  const isPendingConfirmation = order.status === "PENDING_CONFIRMATION";
  const hasPaymentProof = !!(order as any).paymentProof;
  const paymentMethod = (order as any).paymentMethod as string | null | undefined;

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status) {
      return;
    }

    setIsUpdating(true);
    setError("");
    setSuccess(false);

    const result = await updateOrderStatus(order.id, selectedStatus, locale);

    setIsUpdating(false);

    if (result.ok) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setError(`${result.code}: ${result.message}`);
    }
  };

  const handleConfirmPayment = async () => {
    setShowConfirmDialog(false);
    setIsConfirming(true);
    setError("");

    const result = await updateOrderStatus(order.id, "PAID", locale);

    setIsConfirming(false);

    if (result.ok) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setError(`${result.code}: ${result.message}`);
    }
  };

  const handleRejectPayment = async () => {
    setIsRejecting(true);
    setError("");

    const result = await updateOrderStatus(order.id, "PAYMENT_REJECTED", locale);

    setIsRejecting(false);

    if (result.ok) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setError(`${result.code}: ${result.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-wlx-mist bg-white p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-wlx-ink">Order Details</h2>
            <div className="mt-1 text-wlx-stone text-sm font-mono">{order.id}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-wlx-mist bg-white px-3 py-2 text-wlx-stone hover:bg-wlx-cream"
          >
            Close
          </button>
        </div>

        <div className="space-y-6">

          {/* Payment Confirmation Section — shown when PENDING_CONFIRMATION */}
          {isPendingConfirmation && (
            <div className="rounded-2xl border-2 border-orange-300 bg-wlx-cream p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚠️</span>
                <h3 className="text-wlx-ink font-semibold">待確認收款</h3>
                <span className="ml-auto text-xl font-bold text-wlx-ink">
                  ${total}
                </span>
              </div>

              {/* Payment method */}
              {paymentMethod && (
                <div className="mb-3 text-sm text-wlx-stone">
                  收款方式：<span className="font-semibold text-wlx-ink">
                    {PAYMENT_METHOD_LABEL[paymentMethod] ?? paymentMethod}
                  </span>
                </div>
              )}

              {/* Payment proof image */}
              {hasPaymentProof && (
                <div className="mb-4">
                  <div className="text-sm text-wlx-stone mb-2">付款截圖：</div>
                  <PaymentProofImage url={(order as any).paymentProof} />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={isConfirming || isRejecting}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isConfirming ? "確認中..." : "✓ 確認收款"}
                </button>
                <button
                  onClick={handleRejectPayment}
                  disabled={isConfirming || isRejecting}
                  className="flex-1 rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRejecting ? "處理中..." : "✕ 拒絕"}
                </button>
              </div>

              {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
              {success && <div className="mt-2 text-emerald-600 text-sm">已更新！</div>}
            </div>
          )}

          {/* Payment proof display for non-PENDING_CONFIRMATION orders with proof */}
          {!isPendingConfirmation && hasPaymentProof && (
            <div className="rounded-2xl border border-wlx-mist bg-wlx-cream p-4">
              <h3 className="text-wlx-ink font-semibold mb-3">付款截圖</h3>
              {paymentMethod && (
                <div className="mb-2 text-sm text-wlx-stone">
                  收款方式：<span className="font-semibold">
                    {PAYMENT_METHOD_LABEL[paymentMethod] ?? paymentMethod}
                  </span>
                </div>
              )}
              <PaymentProofImage url={(order as any).paymentProof} />
            </div>
          )}

          {/* Customer Info */}
          <div className="rounded-2xl border border-wlx-mist bg-wlx-cream p-4">
            <h3 className="text-wlx-ink font-semibold mb-3">Customer Information</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-wlx-stone">Name:</span>
                <span className="text-wlx-ink">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wlx-stone">Phone:</span>
                <span className="text-wlx-ink">{order.phone}</span>
              </div>
              {order.email && (
                <div className="flex justify-between">
                  <span className="text-wlx-stone">Email:</span>
                  <span className="text-wlx-ink">{order.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-2xl border border-wlx-mist bg-wlx-cream p-4">
            <h3 className="text-wlx-ink font-semibold mb-3">Order Items</h3>
            <div className="space-y-2">
              {items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>
                    <div className="text-wlx-ink">{item.name}</div>
                    <div className="text-wlx-stone text-xs">
                      {item.quantity} × {currency} {item.unitPrice}
                    </div>
                  </div>
                  <div className="text-wlx-ink font-medium">
                    {currency} {item.quantity * item.unitPrice}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amounts */}
          <div className="rounded-2xl border border-wlx-mist bg-wlx-cream p-4">
            <h3 className="text-wlx-ink font-semibold mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-wlx-stone">Subtotal:</span>
                <span className="text-wlx-ink">
                  ${amounts?.subtotal || 0}
                </span>
              </div>
              {amounts?.discount && (
                <div className="flex justify-between">
                  <span className="text-wlx-stone">Discount:</span>
                  <span className="text-wlx-ink">
                    -${amounts.discount}
                  </span>
                </div>
              )}
              {amounts?.deliveryFee && (
                <div className="flex justify-between">
                  <span className="text-wlx-stone">Delivery Fee:</span>
                  <span className="text-wlx-ink">
                    ${amounts.deliveryFee}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-wlx-mist pt-2 font-semibold">
                <span className="text-wlx-ink">Total:</span>
                <span className="text-wlx-ink">
                  ${total}
                </span>
              </div>
            </div>
          </div>

          {/* Fulfillment */}
          <div className="rounded-2xl border border-wlx-mist bg-wlx-cream p-4">
            <h3 className="text-wlx-ink font-semibold mb-3">
              {locale === "zh-HK" ? "取貨方式" : "Fulfillment"}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-wlx-stone">
                  {locale === "zh-HK" ? "方式" : "Type"}:
                </span>
                <span className="text-wlx-ink">
                  {order.fulfillmentType === "DELIVERY"
                    ? locale === "zh-HK" ? "送貨" : "Delivery"
                    : locale === "zh-HK" ? "面交" : "Meetup / Pickup"}
                </span>
              </div>
              {order.fulfillmentType === "DELIVERY" && fulfillmentAddress && (
                <div>
                  <div className="text-wlx-stone mb-1">
                    {locale === "zh-HK" ? "送貨地址" : "Address"}:
                  </div>
                  <div className="text-wlx-ink">
                    {fulfillmentAddress.line1}
                    {fulfillmentAddress.district && `, ${fulfillmentAddress.district}`}
                  </div>
                  {fulfillmentAddress.notes && (
                    <div className="text-wlx-stone text-xs mt-1">
                      {locale === "zh-HK" ? "備註" : "Note"}: {fulfillmentAddress.notes}
                    </div>
                  )}
                </div>
              )}
              {order.fulfillmentType === "PICKUP" && (
                <div className="text-wlx-stone text-xs">
                  {locale === "zh-HK" ? "請聯絡賣家安排面交詳情" : "Contact seller to arrange meetup details"}
                </div>
              )}
            </div>
          </div>

          {/* Status Update */}
          <div className="rounded-2xl border border-wlx-mist bg-wlx-cream p-4">
            <h3 className="text-wlx-ink font-semibold mb-3">Update Status</h3>
            <div className="flex gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="flex-1 rounded-xl border border-wlx-mist bg-white px-3 py-2 text-sm text-wlx-ink focus:outline-none focus:ring-2 focus:ring-zinc-300"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating || selectedStatus === order.status}
                className="rounded-xl border border-wlx-mist bg-wlx-ink px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
            {!isPendingConfirmation && error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
            {!isPendingConfirmation && success && <div className="mt-2 text-emerald-600 text-sm">Status updated successfully!</div>}
          </div>

          {/* Note */}
          {order.note && (
            <div className="rounded-2xl border border-wlx-mist bg-wlx-cream p-4">
              <h3 className="text-wlx-ink font-semibold mb-3">Order Note</h3>
              <div className="text-wlx-stone text-sm">{order.note}</div>
            </div>
          )}

          {/* Payment Attempts */}
          <div className="rounded-2xl border border-wlx-mist bg-wlx-cream p-4">
            <h3 className="text-wlx-ink font-semibold mb-3">Payment Attempts</h3>
            {order.paymentAttempts && order.paymentAttempts.length > 0 ? (
              <div className="space-y-3">
                {order.paymentAttempts.map((attempt) => (
                  <div key={attempt.id} className="rounded-xl border border-wlx-mist bg-white p-3 text-sm">
                    <div className="grid gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-wlx-stone">Provider:</span>
                        <span className="text-wlx-ink font-medium">{attempt.provider}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-wlx-stone">Status:</span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                            attempt.status === "SUCCEEDED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : attempt.status === "FAILED"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : attempt.status === "CANCELLED"
                              ? "bg-wlx-cream text-wlx-stone border-wlx-mist"
                              : attempt.status === "REFUNDED"
                              ? "bg-wlx-cream text-amber-700 border-amber-200"
                              : attempt.status === "DISPUTED"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {attempt.status}
                        </span>
                      </div>
                      {attempt.amount && attempt.currency && (
                        <div className="flex justify-between">
                          <span className="text-wlx-stone">Amount:</span>
                          <span className="text-wlx-ink font-medium">
                            ${(attempt.amount / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {attempt.status === "FAILED" && (
                        <>
                          {attempt.failureCode && (
                            <div className="flex justify-between">
                              <span className="text-wlx-stone">Failure Code:</span>
                              <code className="text-red-700 text-xs bg-red-50 px-2 py-0.5 rounded">
                                {attempt.failureCode}
                              </code>
                            </div>
                          )}
                          {attempt.failureMessage && (
                            <div className="mt-1">
                              <span className="text-wlx-stone">Failure Message:</span>
                              <div className="text-red-700 text-xs mt-1">{attempt.failureMessage}</div>
                            </div>
                          )}
                        </>
                      )}
                      <div className="border-t border-wlx-mist pt-2 mt-2 space-y-1.5">
                        <div className="text-xs text-wlx-stone font-medium">Stripe IDs</div>
                        <div className="flex items-center justify-between">
                          <span className="text-wlx-stone text-xs">Session:</span>
                          {attempt.stripeCheckoutSessionId ? (
                            <div className="flex items-center">
                              <code className="text-wlx-ink text-xs bg-wlx-cream px-2 py-0.5 rounded font-mono select-all">
                                {attempt.stripeCheckoutSessionId}
                              </code>
                              <CopyButton text={attempt.stripeCheckoutSessionId} />
                            </div>
                          ) : (
                            <span className="text-wlx-stone text-xs">—</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-wlx-stone text-xs">Payment Intent:</span>
                          {attempt.stripePaymentIntentId ? (
                            <div className="flex items-center">
                              <code className="text-wlx-ink text-xs bg-wlx-cream px-2 py-0.5 rounded font-mono select-all">
                                {attempt.stripePaymentIntentId}
                              </code>
                              <CopyButton text={attempt.stripePaymentIntentId} />
                            </div>
                          ) : (
                            <span className="text-wlx-stone text-xs">—</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-wlx-stone text-xs">Charge:</span>
                          {attempt.stripeChargeId ? (
                            <div className="flex items-center">
                              <code className="text-wlx-ink text-xs bg-wlx-cream px-2 py-0.5 rounded font-mono select-all">
                                {attempt.stripeChargeId}
                              </code>
                              <CopyButton text={attempt.stripeChargeId} />
                            </div>
                          ) : (
                            <span className="text-wlx-stone text-xs">—</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-wlx-stone border-t border-wlx-mist pt-2 mt-2">
                        <span>Created: {new Date(attempt.createdAt).toLocaleString()}</span>
                        <span>Updated: {new Date(attempt.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-wlx-stone text-sm">No payment attempts recorded</div>
                {(order.stripeCheckoutSessionId || order.stripePaymentIntentId) && (
                  <div className="mt-3 pt-3 border-t border-wlx-mist">
                    <div className="text-xs text-wlx-stone mb-2">Legacy Stripe IDs</div>
                    {order.stripeCheckoutSessionId && (
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-wlx-stone text-xs">Session:</span>
                        <code className="text-wlx-stone text-xs bg-wlx-cream px-2 py-0.5 rounded font-mono select-all">
                          {order.stripeCheckoutSessionId}
                        </code>
                        <CopyButton text={order.stripeCheckoutSessionId} />
                      </div>
                    )}
                    {order.stripePaymentIntentId && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-wlx-stone text-xs">Intent:</span>
                        <code className="text-wlx-stone text-xs bg-wlx-cream px-2 py-0.5 rounded font-mono select-all">
                          {order.stripePaymentIntentId}
                        </code>
                        <CopyButton text={order.stripePaymentIntentId} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="rounded-2xl border border-wlx-mist bg-wlx-cream p-4">
            <h3 className="text-wlx-ink font-semibold mb-3">Timestamps</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-wlx-stone">Created:</span>
                <span className="text-wlx-ink">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wlx-stone">Updated:</span>
                <span className="text-wlx-ink">{new Date(order.updatedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wlx-stone">Paid:</span>
                <span className="text-wlx-ink">{order.paidAt ? new Date(order.paidAt).toLocaleString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wlx-stone">Fulfilling:</span>
                <span className="text-wlx-ink">{order.fulfillingAt ? new Date(order.fulfillingAt).toLocaleString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wlx-stone">Shipped:</span>
                <span className="text-wlx-ink">{order.shippedAt ? new Date(order.shippedAt).toLocaleString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wlx-stone">Completed:</span>
                <span className="text-wlx-ink">{order.completedAt ? new Date(order.completedAt).toLocaleString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wlx-stone">Cancelled:</span>
                <span className="text-wlx-ink">{order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wlx-stone">Refunded:</span>
                <span className="text-wlx-ink">{order.refundedAt ? new Date(order.refundedAt).toLocaleString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-wlx-stone">Disputed:</span>
                <span className="text-wlx-ink">{order.disputedAt ? new Date(order.disputedAt).toLocaleString() : "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Payment Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-wlx-ink mb-2">確認收款</h3>
            <p className="text-wlx-stone text-sm mb-6">
              確認已收到{" "}
              <span className="font-bold text-wlx-ink">
                ${total}
              </span>
              ？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 rounded-xl border border-wlx-mist px-4 py-2.5 text-sm font-medium text-wlx-stone hover:bg-wlx-cream"
              >
                取消
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                確認收款
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
