export const ADMIN_SECRET_STORAGE_KEY = "hk_marketplace_admin_secret";

/**
 * Client-side only. Stores admin secret in sessionStorage so it is not bundled at build time.
 * This is NOT strong security; it is a risk reduction vs NEXT_PUBLIC_ secret.
 */
export function getAdminSecret(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(ADMIN_SECRET_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAdminSecret(secret: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ADMIN_SECRET_STORAGE_KEY, secret);
  } catch {
    // ignore
  }
}

export function clearAdminSecret(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(ADMIN_SECRET_STORAGE_KEY);
  } catch {
    // ignore
  }
}
