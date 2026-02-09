"use client";

import { useState, useEffect, useCallback } from "react";
import { formatHKD } from "@/lib/biolink-helpers";
import type { TenantForBioLink } from "@/lib/biolink-helpers";

type CartItem = {
  id: string;
  title: string;
  price: number;
  variant: string | null;
  variantId?: string;
  qty: number;
  imageUrl: string | null;
};

const DELIVERY_OPTIONS: Array<{ id: string; label: string; note: string }> = [
  { id: "sf-locker", label: "SF 智能櫃", note: "免運費" },
  { id: "sf-cod", label: "順豐到付", note: "到付運費" },
  { id: "meetup", label: "面交", note: "地點待確認" },
];

type OrderResult = {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  storeName: string;
  whatsapp: string | null;
  fpsInfo?: { accountName: string | null; id: string | null; qrCode: string | null };
  paymeInfo?: { link: string | null; qrCode: string | null };
  // Extended fields for order confirmation display
  items?: Array<{ name: string; qty: number; unitPrice: number }>;
  customer?: { name: string; phone: string };
  delivery?: { method: string; label: string };
  paymentMethod?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  tenant: TenantForBioLink;
  onOrderComplete: (result: OrderResult) => void;
  onUpdateQty: (productId: string, variant: string | null, delta: number) => void;
  onRemoveItem: (productId: string, variant: string | null) => void;
};

export default function CheckoutPanel({ open, onClose, cart, total, tenant, onOrderComplete, onUpdateQty, onRemoveItem }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState("sf-locker");
  const [payment, setPayment] = useState<"fps" | "payme" | "stripe">("fps");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine available payment methods
  const availablePayments: Array<{ id: "fps" | "payme" | "stripe"; label: string; sub: string }> = [];
  if (tenant.fpsEnabled) availablePayments.push({ id: "fps", label: "FPS 轉帳", sub: "手動確認" });
  if (tenant.paymeEnabled) availablePayments.push({ id: "payme", label: "PayMe", sub: "手動確認" });
  if (tenant.stripeOnboarded && tenant.stripeAccountId) {
    availablePayments.push({ id: "stripe", label: "信用卡", sub: "Stripe" });
  }
  // Fallback: if no payment methods configured, show FPS as default
  if (availablePayments.length === 0) {
    availablePayments.push({ id: "fps", label: "FPS 轉帳", sub: "手動確認" });
  }

  // Auto-select first available payment
  useEffect(() => {
    if (availablePayments.length > 0 && !availablePayments.find((p) => p.id === payment)) {
      setPayment(availablePayments[0].id);
    }
  }, [tenant.fpsEnabled, tenant.paymeEnabled, tenant.stripeOnboarded]); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = useCallback(() => {
    if (name.trim().length < 2) return "請輸入姓名（最少 2 個字）";
    if (!/^\d{8}$/.test(phone.trim())) return "請輸入 8 位電話號碼";
    return null;
  }, [name, phone]);

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
            productId: item.id,
            variantId: item.variantId,
            productName: item.title,
            variant: item.variant,
            qty: item.qty,
            price: item.price,
            image: item.imageUrl,
          })),
          customer: { name: name.trim(), phone: phone.trim() },
          delivery: { method: delivery },
          payment: { method: payment },
          note: note.trim() || null,
          total,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "落單失敗，請重試");
      }

      const deliveryOpt = DELIVERY_OPTIONS.find((d) => d.id === delivery);
      const result: OrderResult = {
        ...(json.data as OrderResult),
        items: cart.map((item) => ({
          name: item.title + (item.variant ? ` · ${item.variant}` : ""),
          qty: item.qty,
          unitPrice: item.price,
        })),
        customer: { name: name.trim(), phone: phone.trim() },
        delivery: { method: delivery, label: deliveryOpt?.label || delivery },
        paymentMethod: payment,
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full max-w-[480px] max-h-[90vh] bg-[#1a1a1a] rounded-t-3xl overflow-y-auto animate-slide-up"
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1a1a1a] px-5 pt-4 pb-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="text-white/60 text-sm font-medium">
              返回
            </button>
            <h2 className="text-white font-bold text-base">
              購物車（{cart.reduce((s, i) => s + i.qty, 0)} 件）
            </h2>
            <div className="w-10" />
          </div>
        </div>

        <div className="px-5 pb-8">
          {/* Cart items */}
          <div className="mt-4 space-y-3">
            {cart.map((item) => (
              <div
                key={`${item.id}-${item.variant}`}
                className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.title}</p>
                  {item.variant && (
                    <p className="text-white/50 text-xs">{item.variant}</p>
                  )}
                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => onUpdateQty(item.id, item.variant, -1)}
                      className="w-6 h-6 rounded-full bg-white/10 text-white/70 flex items-center justify-center text-sm font-bold hover:bg-white/20 active:scale-95 transition"
                    >
                      −
                    </button>
                    <span className="text-white text-sm font-medium tabular-nums w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.variant, 1)}
                      className="w-6 h-6 rounded-full bg-white/10 text-white/70 flex items-center justify-center text-sm font-bold hover:bg-white/20 active:scale-95 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <p className="text-white text-sm font-bold">{formatHKD(item.price * item.qty)}</p>
                  <button
                    onClick={() => onRemoveItem(item.id, item.variant)}
                    className="w-6 h-6 rounded-full bg-white/10 text-white/40 flex items-center justify-center text-xs hover:bg-red-500/20 hover:text-red-400 active:scale-95 transition"
                    title="移除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Customer info */}
          <div className="mt-6">
            <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-3">聯絡資料</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="姓名"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(null); }}
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 text-sm border border-white/10 focus:border-[#FF9500] focus:outline-none transition-colors"
              />
              <input
                type="tel"
                placeholder="電話（8 位數字）"
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 8)); setError(null); }}
                inputMode="numeric"
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/30 text-sm border border-white/10 focus:border-[#FF9500] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Delivery options */}
          <div className="mt-6">
            <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-3">送貨方式</h3>
            <div className="space-y-2">
              {DELIVERY_OPTIONS.map((opt) => (
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
                    <span className="text-white/40 text-xs ml-2">{opt.note}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Order note */}
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

          {/* Error message */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Total + Submit */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm">合計</span>
              <span className="text-white text-xl font-bold">{formatHKD(total)}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-[#FF9500] text-white font-bold text-base active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
            >
              {submitting ? "處理中..." : "確認落單"}
            </button>
          </div>
        </div>
      </div>

      {/* Slide-up animation */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
