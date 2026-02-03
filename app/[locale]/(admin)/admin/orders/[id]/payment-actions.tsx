"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PaymentActionsProps = {
  orderId: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentProof: string | null;
};

const PAYMENT_METHOD_NAMES: Record<string, string> = {
  fps: "FPS 轉數快",
  payme: "PayMe",
  alipay: "Alipay HK",
};

const PAYMENT_STATUS_NAMES: Record<string, string> = {
  pending: "待付款",
  uploaded: "待確認",
  confirmed: "已確認",
  rejected: "已拒絕",
};

export default function PaymentActions({ orderId, paymentMethod, paymentStatus, paymentProof }: PaymentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!confirm("確定確認收款？訂單狀態將會更新為「已付款」")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "confirmed", status: "PAID" }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(`錯誤: ${data.error?.message || "更新失敗"}`);
      }
    } catch (error) {
      alert("網絡錯誤");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("請輸入拒絕原因（可留空）");
    if (reason === null) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "rejected", note: reason || undefined }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(`錯誤: ${data.error?.message || "更新失敗"}`);
      }
    } catch (error) {
      alert("網絡錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
      <h3 className="text-lg font-semibold text-zinc-900 mb-4">付款資料 (FPS/PayMe/Alipay)</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <div className="text-sm text-zinc-500">付款方式</div>
            <div className="text-zinc-900 font-medium">
              {PAYMENT_METHOD_NAMES[paymentMethod] || paymentMethod}
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-500">付款狀態</div>
            <div className="mt-1">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                paymentStatus === "confirmed" ? "bg-green-100 text-green-700" :
                paymentStatus === "uploaded" ? "bg-yellow-100 text-yellow-700" :
                paymentStatus === "rejected" ? "bg-red-100 text-red-700" :
                "bg-zinc-100 text-zinc-600"
              }`}>
                {PAYMENT_STATUS_NAMES[paymentStatus] || paymentStatus}
              </span>
            </div>
          </div>
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

      {/* Payment Action Buttons */}
      {paymentStatus === "uploaded" && (
        <div className="mt-6 pt-4 border-t border-zinc-200">
          <div className="text-sm text-zinc-500 mb-3">確認付款</div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "處理中..." : "確認收款"}
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={loading}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              拒絕付款
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
