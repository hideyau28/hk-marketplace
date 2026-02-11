/**
 * Biolink 購物車邏輯 — localStorage 持久化
 * 每個 tenant 獨立購物車
 */

export interface BioCartItem {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  variant?: string;       // "黑色|M" 或 "M" 或 undefined
  variantLabel?: string;   // 顯示用："黑色 · M"
  variantId?: string;
  qty: number;
}

export interface BioCart {
  tenantId: string;
  items: BioCartItem[];
}

function cartKey(tenantId: string) {
  return `wowlix-cart-${tenantId}`;
}

function saveCart(cart: BioCart) {
  if (typeof window === "undefined") return;
  localStorage.setItem(cartKey(cart.tenantId), JSON.stringify(cart));
}

export function loadCart(tenantId: string): BioCart {
  if (typeof window === "undefined") return { tenantId, items: [] };
  const saved = localStorage.getItem(cartKey(tenantId));
  if (!saved) return { tenantId, items: [] };
  try {
    return JSON.parse(saved) as BioCart;
  } catch {
    return { tenantId, items: [] };
  }
}

function itemKey(item: { productId: string; variant?: string }) {
  return `${item.productId}-${item.variant || "default"}`;
}

export function addToCart(cart: BioCart, item: BioCartItem): BioCart {
  const key = itemKey(item);
  const idx = cart.items.findIndex((i) => itemKey(i) === key);
  const newItems = [...cart.items];
  if (idx >= 0) {
    newItems[idx] = { ...newItems[idx], qty: newItems[idx].qty + item.qty };
  } else {
    newItems.push({ ...item });
  }
  const updated = { ...cart, items: newItems };
  saveCart(updated);
  return updated;
}

export function removeFromCart(cart: BioCart, productId: string, variant?: string): BioCart {
  const updated = {
    ...cart,
    items: cart.items.filter(
      (i) => !(i.productId === productId && (i.variant || undefined) === (variant || undefined))
    ),
  };
  saveCart(updated);
  return updated;
}

export function updateQty(cart: BioCart, productId: string, variant: string | undefined, delta: number): BioCart {
  const newItems = cart.items
    .map((i) => {
      if (i.productId === productId && (i.variant || undefined) === (variant || undefined)) {
        const newQty = i.qty + delta;
        return newQty > 0 ? { ...i, qty: newQty } : null;
      }
      return i;
    })
    .filter(Boolean) as BioCartItem[];
  const updated = { ...cart, items: newItems };
  saveCart(updated);
  return updated;
}

export function getCartTotal(cart: BioCart): number {
  return cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function getCartCount(cart: BioCart): number {
  return cart.items.reduce((sum, i) => sum + i.qty, 0);
}

export function clearCart(tenantId: string): BioCart {
  const cart: BioCart = { tenantId, items: [] };
  saveCart(cart);
  return cart;
}
