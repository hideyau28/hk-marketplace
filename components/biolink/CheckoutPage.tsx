"use client";

import { useState, useEffect, useCallback } from "react";
import type { BioCartItem } from "@/lib/biolink-cart";
import {
  formatPrice,
  type TenantForBioLink,
  type DeliveryOption,
} from "@/lib/biolink-helpers";

type OrderResult = {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  storeName: string;
  whatsapp: string | null;
  fpsInfo?: { accountName: string | null; id: string | null; qrCode: string | null };
  paymeInfo?: { link: string | null; qrCode: string | null };
  items?: Array<{ name: string; qty: number; unitPrice: number }>;
  customer?: { name: string; phone: string };
  delivery?: { method: string; label: string; fee: number };
  paymentMethod?: string;
  currency?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  cart: BioCartItem[];
  tenant: TenantForBioLink;
  onOrderComplete: (result: OrderResult) => void;
};

export default function CheckoutPage({ open, onClose, cart, tenant, onOrderComplete }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [delivery, setDelivery] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<"fps" | "payme" | "stripe">("fps");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = tenant.currency || "HKD";
  const enabledOptions = (tenant.deliveryOptions || []).filter((o: DeliveryOption) => o.enabled);

  // Auto-select first delivery option
  useEffect(() => {
    if (enabledOptions.length > 0 && !enabledOptions.find((o) => o.id === delivery)) {
      setDelivery(enabledOptions[0].id);
    }
  }, [enabledOptions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Available payment methods
  const availablePayments: Array<{ id: "fps" | "payme" | "stripe"; label: string; sub: string }> = [];
  if (tenant.fpsEnabled) availablePayments.push({ id: "fps", label: "FPS 轉帳", sub: "手動確認" });
  if (tenant.paymeEnabled) availablePayments.push({ id: "payme", label: "PayMe", sub: "手動確認" });
  if (tenant.stripeOnboarded && tenant.stripeAccountId) {
    availablePayments.push({ id: "stripe", label: "信用卡", sub: "Stripe" });
  }
  if (availablePayments.length === 0) {
    availablePayments.push({ id: "fps", label: "FPS 轉帳", sub: "手動確認" });
  }

  useEffect(() => {
    if (availablePayments.length > 0 && !availablePayments.find((p) => p.id === payment)) {
      setPayment(availablePayments[0].id);
    }
  }, [tenant.fpsEnabled, tenant.paymeEnabled, tenant.stripeOnboarded]); // eslint-disable-line react-hooks/exhaustive-deps

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Calculate delivery fee
  const selectedDelivery = enabledOptions.find((o) => o.id === delivery);
  let deliveryFee = selectedDelivery?.price || 0;
  const freeShippingReached =
    tenant.freeShippingThreshold != null && subtotal >= tenant.freeShippingThreshold;
  if (freeShippingReached) deliveryFee = 0;

  const total = subtotal + deliveryFee;

  const validate = useCallback(() => {
    if (name.trim().length < 2) return "請輸入姓名（最少 2 個字）";
    if (!/^\d{8}$/.test(phone.trim())) return "請輸入 8 位電話號碼";
    if (!delivery) return "請選擇送貨方式";
    return null;
  }, [name, phone, delivery]);

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/biolink/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          items: cart.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.name,
            variant: item.variant || null,
            qty: item.qty,
            price: item.price,
            image: item.image,
          })),
          customer: { name: name.trim(), phone: phone.trim(), email: email.trim() || null },
          delivery: { method: delivery },
          payment: { method: payment },
          note: note.trim() || null,
          total: subtotal,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "落單失敗，請重試");
      }

      const deliveryOpt = enabledOptions.find((d) => d.id === delivery);
      const result: OrderResult = {
        ...(json.data as OrderResult),
        items: cart.map((item) => ({
          name: item.name + (item.variant ? ` · ${item.variant.replace(/\|/g, " · ")}` : ""),
          qty: item.qty,
          unitPrice: item.price,
        })),
        customer: { name: name.trim(), phone: phone.trim() },
        delivery: { method: delivery, label: deliveryOpt?.label || delivery, fee: deliveryFee },
        paymentMethod: payment,
        currency,
      };
      onOrderComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "落單失敗，請重試");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Full panel */}
      <div
        className="relative w-full max-w-[480px] h-full bg-[#1a1a1a] overflow-y-auto"
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1a1a1a] px-5 pt-4 pb-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="text-white/60 text-sm font-medium">
              ← 返回
            </button>
            <h2 className="text-white font-bold text-base">結帳</h2>
            <div className="w-10" />
          </div>
        </div>

        <div className="px-5 pb-8">
          {/* Customer info */}
          <div className="mt-6">
            <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-3">聯絡資料</h3>
            <div className="space-y-3">
              <div>
                <label className="text-white/50 text-xs mb-1 block">姓名 *</label>
                <input
                  type="text"
                  placeholder="陳大文"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(null); }}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 text-sm border border-white/10 focus:border-[#FF9500] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">電話 *</label>
                <input
                  type="tel"
                  placeholder="9XXX XXXX"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 8)); setError(null); }}
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 text-sm border border-white/10 focus:border-[#FF9500] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1 block">Email（可選）</label>
                <input
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 text-sm border border-white/10 focus:border-[#FF9500] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Delivery options */}
          <div className="mt-6">
            <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-3">送貨方式</h3>
            <div className="space-y-2">
              {enabledOptions.map((opt) => {
                const showFree = freeShippingReached && opt.price > 0;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setDelivery(opt.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                      delivery === opt.id
                        ? "border-[#FF9500] bg-[#FF9500]/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        delivery === opt.id ? "border-[#FF9500]" : "border-white/30"
                      }`}
                    >
                      {delivery === opt.id && (
                        <div className="w-2 h-2 rounded-full bg-[#FF9500]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-white text-sm font-medium">{opt.label}</span>
                      <span className="text-white/40 text-xs ml-2">
                        {showFree ? (
                          <span className="line-through mr-1">{formatPrice(opt.price, currency)}</span>
                        ) : null}
                        {opt.price > 0 && !showFree
                          ? formatPrice(opt.price, currency)
                          : "（免運費）"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {freeShippingReached && (
              <p className="mt-2 text-sm text-green-400 font-medium">
                🎉 滿 {formatPrice(tenant.freeShippingThreshold!, currency)} 免運費！
              </p>
            )}
          </div>

          {/* Note */}
          <div className="mt-6">
            <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-3">備註（可選）</h3>
            <textarea
              placeholder="星期六下午方便 / 刻字內容 / 過敏資料..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 text-sm border border-white/10 focus:border-[#FF9500] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Payment method */}
          <div className="mt-6">
            <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-3">付款方式</h3>
            <div className="space-y-2">
              {availablePayments.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPayment(opt.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                    payment === opt.id
                      ? "border-[#FF9500] bg-[#FF9500]/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      payment === opt.id ? "border-[#FF9500]" : "border-white/30"
                    }`}
                  >
                    {payment === opt.id && (
                      <div className="w-2 h-2 rounded-full bg-[#FF9500]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-white text-sm font-medium">{opt.label}</span>
                    <span className="text-white/40 text-xs ml-2">（{opt.sub}）</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="mt-6">
            <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-3">訂單摘要</h3>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.variant || "default"}`} className="flex items-center justify-between text-sm">
                    <span className="text-white/80 flex-1 min-w-0 truncate">
                      {item.name}
                      {item.variant ? ` ${item.variant.replace(/\|/g, " · ")}` : ""}
                      {" × "}{item.qty}
                    </span>
                    <span className="text-white font-medium ml-3 flex-shrink-0">
                      {formatPrice(item.price * item.qty, currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">商品小計</span>
                  <span className="text-white/70">{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">運費</span>
                  <span className="text-white/70">
                    {deliveryFee > 0 ? formatPrice(deliveryFee, currency) : "免運費"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-white font-medium">總計</span>
                  <span className="text-[#FF9500] font-bold text-lg">
                    {formatPrice(total, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-6 w-full py-4 rounded-2xl bg-[#FF9500] text-white font-bold text-base active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
          >
            {submitting ? "處理中..." : `確認落單　${formatPrice(total, currency)}`}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export type { OrderResult };
