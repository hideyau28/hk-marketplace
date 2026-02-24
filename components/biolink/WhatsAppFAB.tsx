"use client";

import type { BioCartItem } from "@/lib/biolink-cart";

type Props = {
  whatsapp: string | null;
  cart?: BioCartItem[];
};

/**
 * 生成 WhatsApp 訊息內容
 * 有購物車商品 → 訂單清單 + 總價
 * 冇購物車 → 簡單查詢訊息
 */
function buildWhatsAppMessage(cart: BioCartItem[] | undefined): string {
  if (!cart || cart.length === 0) {
    return "你好！我想查詢商品";
  }

  // 計算總價
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // 商品清單
  const items = cart
    .map((item, index) => {
      const variantText = item.variantLabel ? ` (${item.variantLabel})` : "";
      return `${index + 1}. ${item.name}${variantText} x${item.qty} - $${(item.price * item.qty).toLocaleString()}`;
    })
    .join("\n");

  return `你好！我想落單：\n${items}\n合計：$${total.toLocaleString()}`;
}

export default function WhatsAppFAB({ whatsapp, cart }: Props) {
  if (!whatsapp) return null;

  const message = buildWhatsAppMessage(cart);
  const phone = whatsapp.replace(/[^0-9]/g, "");
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

  // Lift above CartBar (~80px) when cart has items, otherwise default offset
  const hasCartItems = cart && cart.length > 0;
  const bottomClass = hasCartItems ? "bottom-24" : "bottom-6";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed ${bottomClass} right-4 z-40 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30 hover:scale-105 active:scale-95 transition-all duration-300`}
      aria-label="WhatsApp"
    >
      <svg
        className="w-7 h-7 text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}
