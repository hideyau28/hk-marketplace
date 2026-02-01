"use client";

import { useState } from "react";
import type { Coupon } from "@prisma/client";
import { useRouter } from "next/navigation";
import CouponModal from "./coupon-modal";

type CouponsTableProps = {
  coupons: Coupon[];
  locale: string;
};

export default function CouponsTable({ coupons, locale }: CouponsTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Coupon | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleDelete = async (couponId: string) => {
    const res = await fetch(`/api/admin/coupons/${couponId}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      alert(json?.error?.message || "Failed to delete coupon.");
      return;
    }
    router.refresh();
  };

  return (
    <>
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="text-sm text-zinc-500">
          Showing {coupons.length} coupons
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded-xl bg-olive-600 px-4 py-3 text-sm text-white font-semibold hover:bg-olive-700"
        >
          + Create Coupon
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead>
              <tr className="text-zinc-600 border-b border-zinc-200">
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3 text-right">Min Order</th>
                <th className="px-4 py-3 text-left">Active</th>
                <th className="px-4 py-3 text-left">Expires</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                    No coupons found
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-t border-zinc-200 hover:bg-zinc-50">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-900">{coupon.code}</td>
                    <td className="px-4 py-3 text-zinc-700">{coupon.discountType}</td>
                    <td className="px-4 py-3 text-right text-zinc-900">{coupon.discountValue}</td>
                    <td className="px-4 py-3 text-right text-zinc-700">
                      {coupon.minOrder ? `HK$ ${coupon.minOrder}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${
                          coupon.active
                            ? "bg-olive-100 text-olive-700 border-olive-200"
                            : "bg-zinc-100 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        {coupon.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {new Date(coupon.createdAt).toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelected(coupon)}
                          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(selected || isCreating) && (
        <CouponModal
          coupon={selected}
          onClose={() => {
            setSelected(null);
            setIsCreating(false);
          }}
          onSaved={() => router.refresh()}
        />
      )}
    </>
  );
}
