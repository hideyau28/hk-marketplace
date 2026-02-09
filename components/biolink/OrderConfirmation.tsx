"use client";

import { formatHKD } from "@/lib/biolink-helpers";

type OrderResult = {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  storeName: string;
  whatsapp: string | null;
  fpsInfo?: { accountName: string | null; id: string | null; qrCode: string | null };
  paymeInfo?: { link: string | null; qrCode: string | null };
};

type Props = {
  order: OrderResult;
  onClose: () => void;
};

export default function OrderConfirmation({ order, onClose }: Props) {
  const whatsappLink = order.whatsapp
    ? `https://wa.me/${order.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
        `Hi! 我嘅訂單 ${order.orderNumber}，已經轉帳 ${formatHKD(order.total)}，請確認。`
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-[480px] max-h-[90vh] bg-[#1a1a1a] rounded-t-3xl overflow-y-auto"
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        <div className="px-5 pt-6 pb-8">
          {/* Success header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-white text-xl font-bold">訂單已建立！</h2>
            <p className="text-white/50 text-sm mt-1">訂單編號：{order.orderNumber}</p>
          </div>

          {/* FPS Payment info */}
          {order.fpsInfo && (
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <p className="text-white text-sm font-medium text-center mb-4">
                請用 FPS 轉帳 <span className="text-[#FF9500] font-bold">{formatHKD(order.total)}</span> 到：
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
                <p className="text-center text-white/70 text-sm">
                  FPS ID: <span className="text-white font-mono font-bold">{order.fpsInfo.id}</span>
                </p>
              )}
              {order.fpsInfo.accountName && (
                <p className="text-center text-white/70 text-sm mt-1">
                  收款人: <span className="text-white font-medium">{order.fpsInfo.accountName}</span>
                </p>
              )}
            </div>
          )}

          {/* PayMe Payment info */}
          {order.paymeInfo && (
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <p className="text-white text-sm font-medium text-center mb-4">
                請用 PayMe 付款 <span className="text-[#FF9500] font-bold">{formatHKD(order.total)}</span>
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

          {/* WhatsApp contact */}
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] font-bold text-sm active:scale-[0.98] transition-transform"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.553 4.107 1.518 5.833L0 24l6.334-1.476A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6c-1.876 0-3.653-.502-5.18-1.38l-.37-.22-3.849.898.975-3.562-.242-.384A9.543 9.543 0 012.4 12c0-5.302 4.298-9.6 9.6-9.6s9.6 4.298 9.6 9.6-4.298 9.6-9.6 9.6z" />
              </svg>
              WhatsApp 聯絡店主
            </a>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="mt-4 w-full py-3.5 rounded-xl bg-white/10 text-white/80 font-medium text-sm active:scale-[0.98] transition-transform"
          >
            返回商店
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
