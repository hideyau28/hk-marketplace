"use client";

import { formatPrice, type OrderConfirmConfig } from "@/lib/biolink-helpers";
import { buildMerchantNotifyUrl } from "@/lib/whatsapp-notify";
import { useTemplate } from "@/lib/template-context";

type OrderItem = {
  name: string;
  qty: number;
  unitPrice: number;
};

type OrderResult = {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  storeName: string;
  whatsapp: string | null;
  fpsInfo?: { accountName: string | null; id: string | null; qrCode: string | null };
  paymeInfo?: { link: string | null; qrCode: string | null };
  items?: OrderItem[];
  customer?: { name: string; phone: string };
  delivery?: { method: string; label: string; fee?: number; address?: string | null };
  paymentMethod?: string;
  paymentProof?: boolean;
  paymentProofUrl?: string | null;
  currency?: string;
};

type Props = {
  order: OrderResult;
  onClose: () => void;
  orderConfirmMessage?: OrderConfirmConfig;
};

export default function OrderConfirmation({ order, onClose, orderConfirmMessage }: Props) {
  const tmpl = useTemplate();
  const currency = order.currency || "HKD";
  const config = orderConfirmMessage || { thanks: "多謝訂購！", whatsappTemplate: "你好！我落咗單 #{orderNumber}" };

  // Build WhatsApp link using tenant's custom template
  const waText = config.whatsappTemplate.replace("#{orderNumber}", order.orderNumber);

  // Build WhatsApp notify URL with full order details (for merchant notification)
  const notifyUrl =
    order.whatsapp && order.items && order.customer && order.delivery
      ? buildMerchantNotifyUrl(order.whatsapp, {
          orderNumber: order.orderNumber,
          customer: order.customer,
          items: order.items,
          deliveryLabel: order.delivery.label,
          paymentMethod: order.paymentMethod || "fps",
          total: order.total,
          paymentProofUrl: order.paymentProofUrl,
        })
      : order.whatsapp
        ? `https://wa.me/${order.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(waText)}`
        : null;

  // 手動付款已上傳截圖 → 唔使再顯示收款資料
  const hasPaymentProof = !!order.paymentProof;

  const isFps = !!order.fpsInfo;
  const isPayme = !!order.paymeInfo;
  const fpsHasContent = isFps && (order.fpsInfo!.qrCode || order.fpsInfo!.id);
  const paymeHasContent = isPayme && (order.paymeInfo!.qrCode || order.paymeInfo!.link);
  const showPaymentFallback = !hasPaymentProof && ((isFps && !fpsHasContent) || (isPayme && !paymeHasContent));

  // Derived border / card colors
  const subtleBorder = `${tmpl.subtext}20`;
  const cardBg = `${tmpl.card}18`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-[480px] max-h-[90vh] rounded-t-3xl overflow-y-auto"
        style={{ backgroundColor: tmpl.bg, animation: "slideUp 0.3s ease-out" }}
      >
        <div className="px-5 pt-6 pb-8">
          {/* Success header — customizable thanks message */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold" style={{ color: tmpl.text }}>{config.thanks}</h2>
            <p className="text-sm mt-1" style={{ color: tmpl.subtext }}>訂單編號：{order.orderNumber}</p>
            <p className="text-xs mt-0.5" style={{ color: `${tmpl.subtext}99` }}>
              {hasPaymentProof ? "狀態：等待商戶確認" : "狀態：待確認付款"}
            </p>
          </div>

          {/* Order summary */}
          {order.items && order.items.length > 0 && (
            <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: cardBg, border: `1px solid ${subtleBorder}` }}>
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="flex-1 min-w-0 truncate" style={{ color: `${tmpl.text}CC` }}>
                      {item.name} × {item.qty}
                    </span>
                    <span className="font-medium ml-3 flex-shrink-0" style={{ color: tmpl.text }}>
                      {formatPrice(item.unitPrice * item.qty, currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${subtleBorder}` }}>
                {order.delivery && (
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span style={{ color: tmpl.subtext }}>送貨方式</span>
                    <span style={{ color: `${tmpl.text}B3` }}>{order.delivery.label}</span>
                  </div>
                )}
                {order.delivery?.address && (
                  <div className="flex items-start justify-between text-sm mb-1">
                    <span style={{ color: tmpl.subtext }}>送貨地址</span>
                    <span className="text-right max-w-[60%]" style={{ color: `${tmpl.text}B3` }}>
                      {order.delivery.address}
                    </span>
                  </div>
                )}
                {order.delivery?.fee != null && order.delivery.fee > 0 && (
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span style={{ color: tmpl.subtext }}>運費</span>
                    <span style={{ color: `${tmpl.text}B3` }}>{formatPrice(order.delivery.fee, currency)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: tmpl.subtext }}>合計</span>
                  <span className="font-bold text-lg" style={{ color: tmpl.accent }}>{formatPrice(order.total, currency)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Manual payment submitted — waiting for merchant */}
          {hasPaymentProof && (
            <div className="rounded-2xl p-5 mb-4 text-center" style={{ backgroundColor: cardBg, border: `1px solid ${subtleBorder}` }}>
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3" style={{ backgroundColor: `${tmpl.accent}20` }}>
                <svg className="w-5 h-5" style={{ color: tmpl.accent }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: tmpl.text }}>訂單已提交，等待商戶確認</p>
              <p className="text-xs mt-1" style={{ color: tmpl.subtext }}>商戶收到你嘅付款截圖後會確認訂單</p>
            </div>
          )}

          {/* FPS Payment info — only show if no proof uploaded */}
          {!hasPaymentProof && order.fpsInfo && fpsHasContent && (
            <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: cardBg, border: `1px solid ${subtleBorder}` }}>
              <p className="text-sm font-medium text-center mb-4" style={{ color: tmpl.text }}>
                請用 FPS 轉帳 <span className="font-bold" style={{ color: tmpl.accent }}>{formatPrice(order.total, currency)}</span> 到：
              </p>

              {order.fpsInfo.qrCode && (
                <div className="flex justify-center mb-4">
                  <div className="w-48 h-48 rounded-xl overflow-hidden bg-white p-2">
                    <img
                      src={order.fpsInfo.qrCode}
                      alt="FPS QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {order.fpsInfo.id && (
                <p className="text-center text-sm" style={{ color: `${tmpl.text}B3` }}>
                  FPS ID: <span className="font-mono font-bold" style={{ color: tmpl.text }}>{order.fpsInfo.id}</span>
                </p>
              )}
              {order.fpsInfo.accountName && (
                <p className="text-center text-sm mt-1" style={{ color: `${tmpl.text}B3` }}>
                  收款人: <span className="font-medium" style={{ color: tmpl.text }}>{order.fpsInfo.accountName}</span>
                </p>
              )}
            </div>
          )}

          {/* PayMe Payment info — only show if no proof uploaded */}
          {!hasPaymentProof && order.paymeInfo && paymeHasContent && (
            <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: cardBg, border: `1px solid ${subtleBorder}` }}>
              <p className="text-sm font-medium text-center mb-4" style={{ color: tmpl.text }}>
                請用 PayMe 付款 <span className="font-bold" style={{ color: tmpl.accent }}>{formatPrice(order.total, currency)}</span>
              </p>

              {order.paymeInfo.qrCode && (
                <div className="flex justify-center mb-4">
                  <div className="w-48 h-48 rounded-xl overflow-hidden bg-white p-2">
                    <img
                      src={order.paymeInfo.qrCode}
                      alt="PayMe QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {order.paymeInfo.link && (
                <a
                  href={order.paymeInfo.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full py-3 rounded-xl bg-[#EC1C24] text-white font-bold text-sm text-center active:scale-[0.98] transition-transform"
                >
                  打開 PayMe
                </a>
              )}
            </div>
          )}

          {/* Fallback: 冇 QR / ID / link 時顯示 WhatsApp 聯絡 */}
          {showPaymentFallback && (
            <div className="rounded-2xl p-5 mb-4 text-center" style={{ backgroundColor: cardBg, border: `1px solid ${subtleBorder}` }}>
              <p className="text-sm" style={{ color: tmpl.subtext }}>
                請 WhatsApp 聯絡店主完成付款
              </p>
            </div>
          )}

          {/* WhatsApp notify merchant — 保持 WhatsApp brand green */}
          {notifyUrl && (
            <a
              href={notifyUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-sm active:scale-[0.98] transition-transform"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.553 4.107 1.518 5.833L0 24l6.334-1.476A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6c-1.876 0-3.653-.502-5.18-1.38l-.37-.22-3.849.898.975-3.562-.242-.384A9.543 9.543 0 012.4 12c0-5.302 4.298-9.6 9.6-9.6s9.6 4.298 9.6 9.6-4.298 9.6-9.6 9.6z" />
              </svg>
              💬 WhatsApp 聯絡店主
            </a>
          )}

          {/* Continue shopping button */}
          <button
            onClick={onClose}
            className="mt-4 w-full py-3.5 rounded-xl font-medium text-sm active:scale-[0.98] transition-transform"
            style={{ backgroundColor: `${tmpl.text}15`, color: `${tmpl.text}CC` }}
          >
            🛍️ 繼續購物
          </button>
        </div>
      </div>

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
