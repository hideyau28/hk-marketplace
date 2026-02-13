"use client";

import { useState, useEffect, useCallback } from "react";
import type { BioCartItem } from "@/lib/biolink-cart";
import {
  formatPrice,
  type TenantForBioLink,
  type DeliveryOption,
} from "@/lib/biolink-helpers";
import { useTemplate } from "@/lib/template-context";

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
  const tmpl = useTemplate();
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

  // Derived colors for inputs / borders
  const inputBg = `${tmpl.card}18`; // ~10% opacity card color
  const borderColor = `${tmpl.subtext}30`;
  const subtleBorder = `${tmpl.subtext}20`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Full panel */}
      <div
        className="relative w-full max-w-[480px] h-full overflow-y-auto"
        style={{ backgroundColor: tmpl.bg, animation: "slideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-5 pt-4 pb-3" style={{ backgroundColor: tmpl.bg, borderBottom: `1px solid ${subtleBorder}` }}>
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="text-sm font-medium" style={{ color: tmpl.subtext }}>
              ← 返回
            </button>
            <h2 className="font-bold text-base" style={{ color: tmpl.text }}>結帳</h2>
            <div className="w-10" />
          </div>
        </div>

        <div className="px-5 pb-8">
          {/* Customer info */}
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: `${tmpl.text}CC` }}>聯絡資料</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: tmpl.subtext }}>姓名 *</label>
                <input
                  type="text"
                  placeholder="陳大文"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(null); }}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                  style={{ backgroundColor: inputBg, color: tmpl.text, border: `1px solid ${borderColor}` }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = tmpl.accent; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = borderColor; }}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: tmpl.subtext }}>電話 *</label>
                <input
                  type="tel"
                  placeholder="9XXX XXXX"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 8)); setError(null); }}
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                  style={{ backgroundColor: inputBg, color: tmpl.text, border: `1px solid ${borderColor}` }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = tmpl.accent; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = borderColor; }}
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: tmpl.subtext }}>Email（可選）</label>
                <input
                  type="email"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors"
                  style={{ backgroundColor: inputBg, color: tmpl.text, border: `1px solid ${borderColor}` }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = tmpl.accent; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = borderColor; }}
                />
              </div>
            </div>
          </div>

          {/* Delivery options */}
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: `${tmpl.text}CC` }}>送貨方式</h3>
            <div className="space-y-2">
              {enabledOptions.map((opt) => {
                const showFree = freeShippingReached && opt.price > 0;
                const isSelected = delivery === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setDelivery(opt.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors"
                    style={{
                      borderColor: isSelected ? tmpl.accent : borderColor,
                      backgroundColor: isSelected ? `${tmpl.accent}18` : inputBg,
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: isSelected ? tmpl.accent : `${tmpl.subtext}50` }}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tmpl.accent }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium" style={{ color: tmpl.text }}>{opt.label}</span>
                      <span className="text-xs ml-2" style={{ color: tmpl.subtext }}>
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
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: `${tmpl.text}CC` }}>備註（可選）</h3>
            <textarea
              placeholder="星期六下午方便 / 刻字內容 / 過敏資料..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-colors resize-none"
              style={{ backgroundColor: inputBg, color: tmpl.text, border: `1px solid ${borderColor}` }}
              onFocus={(e) => { e.currentTarget.style.borderColor = tmpl.accent; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = borderColor; }}
            />
          </div>

          {/* Payment method */}
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: `${tmpl.text}CC` }}>付款方式</h3>
            <div className="space-y-2">
              {availablePayments.map((opt) => {
                const isSelected = payment === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setPayment(opt.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors"
                    style={{
                      borderColor: isSelected ? tmpl.accent : borderColor,
                      backgroundColor: isSelected ? `${tmpl.accent}18` : inputBg,
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: isSelected ? tmpl.accent : `${tmpl.subtext}50` }}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tmpl.accent }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium" style={{ color: tmpl.text }}>{opt.label}</span>
                      <span className="text-xs ml-2" style={{ color: tmpl.subtext }}>（{opt.sub}）</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order summary */}
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: `${tmpl.text}CC` }}>訂單摘要</h3>
            <div className="rounded-2xl p-4" style={{ backgroundColor: inputBg, border: `1px solid ${subtleBorder}` }}>
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.variant || "default"}`} className="flex items-center justify-between text-sm">
                    <span className="flex-1 min-w-0 truncate" style={{ color: `${tmpl.text}CC` }}>
                      {item.name}
                      {item.variant ? ` ${item.variant.replace(/\|/g, " · ")}` : ""}
                      {" × "}{item.qty}
                    </span>
                    <span className="font-medium ml-3 flex-shrink-0" style={{ color: tmpl.text }}>
                      {formatPrice(item.price * item.qty, currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 space-y-1" style={{ borderTop: `1px solid ${subtleBorder}` }}>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: tmpl.subtext }}>商品小計</span>
                  <span style={{ color: `${tmpl.text}B3` }}>{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: tmpl.subtext }}>運費</span>
                  <span style={{ color: `${tmpl.text}B3` }}>
                    {deliveryFee > 0 ? formatPrice(deliveryFee, currency) : "免運費"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${subtleBorder}` }}>
                  <span className="font-medium" style={{ color: tmpl.text }}>總計</span>
                  <span className="font-bold text-lg" style={{ color: tmpl.accent }}>
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
            className="mt-6 w-full py-4 rounded-2xl text-white font-bold text-base active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
            style={{ backgroundColor: tmpl.accent }}
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
