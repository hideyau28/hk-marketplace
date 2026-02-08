"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PaymentActionsProps = {
  orderId: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentProof: string | null;
  paymentConfirmedAt: string | null;
  paymentConfirmedBy: string | null;
};

const PAYMENT_METHOD_NAMES: Record<string, string> = {
  fps: "FPS 轉數快",
  payme: "PayMe",
  alipay: "Alipay HK",
  bank_transfer: "銀行轉帳",
};

const PAYMENT_STATUS_NAMES: Record<string, string> = {
  pending: "待付款",
  uploaded: "待確認",
  confirmed: "已確認",
  rejected: "已拒絕",
};

// 手動支付方式（非 Stripe）
function isManualPayment(method: string): boolean {
  return (
    method === "fps" ||
    method === "payme" ||
    method === "bank_transfer" ||
    method.startsWith("crypto_")
  );
}

function getPaymentMethodName(method: string): string {
  if (PAYMENT_METHOD_NAMES[method]) return PAYMENT_METHOD_NAMES[method];
  if (method.startsWith("crypto_")) {
    const coin = method.replace("crypto_", "").toUpperCase();
    return `加密貨幣 (${coin})`;
  }
  return method;
}

export default function PaymentActions({
  orderId,
  orderStatus,
  paymentMethod,
  paymentStatus,
  paymentProof,
  paymentConfirmedAt,
  paymentConfirmedBy,
}: PaymentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const manual = isManualPayment(paymentMethod);

  // Admin 確認收款 — 用新嘅 admin endpoint
  const handleAdminConfirm = async () => {
    if (!confirm("確定確認收款？訂單狀態將會更新為「已付款」")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(`錯誤: ${data.error?.message || "確認收款失敗"}`);
      }
    } catch {
      alert("網絡錯誤");
    } finally {
      setLoading(false);
    }
  };

  // 舊有嘅 reject 流程（paymentStatus uploaded → rejected）
  const handleReject = async () => {
    const reason = prompt("請輸入拒絕原因（可留空）");
    if (reason === null) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", note: reason || undefined }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(`錯誤: ${data.error?.message || "更新失敗"}`);
      }
    } catch {
      alert("網絡錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold text-zinc-900">付款資料</h3>
        {manual && (
          <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            手動支付
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <div className="text-sm text-zinc-500">付款方式</div>
            <div className="text-zinc-900 font-medium">
              {getPaymentMethodName(paymentMethod)}
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-500">付款狀態</div>
            <div className="mt-1">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  paymentStatus === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : paymentStatus === "uploaded"
                      ? "bg-yellow-100 text-yellow-700"
                      : paymentStatus === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {PAYMENT_STATUS_NAMES[paymentStatus] || paymentStatus}
              </span>
            </div>
          </div>

          {/* 已確認：顯示確認資訊 */}
          {paymentConfirmedAt && (
            <div>
              <div className="text-sm text-zinc-500">確認時間</div>
              <div className="text-zinc-900 text-sm">
                {new Date(paymentConfirmedAt).toLocaleString()}
              </div>
            </div>
          )}
          {paymentConfirmedBy && (
            <div>
              <div className="text-sm text-zinc-500">確認人</div>
              <div className="text-zinc-900 text-sm">{paymentConfirmedBy}</div>
            </div>
          )}
        </div>

        {/* Payment Proof Image */}
        {paymentProof && (
          <div>
            <div className="text-sm text-zinc-500 mb-2">付款截圖</div>
            <a href={paymentProof} target="_blank" rel="noreferrer" className="block">
              <img
                src={paymentProof}
                alt="Payment proof"
                className="max-h-64 rounded-lg border border-zinc-200 object-contain cursor-pointer hover:opacity-90"
              />
            </a>
            <div className="text-xs text-zinc-400 mt-1">點擊查看大圖</div>
          </div>
        )}
      </div>

      {/* 確認收款按鈕：manual 支付 + PENDING 狀態 */}
      {manual && orderStatus === "PENDING" && (
        <div className="mt-6 pt-4 border-t border-zinc-200">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAdminConfirm}
              disabled={loading}
              className="rounded-xl bg-green-600 px-6 py-3 text-base font-bold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "處理中..." : "確認收款"}
            </button>
            {paymentStatus === "uploaded" && (
              <button
                type="button"
                onClick={handleReject}
                disabled={loading}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                拒絕付款
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
