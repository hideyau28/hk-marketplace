/**
 * Biolink 收藏功能 — localStorage 持久化
 * 每個 tenant (by slug) 獨立收藏
 */

function wishlistKey(slug: string) {
  return `wowlix_wishlist_${slug}`;
}

export function loadWishlist(slug: string): string[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(wishlistKey(slug));
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveWishlist(slug: string, ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(wishlistKey(slug), JSON.stringify(ids));
}

export function toggleWishlist(slug: string, productId: string): string[] {
  const current = loadWishlist(slug);
  const next = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId];
  saveWishlist(slug, next);
  return next;
}

export function isWishlisted(wishlist: string[], productId: string): boolean {
  return wishlist.includes(productId);
}
