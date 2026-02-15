"use client";

import { useState, useTransition } from "react";
import type { Coupon } from "@prisma/client";
import { getDict, type Locale } from "@/lib/i18n";

type CouponModalProps = {
  coupon: Coupon | null;
  locale: string;
  onClose: () => void;
  onSaved: () => void;
};

export default function CouponModal({ coupon, locale, onClose, onSaved }: CouponModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const t = getDict(locale as Locale);

  const [code, setCode] = useState(coupon?.code || "");
  const [discountType, setDiscountType] = useState<Coupon["discountType"]>(coupon?.discountType || "PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(String(coupon?.discountValue ?? ""));
  const [minOrder, setMinOrder] = useState(coupon?.minOrder?.toString() || "");
  const [maxUsage, setMaxUsage] = useState(coupon?.maxUsage?.toString() || "");
  const [active, setActive] = useState(coupon?.active ?? true);
  const [expiresAt, setExpiresAt] = useState(
    coupon?.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const valueNum = Number(discountValue);
    if (!code.trim()) {
      setError(t.admin.coupons.codeRequired);
      return;
    }
    if (!Number.isFinite(valueNum) || valueNum < 0) {
      setError(t.admin.coupons.valueMustBePositive);
      return;
    }
    if (minOrder && (!Number.isFinite(Number(minOrder)) || Number(minOrder) < 0)) {
      setError(t.admin.coupons.minOrderMustBePositive);
      return;
    }
    if (maxUsage && (!Number.isInteger(Number(maxUsage)) || Number(maxUsage) < 1)) {
      setError(t.admin.coupons.maxUsageMustBePositive);
      return;
    }

    startTransition(async () => {
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: valueNum,
        minOrder: minOrder ? Number(minOrder) : null,
        maxUsage: maxUsage ? Number(maxUsage) : null,
        active,
        expiresAt: expiresAt || null,
      };

      const url = coupon ? `/api/admin/coupons/${coupon.id}` : "/api/admin/coupons";
      const method = coupon ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json?.error?.message || "Failed to save coupon.");
        return;
      }
      onSaved();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              {coupon ? t.admin.coupons.editCoupon : t.admin.coupons.createCoupon}
            </h2>
            <p className="mt-1 text-zinc-500 text-sm">{t.admin.coupons.configureDiscount}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-zinc-400 hover:text-zinc-600 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-zinc-700 text-sm font-medium mb-2">{t.admin.coupons.code} *</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
              placeholder="WELCOME10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-700 text-sm font-medium mb-2">{t.admin.coupons.type}</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as Coupon["discountType"])}
                disabled={isPending}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
              >
                <option value="PERCENTAGE">{t.admin.coupons.percentage}</option>
                <option value="FIXED">{t.admin.coupons.fixed}</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-700 text-sm font-medium mb-2">{t.admin.coupons.discountValue}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                disabled={isPending}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                placeholder="10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-700 text-sm font-medium mb-2">{t.admin.coupons.minOrder} (HKD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                disabled={isPending}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-zinc-700 text-sm font-medium mb-2">{t.admin.coupons.maxUsage}</label>
              <input
                type="number"
                min="1"
                step="1"
                value={maxUsage}
                onChange={(e) => setMaxUsage(e.target.value)}
                disabled={isPending}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                placeholder={t.admin.coupons.unlimited}
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-700 text-sm font-medium mb-2">{t.admin.coupons.expiresAt}</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              disabled={isPending}
              className="h-4 w-4 accent-olive-600 disabled:opacity-50"
            />
            <label htmlFor="active" className="text-zinc-700 text-sm">
              {t.admin.coupons.active}
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-200 disabled:opacity-50"
            >
              {t.admin.coupons.cancel}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-2xl bg-olive-600 px-4 py-3 text-sm text-white font-semibold hover:bg-olive-700 disabled:opacity-50"
            >
              {isPending ? t.admin.coupons.saving : t.admin.coupons.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
