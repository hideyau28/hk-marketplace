"use client";

import { useState } from "react";
import type { OrderStatus } from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import { updateOrderStatus } from "../actions";

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

type OrderStatusUpdateProps = {
  order: {
    id: string;
    status: OrderStatus;
  };
  locale: Locale;
};

export default function OrderStatusUpdate({ order, locale }: OrderStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
        setSuccess(false);
      }, 2000);
    } else {
      setError(`${result.code}: ${result.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="status" className="block text-sm text-zinc-500 mb-2">
          Status
        </label>
        <select
          id="status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleUpdateStatus}
        disabled={isUpdating || selectedStatus === order.status}
        className="w-full rounded-xl bg-olive-600 py-2.5 text-white font-semibold hover:bg-olive-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isUpdating ? "Updating..." : "Update Status"}
      </button>

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-green-700 text-sm text-center font-medium">Status updated successfully!</p>
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
