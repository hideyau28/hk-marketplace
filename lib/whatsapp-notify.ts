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
  deliveryAddress?: string | null;
  currency?: string;
  languages?: string[];
};

/**
 * Build a WhatsApp URL that opens a chat with the merchant
 * with a pre-filled order notification message.
 */
export function buildMerchantNotifyUrl(
  merchantWhatsApp: string,
  order: NotifyOrderData,
): string {
  const isZh = (order.languages || ["zh-HK"]).includes("zh-HK");
  const currencySymbol = order.currency === "USD" ? "US$" : "$";

  const items = order.items
    .map(
      (i) =>
        `· ${i.name} × ${i.qty} — ${currencySymbol}${(i.unitPrice * i.qty).toLocaleString()}`,
    )
    .join("\n");

  const paymentLabel =
    order.paymentMethod === "fps"
      ? (isZh ? "FPS 轉帳" : "FPS Transfer")
      : order.paymentMethod === "payme"
        ? "PayMe"
        : (isZh ? "信用卡" : "Credit Card");

  const message = isZh
    ? `Hi! 我已落單，以下係訂單資料：

訂單：#${order.orderNumber}
姓名：${order.customer.name}
電話：${order.customer.phone}

商品：
${items}

送貨：${order.deliveryLabel}${order.deliveryAddress ? `\n送貨地址：${order.deliveryAddress}` : ""}
付款：${paymentLabel}
合計：$${order.total.toLocaleString("en-HK")}${order.paymentProofUrl ? `\n付款截圖：${order.paymentProofUrl}` : ""}`
    : `Hi! I've placed an order. Details below:

Order: #${order.orderNumber}
Name: ${order.customer.name}
Phone: ${order.customer.phone}

Items:
${items}

Delivery: ${order.deliveryLabel}${order.deliveryAddress ? `\nAddress: ${order.deliveryAddress}` : ""}
Payment: ${paymentLabel}
Total: ${currencySymbol}${order.total.toLocaleString()}${order.paymentProofUrl ? `\nPayment proof: ${order.paymentProofUrl}` : ""}`;

  const encoded = encodeURIComponent(message);
  const phone = merchantWhatsApp.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encoded}`;
}
