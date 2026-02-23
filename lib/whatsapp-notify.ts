/**
 * WhatsApp 商戶通知 — 用 URL scheme 預填訊息
 * MVP: 客人 click 按鈕 → 打開 WhatsApp 發訊息去商戶
 */

type OrderItem = {
  name: string;
  qty: number;
  unitPrice: number;
};

type NotifyOrderData = {
  orderNumber: string;
  customer: { name: string; phone: string };
  items: OrderItem[];
  deliveryLabel: string;
  paymentMethod: string;
  total: number;
  paymentProofUrl?: string | null;
};

/**
 * Build a WhatsApp URL that opens a chat with the merchant
 * with a pre-filled order notification message.
 */
export function buildMerchantNotifyUrl(
  merchantWhatsApp: string,
  order: NotifyOrderData
): string {
  const items = order.items
    .map(
      (i) =>
        `· ${i.name} × ${i.qty} — $${(i.unitPrice * i.qty).toLocaleString("en-HK")}`
    )
    .join("\n");

  const paymentLabel =
    order.paymentMethod === "fps"
      ? "FPS 轉帳"
      : order.paymentMethod === "payme"
        ? "PayMe"
        : "信用卡";

  const message = `Hi! 我已落單，以下係訂單資料：

訂單：#${order.orderNumber}
姓名：${order.customer.name}
電話：${order.customer.phone}

商品：
${items}

送貨：${order.deliveryLabel}
付款：${paymentLabel}
合計：$${order.total.toLocaleString("en-HK")}${order.paymentProofUrl ? `\n付款截圖：${order.paymentProofUrl}` : ""}`;

  const encoded = encodeURIComponent(message);
  const phone = merchantWhatsApp.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encoded}`;
}
