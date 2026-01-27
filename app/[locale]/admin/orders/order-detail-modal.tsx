"use client";

import { useState } from "react";
import type { Order, OrderStatus } from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import { updateOrderStatus } from "./actions";

type OrderDetailModalProps = {
  order: Order;
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
