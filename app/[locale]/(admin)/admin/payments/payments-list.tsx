"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { PaymentMethod } from "@prisma/client";
import type { Locale } from "@/lib/i18n";

type PaymentMethodsListProps = {
  methods: PaymentMethod[];
  locale: Locale;
};

const PAYMENT_ICONS: Record<string, string> = {
  fps: "💳",
  payme: "📱",
  alipay: "🔵",
};

export default function PaymentMethodsList({ methods, locale }: PaymentMethodsListProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for editing
  const [editAccountInfo, setEditAccountInfo] = useState("");
  const [editQrImage, setEditQrImage] = useState("");
  const [editActive, setEditActive] = useState(true);

  const startEdit = (method: PaymentMethod) => {
    setEditing(method.id);
    setEditAccountInfo(method.accountInfo || "");
    setEditQrImage(method.qrImage || "");
    setEditActive(method.active);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditAccountInfo("");
    setEditQrImage("");
    setEditActive(true);
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("只接受圖片檔案");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("檔案太大，最大 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "qr-codes");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.ok) {
        setEditQrImage(data.data.url);
      } else {
        alert(`上傳失敗: ${data.error?.message || "Unknown error"}`);
      }
    } catch (error) {
      alert("上傳失敗");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const saveEdit = async (methodId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payment-methods/${methodId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountInfo: editAccountInfo,
          qrImage: editQrImage,
          active: editActive,
        }),
      });

      if (res.ok) {
        setEditing(null);
        router.refresh();
      } else {
        const data = await res.json();
        alert(`更新失敗: ${data.error?.message || "Unknown error"}`);
      }
    } catch (error) {
      alert("更新失敗");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (method: PaymentMethod) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payment-methods/${method.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !method.active }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(`更新失敗: ${data.error?.message || "Unknown error"}`);
      }
    } catch (error) {
      alert("更新失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {methods.map((method) => (
        <div
          key={method.id}
          className="bg-white rounded-2xl border border-zinc-200 p-6"
        >
          {editing === method.id ? (
            // Edit mode
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{PAYMENT_ICONS[method.type] || "💰"}</span>
                <h3 className="text-lg font-semibold text-zinc-900">{method.name}</h3>
              </div>

              <div>
                <label className="block text-sm text-zinc-600 mb-1">帳戶資料</label>
                <input
                  type="text"
                  value={editAccountInfo}
                  onChange={(e) => setEditAccountInfo(e.target.value)}
                  placeholder="例如: FPS ID: 1234567"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-600 mb-1">QR Code 圖片</label>
                <div className="flex items-start gap-4">
                  {editQrImage && (
                    <div className="w-32 h-32 rounded-lg border border-zinc-200 overflow-hidden">
                      <img src={editQrImage} alt="QR Code" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                    >
                      {uploading ? "上傳中..." : "上傳新 QR Code"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`active-${method.id}`}
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor={`active-${method.id}`} className="text-sm text-zinc-700">
                  啟用此付款方式
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-200">
                <button
                  onClick={() => saveEdit(method.id)}
                  disabled={loading}
                  className="rounded-xl bg-olive-600 px-4 py-2 text-sm font-semibold text-white hover:bg-olive-700 disabled:opacity-50"
                >
                  {loading ? "儲存中..." : "儲存"}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={loading}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <span className="text-3xl">{PAYMENT_ICONS[method.type] || "💰"}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-zinc-900">{method.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      method.active
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}>
                      {method.active ? "啟用" : "停用"}
                    </span>
                  </div>
                  {method.accountInfo && (
                    <p className="text-sm text-zinc-600 mt-1">{method.accountInfo}</p>
                  )}
                  <p className="text-xs text-zinc-400 mt-1">Type: {method.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {method.qrImage && (
                  <div className="w-16 h-16 rounded-lg border border-zinc-200 overflow-hidden">
                    <img src={method.qrImage} alt="QR" className="w-full h-full object-contain" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => startEdit(method)}
                    className="rounded-xl border border-zinc-200 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => toggleActive(method)}
                    disabled={loading}
                    className={`rounded-xl border px-3 py-1.5 text-xs disabled:opacity-50 ${
                      method.active
                        ? "border-red-200 text-red-600 hover:bg-red-50"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {method.active ? "停用" : "啟用"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {methods.length === 0 && (
        <div className="text-center text-zinc-500 py-12">
          沒有付款方式
        </div>
      )}
    </div>
  );
}
