const STORAGE_KEY = "hk-wishlist";

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

export function isWishlisted(id: string): boolean {
  return getWishlist().includes(id);
}

export function toggleWishlist(id: string): boolean {
  const current = getWishlist();
  const index = current.indexOf(id);
  let newState: boolean;

  if (index === -1) {
    current.push(id);
    newState = true;
  } else {
    current.splice(index, 1);
    newState = false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent("wishlistUpdated", { detail: { id, wishlisted: newState } }));
  } catch {
    // localStorage might be full or disabled
  }

  return newState;
}
