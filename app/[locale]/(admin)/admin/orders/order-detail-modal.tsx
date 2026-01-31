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
  "PAID",
  "FULFILLING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
  "DISPUTED",
];

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
      className="ml-1 px-1.5 py-0.5 text-xs rounded border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-700"
      title="Copy to clipboard"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export function OrderDetailModal({ order, onClose, locale }: OrderDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const amounts = order.amounts as any;
  const items = order.items as any[];
  const fulfillmentAddress = order.fulfillmentAddress as any;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900">Order Details</h2>
            <div className="mt-1 text-zinc-500 text-sm font-mono">{order.id}</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-700 hover:bg-zinc-50"
          >
            Close
          </button>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-zinc-900 font-semibold mb-3">Customer Information</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Name:</span>
                <span className="text-zinc-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Phone:</span>
                <span className="text-zinc-900">{order.phone}</span>
              </div>
              {order.email && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Email:</span>
                  <span className="text-zinc-900">{order.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-zinc-900 font-semibold mb-3">Order Items</h3>
            <div className="space-y-2">
              {items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>
                    <div className="text-zinc-900">{item.name}</div>
                    <div className="text-zinc-600 text-xs">
                      {item.quantity} × {amounts?.currency || "HKD"} {item.unitPrice}
                    </div>
                  </div>
                  <div className="text-zinc-900 font-medium">
                    {amounts?.currency || "HKD"} {item.quantity * item.unitPrice}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amounts */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-zinc-900 font-semibold mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Subtotal:</span>
                <span className="text-zinc-900">
                  {amounts?.currency || "HKD"} {amounts?.subtotal || 0}
                </span>
              </div>
              {amounts?.discount && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Discount:</span>
                  <span className="text-zinc-900">
                    -{amounts?.currency || "HKD"} {amounts.discount}
                  </span>
                </div>
              )}
              {amounts?.deliveryFee && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Delivery Fee:</span>
                  <span className="text-zinc-900">
                    {amounts?.currency || "HKD"} {amounts.deliveryFee}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold">
                <span className="text-zinc-900">Total:</span>
                <span className="text-zinc-900">
                  {amounts?.currency || "HKD"} {amounts?.total || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Fulfillment */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-zinc-900 font-semibold mb-3">Fulfillment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Type:</span>
                <span className="text-zinc-900">{order.fulfillmentType}</span>
              </div>
              {order.fulfillmentType === "DELIVERY" && fulfillmentAddress && (
                <div>
                  <div className="text-zinc-600 mb-1">Address:</div>
                  <div className="text-zinc-900">
                    {fulfillmentAddress.line1}
                    {fulfillmentAddress.district && `, ${fulfillmentAddress.district}`}
                  </div>
                  {fulfillmentAddress.notes && (
                    <div className="text-zinc-600 text-xs mt-1">Note: {fulfillmentAddress.notes}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status Update */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-zinc-900 font-semibold mb-3">Update Status</h3>
            <div className="flex gap-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
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
                className="rounded-xl border border-zinc-300 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
            {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
            {success && <div className="mt-2 text-emerald-600 text-sm">Status updated successfully!</div>}
          </div>

          {/* Note */}
          {order.note && (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <h3 className="text-zinc-900 font-semibold mb-3">Order Note</h3>
              <div className="text-zinc-700 text-sm">{order.note}</div>
            </div>
          )}

          {/* Payment Attempts */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-zinc-900 font-semibold mb-3">Payment Attempts</h3>
            {order.paymentAttempts && order.paymentAttempts.length > 0 ? (
              <div className="space-y-3">
                {order.paymentAttempts.map((attempt) => (
                  <div key={attempt.id} className="rounded-xl border border-zinc-200 bg-white p-3 text-sm">
                    <div className="grid gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-600">Provider:</span>
                        <span className="text-zinc-900 font-medium">{attempt.provider}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-600">Status:</span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                            attempt.status === "SUCCEEDED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : attempt.status === "FAILED"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : attempt.status === "CANCELLED"
                              ? "bg-zinc-100 text-zinc-700 border-zinc-200"
                              : attempt.status === "REFUNDED"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
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
                          <span className="text-zinc-600">Amount:</span>
                          <span className="text-zinc-900 font-medium">
                            {attempt.currency} {(attempt.amount / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {attempt.status === "FAILED" && (
                        <>
                          {attempt.failureCode && (
                            <div className="flex justify-between">
                              <span className="text-zinc-600">Failure Code:</span>
                              <code className="text-red-700 text-xs bg-red-50 px-2 py-0.5 rounded">
                                {attempt.failureCode}
                              </code>
                            </div>
                          )}
                          {attempt.failureMessage && (
                            <div className="mt-1">
                              <span className="text-zinc-600">Failure Message:</span>
                              <div className="text-red-700 text-xs mt-1">{attempt.failureMessage}</div>
                            </div>
                          )}
                        </>
                      )}
                      <div className="border-t border-zinc-200 pt-2 mt-2 space-y-1.5">
                        <div className="text-xs text-zinc-500 font-medium">Stripe IDs</div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-600 text-xs">Session:</span>
                          {attempt.stripeCheckoutSessionId ? (
                            <div className="flex items-center">
                              <code className="text-zinc-900 text-xs bg-zinc-100 px-2 py-0.5 rounded font-mono select-all">
                                {attempt.stripeCheckoutSessionId}
                              </code>
                              <CopyButton text={attempt.stripeCheckoutSessionId} />
                            </div>
                          ) : (
                            <span className="text-zinc-400 text-xs">—</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-600 text-xs">Payment Intent:</span>
                          {attempt.stripePaymentIntentId ? (
                            <div className="flex items-center">
                              <code className="text-zinc-900 text-xs bg-zinc-100 px-2 py-0.5 rounded font-mono select-all">
                                {attempt.stripePaymentIntentId}
                              </code>
                              <CopyButton text={attempt.stripePaymentIntentId} />
                            </div>
                          ) : (
                            <span className="text-zinc-400 text-xs">—</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-600 text-xs">Charge:</span>
                          {attempt.stripeChargeId ? (
                            <div className="flex items-center">
                              <code className="text-zinc-900 text-xs bg-zinc-100 px-2 py-0.5 rounded font-mono select-all">
                                {attempt.stripeChargeId}
                              </code>
                              <CopyButton text={attempt.stripeChargeId} />
                            </div>
                          ) : (
                            <span className="text-zinc-400 text-xs">—</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-zinc-500 border-t border-zinc-200 pt-2 mt-2">
                        <span>Created: {new Date(attempt.createdAt).toLocaleString()}</span>
                        <span>Updated: {new Date(attempt.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-zinc-400 text-sm">No payment attempts recorded</div>
                {(order.stripeCheckoutSessionId || order.stripePaymentIntentId) && (
                  <div className="mt-3 pt-3 border-t border-zinc-200">
                    <div className="text-xs text-zinc-500 mb-2">Legacy Stripe IDs</div>
                    {order.stripeCheckoutSessionId && (
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-zinc-500 text-xs">Session:</span>
                        <code className="text-zinc-700 text-xs bg-zinc-100 px-2 py-0.5 rounded font-mono select-all">
                          {order.stripeCheckoutSessionId}
                        </code>
                        <CopyButton text={order.stripeCheckoutSessionId} />
                      </div>
                    )}
                    {order.stripePaymentIntentId && (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-zinc-500 text-xs">Intent:</span>
                        <code className="text-zinc-700 text-xs bg-zinc-100 px-2 py-0.5 rounded font-mono select-all">
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
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h3 className="text-zinc-900 font-semibold mb-3">Timestamps</h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Created:</span>
                <span className="text-zinc-900">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Updated:</span>
                <span className="text-zinc-900">{new Date(order.updatedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Paid:</span>
                <span className="text-zinc-900">{order.paidAt ? new Date(order.paidAt).toLocaleString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Fulfilling:</span>
                <span className="text-zinc-900">{order.fulfillingAt ? new Date(order.fulfillingAt).toLocaleString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Shipped:</span>
                <span className="text-zinc-900">{order.shippedAt ? new Date(order.shippedAt).toLocaleString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Completed:</span>
                <span className="text-zinc-900">{order.completedAt ? new Date(order.completedAt).toLocaleString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Cancelled:</span>
                <span className="text-zinc-900">{order.cancelledAt ? new Date(order.cancelledAt).toLocaleString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Refunded:</span>
                <span className="text-zinc-900">{order.refundedAt ? new Date(order.refundedAt).toLocaleString() : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Disputed:</span>
                <span className="text-zinc-900">{order.disputedAt ? new Date(order.disputedAt).toLocaleString() : "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
