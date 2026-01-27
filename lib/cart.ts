"use client";

export type CartItem = {
  productId: string;
  title: string;
  unitPrice: number;
  qty: number;
  imageUrl?: string;
};

const CART_KEY = "hk-marketplace-cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: Omit<CartItem, "qty"> & { qty?: number }): void {
  const cart = getCart();
  const existing = cart.find((x) => x.productId === item.productId);
  if (existing) {
    existing.qty += item.qty ?? 1;
  } else {
    cart.push({ ...item, qty: item.qty ?? 1 });
  }
  setCart(cart);
}

export function removeFromCart(productId: string): void {
  const cart = getCart();
  setCart(cart.filter((x) => x.productId !== productId));
}

export function updateCartItemQty(productId: string, qty: number): void {
  const cart = getCart();
  const item = cart.find((x) => x.productId === productId);
  if (item) {
    if (qty <= 0) {
      removeFromCart(productId);
    } else {
      item.qty = qty;
      setCart(cart);
    }
  }
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}
