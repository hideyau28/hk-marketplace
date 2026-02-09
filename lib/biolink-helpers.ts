/**
 * Bio Link 前台 data helpers
 * 處理 product variants / images / badges fallback logic
 */

// ─── Types ───

/** Variant from ProductVariant relation (actual schema) */
export type VariantForBioLink = {
  id: string;
  name: string;
  price: number | null;
  compareAtPrice: number | null;
  stock: number;
  active: boolean;
  imageUrl: string | null;
};

export type ProductForBioLink = {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  images: string[];
  sizes: Record<string, number> | null;
  badges: string[] | null;
  featured: boolean;
  createdAt: Date;
  // ProductVariant relation (may be included)
  variants?: VariantForBioLink[];
};

export type TenantForBioLink = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  whatsapp: string | null;
  instagram: string | null;
  brandColor: string | null;
  logoUrl: string | null;
  coverPhoto: string | null;
  template: string;
  // Payment fields
  fpsEnabled: boolean;
  fpsAccountName: string | null;
  fpsAccountId: string | null;
  fpsQrCodeUrl: string | null;
  paymeEnabled: boolean;
  paymeLink: string | null;
  paymeQrCodeUrl: string | null;
  stripeAccountId: string | null;
  stripeOnboarded: boolean;
};

// ─── Image helpers ───

export function getAllImages(product: ProductForBioLink): string[] {
  const all: string[] = [];
  if (product.imageUrl) all.push(product.imageUrl);
  if (product.images && Array.isArray(product.images)) {
    for (const url of product.images) {
      if (url && !all.includes(url)) all.push(url);
    }
  }
  return all;
}

// ─── Variant helpers ───

/**
 * Get visible variants for a product.
 * Priority: ProductVariant relation → legacy sizes JSON → null
 */
export function getVisibleVariants(
  product: ProductForBioLink
): { name: string; stock: number; price: number | null }[] | null {
  // New format: ProductVariant relation
  if (product.variants && product.variants.length > 0) {
    return product.variants
      .filter((v) => v.active && v.stock >= 0)
      .map((v) => ({ name: v.name, stock: v.stock, price: v.price }));
  }
  // Fallback: legacy sizes JSON
  if (product.sizes && typeof product.sizes === "object") {
    const entries = Object.entries(product.sizes);
    if (entries.length > 0) {
      return entries.map(([name, qty]) => ({
        name,
        stock: Number(qty),
        price: null,
      }));
    }
  }
  return null;
}

export function getVariantLabel(product: ProductForBioLink): string {
  // If has ProductVariant relation, generic label
  if (product.variants && product.variants.length > 0) return "款式";
  // If has old sizes, assume shoe sizes
  if (product.sizes && Object.keys(product.sizes).length > 0) return "尺碼";
  return "款式";
}

export function isSoldOut(product: ProductForBioLink): boolean {
  const variants = getVisibleVariants(product);
  if (!variants) return false;
  if (variants.length === 0) return false;
  return variants.every((v) => v.stock === 0);
}

export function isNew(product: ProductForBioLink): boolean {
  const now = Date.now();
  const created = new Date(product.createdAt).getTime();
  return now - created < 48 * 60 * 60 * 1000; // 48 hours
}

export function getTotalVisibleStock(
  variants: { name: string; stock: number }[]
): number {
  return variants.filter((v) => v.stock > 0).reduce((sum, v) => sum + v.stock, 0);
}

export function getLowStockCount(
  variants: { name: string; stock: number }[]
): number | null {
  const total = getTotalVisibleStock(variants);
  return total > 0 && total <= 3 ? total : null;
}

// ─── Product categorization ───

export function splitProducts(products: ProductForBioLink[]) {
  const featured = products.filter((p) => p.featured);
  const grid = products; // Grid 顯示全部（包括 featured）
  return { featured, grid };
}

// ─── Rarity mapping (for loot card glow) ───

export type Rarity = "common" | "rare" | "hot" | "legendary";

export const rarityConfig: Record<
  Rarity,
  { glow: string; color: string; label: string }
> = {
  common: { glow: "shadow-zinc-400/30", color: "#8a8a8a", label: "COMMON" },
  rare: { glow: "shadow-blue-500/40", color: "#3b82f6", label: "RARE" },
  hot: { glow: "shadow-orange-500/40", color: "#FF9500", label: "HOT" },
  legendary: { glow: "shadow-purple-500/40", color: "#a855f7", label: "LEGENDARY" },
};

export function getRarity(product: ProductForBioLink): Rarity | null {
  const badges = Array.isArray(product.badges) ? product.badges : [];
  if (badges.includes("限量")) return "legendary";
  if (badges.includes("熱賣") || badges.includes("快售罄")) return "hot";
  if (badges.includes("減價") || badges.includes("店長推介")) return "rare";
  return null;
}

export function getBadgeText(product: ProductForBioLink): string | null {
  const badges = Array.isArray(product.badges) ? product.badges : [];
  return badges[0] || null;
}

// ─── Avatar ───

export function getAvatarFallback(tenant: { name: string }): string {
  return tenant.name.charAt(0).toUpperCase();
}

// ─── Price formatting ───

export function formatHKD(price: number): string {
  return `$${price.toLocaleString("en-HK")}`;
}
