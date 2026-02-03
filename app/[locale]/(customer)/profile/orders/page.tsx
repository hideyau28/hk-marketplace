"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, AlertCircle } from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  size?: string;
  imageUrl?: string;
}

interface OrderAmounts {
  subtotal: number;
  total: number;
  discount?: number;
  deliveryFee?: number;
}

interface Order {
  id: string;
  orderNumber: string | null;
  items: OrderItem[];
  amounts: OrderAmounts;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; labelEn: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "待確認", labelEn: "Pending", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
  CONFIRMED: { label: "已確認", labelEn: "Confirmed", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle },
  PROCESSING: { label: "處理中", labelEn: "Processing", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: Package },
  SHIPPED: { label: "已發貨", labelEn: "Shipped", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400", icon: Truck },
  DELIVERED: { label: "已送達", labelEn: "Delivered", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400", icon: CheckCircle },
  COMPLETED: { label: "已完成", labelEn: "Completed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  CANCELLED: { label: "已取消", labelEn: "Cancelled", color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400", icon: XCircle },
  REFUNDED: { label: "已退款", labelEn: "Refunded", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: AlertCircle },
};

const paymentStatusConfig: Record<string, { label: string; labelEn: string; color: string }> = {
  pending: { label: "待付款", labelEn: "Pending", color: "text-amber-600 dark:text-amber-400" },
  uploaded: { label: "待確認", labelEn: "Uploaded", color: "text-blue-600 dark:text-blue-400" },
  confirmed: { label: "已確認", labelEn: "Confirmed", color: "text-green-600 dark:text-green-400" },
  rejected: { label: "已拒絕", labelEn: "Rejected", color: "text-red-600 dark:text-red-400" },
};

export default function ProfileOrdersPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "zh-HK";
  const { user, loading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/login?redirect=/${locale}/profile/orders`);
    }
  }, [loading, user, router, locale]);

  // Fetch orders
  useEffect(() => {
    if (user) {
      fetch("/api/auth/orders", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            setOrders(data.data.orders);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  const t = {
    title: locale === "zh-HK" ? "訂單記錄" : "Order History",
    back: locale === "zh-HK" ? "返回" : "Back",
    noOrders: locale === "zh-HK" ? "暫無訂單" : "No orders yet",
    startShopping: locale === "zh-HK" ? "開始購物" : "Start Shopping",
    items: locale === "zh-HK" ? "件商品" : " items",
    payment: locale === "zh-HK" ? "付款" : "Payment",
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "zh-HK" ? "zh-HK" : "en-HK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => `$${Math.round(price)}`;

  if (loading || loadingOrders) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-olive-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="px-4 py-6 pb-28">
      <div className="mx-auto max-w-lg">
        {/* Back button */}
        <Link
          href={`/${locale}/profile`}
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 mb-4"
        >
          <ArrowLeft size={16} />
          {t.back}
        </Link>

        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">
          {t.title}
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Package size={32} className="text-zinc-400" />
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">{t.noOrders}</p>
            <Link
              href={`/${locale}/products`}
              className="inline-block px-6 py-2 bg-olive-600 text-white rounded-xl hover:bg-olive-700 transition-colors"
            >
              {t.startShopping}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const paymentStatus = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.pending;
              const StatusIcon = status.icon;
              const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <Link
                  key={order.id}
                  href={`/${locale}/orders/${order.id}`}
                  className="block rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  {/* Order header */}
                  <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                      <div className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {order.orderNumber || order.id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon size={12} />
                      {locale === "zh-HK" ? status.label : status.labelEn}
                    </div>
                  </div>

                  {/* Order items preview */}
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Product images */}
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-10 rounded-lg border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 overflow-hidden"
                          >
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <Package size={16} />
                              </div>
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-10 h-10 rounded-lg border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          {totalItems} {t.items}
                        </div>
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatPrice(order.amounts.total)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${paymentStatus.color}`}>
                          {t.payment}: {locale === "zh-HK" ? paymentStatus.label : paymentStatus.labelEn}
                        </span>
                        <ChevronRight size={16} className="text-zinc-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
