"use client";

import { useState } from "react";
import type { Coupon } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Ticket } from "lucide-react";
import CouponModal from "./coupon-modal";
import { getDict, type Locale } from "@/lib/i18n";

type CouponsTableProps = {
  coupons: Coupon[];
  locale: string;
};

export default function CouponsTable({ coupons, locale }: CouponsTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Coupon | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const t = getDict(locale as Locale);
  const isZh = locale === "zh-HK";

  const handleDelete = async (couponId: string) => {
    if (!confirm(t.admin.coupons.deleteConfirm)) return;
    const res = await fetch(`/api/admin/coupons/${couponId}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      alert(json?.error?.message || "Failed to delete coupon.");
      return;
    }
    router.refresh();
  };

  if (coupons.length === 0) {
    return (
      <>
        <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-wlx-mist bg-white px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-olive-50">
            <Ticket size={32} className="text-olive-600" />
          </div>
          <h3 className="text-lg font-semibold text-wlx-ink">
            {isZh ? "未有優惠券" : "No coupons yet"}
          </h3>
          <p className="mt-2 max-w-sm text-sm text-wlx-stone">
            {isZh
              ? "建立優惠券吸引客人消費，提升銷售額。"
              : "Create coupons to attract customers and boost sales."}
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-6 rounded-xl bg-olive-600 px-6 py-3 text-sm font-semibold text-white hover:bg-olive-700 transition-colors"
          >
            + {t.admin.coupons.createCoupon}
          </button>
        </div>

        {isCreating && (
          <CouponModal
            coupon={null}
            locale={locale}
            onClose={() => setIsCreating(false)}
            onSaved={() => router.refresh()}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="text-sm text-wlx-stone">
          {t.admin.coupons.showing} {coupons.length} {t.admin.coupons.couponsCount}
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded-xl bg-olive-600 px-4 py-3 text-sm text-white font-semibold hover:bg-olive-700"
        >
          + {t.admin.coupons.createCoupon}
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-wlx-mist bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-sm">
            <thead>
              <tr className="text-wlx-stone border-b border-wlx-mist">
                <th className="px-4 py-3 text-left">{t.admin.coupons.code}</th>
                <th className="px-4 py-3 text-left">{t.admin.coupons.type}</th>
                <th className="px-4 py-3 text-right">{t.admin.coupons.value}</th>
                <th className="px-4 py-3 text-right">{t.admin.coupons.minOrder}</th>
                <th className="px-4 py-3 text-center">{t.admin.coupons.usage}</th>
                <th className="px-4 py-3 text-left">{t.admin.coupons.active}</th>
                <th className="px-4 py-3 text-left">{t.admin.coupons.expiresAt}</th>
                <th className="px-4 py-3 text-left">{t.admin.coupons.created}</th>
                <th className="px-4 py-3 text-right">{t.admin.coupons.actions}</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                  const isExpired = coupon.expiresAt ? new Date(coupon.expiresAt).getTime() < Date.now() : false;
                  const isUsedUp = coupon.maxUsage !== null && coupon.usageCount >= coupon.maxUsage;
                  return (
                    <tr key={coupon.id} className="border-t border-wlx-mist hover:bg-wlx-cream">
                      <td className="px-4 py-3 font-mono text-xs text-wlx-ink">{coupon.code}</td>
                      <td className="px-4 py-3 text-wlx-stone">
                        {coupon.discountType === "PERCENTAGE" ? t.admin.coupons.percentage : t.admin.coupons.fixed}
                      </td>
                      <td className="px-4 py-3 text-right text-wlx-ink">
                        {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                      </td>
                      <td className="px-4 py-3 text-right text-wlx-stone">
                        {coupon.minOrder ? `$${coupon.minOrder}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-wlx-stone">
                        <span className={isUsedUp ? "text-red-600 font-medium" : ""}>
                          {coupon.usageCount}
                        </span>
                        {" / "}
                        {coupon.maxUsage !== null ? coupon.maxUsage : t.admin.coupons.unlimited}
                      </td>
                      <td className="px-4 py-3">
                        {isExpired ? (
                          <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs bg-red-50 text-red-600 border-red-200">
                            {t.admin.coupons.expired}
                          </span>
                        ) : isUsedUp ? (
                          <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs bg-wlx-cream text-orange-600 border-orange-200">
                            {t.admin.coupons.usedUp}
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${
                              coupon.active
                                ? "bg-olive-100 text-olive-700 border-olive-200"
                                : "bg-wlx-cream text-wlx-stone border-wlx-mist"
                            }`}
                          >
                            {coupon.active ? t.admin.coupons.active : t.admin.coupons.inactive}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-wlx-stone">
                        {coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : "—"}
                      </td>
                      <td className="px-4 py-3 text-wlx-stone text-xs">
                        {new Date(coupon.createdAt).toISOString().slice(0, 10)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelected(coupon)}
                            className="rounded-xl border border-wlx-mist bg-white px-3 py-2 text-xs text-wlx-stone hover:bg-wlx-cream"
                          >
                            {t.admin.coupons.edit}
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100"
                          >
                            {t.admin.coupons.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {(selected || isCreating) && (
        <CouponModal
          coupon={selected}
          locale={locale}
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
