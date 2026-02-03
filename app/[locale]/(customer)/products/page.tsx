import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { Metadata } from "next";

// Disable caching to ensure filters always show fresh results
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "zh-HK" ? "所有產品 - HK•Market" : "All Products - HK•Market",
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    shoeType?: string;
    minPrice?: string;
    maxPrice?: string;
    sizes?: string;
  }>;
}) {
  const { locale } = await params;
  const { category, shoeType, minPrice, maxPrice, sizes } = await searchParams;
  const l = locale as Locale;
  const t = getDict(l);

  // Build filter
  const where: any = { active: true };

  // Category filter
  if (category) {
    const categories = category.split(",").map((c) => c.trim()).filter(Boolean);
    if (categories.length > 1) {
      where.category = { in: categories };
    } else {
      where.category = category;
    }
  }

  // ShoeType filter
  if (shoeType) {
    const types = shoeType.split(",").map((t) => t.trim()).filter(Boolean);
    if (types.length > 1) {
      where.shoeType = { in: types };
    } else {
      where.shoeType = types[0];
    }
  }

  // Price range filter
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) {
      where.price.gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      where.price.lte = parseFloat(maxPrice);
    }
  }

  // Fetch products
  let products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // Size filter (needs to be done in memory since sizes is JSON)
  if (sizes) {
    const sizeList = sizes.split(",").map((s) => s.trim()).filter(Boolean);
    if (sizeList.length > 0) {
      products = products.filter((p) => {
        if (!p.sizes || typeof p.sizes !== "object") return false;
        const productSizes = Object.keys(p.sizes as Record<string, number>);
        return sizeList.some((size) => productSizes.includes(size));
      });
    }
  }

  const productList = products.map((p) => ({
    id: p.id,
    brand: p.brand || undefined,
    title: p.title,
    image: p.imageUrl || undefined,
    price: p.price,
    originalPrice: p.originalPrice,
    stock: p.stock ?? 0,
    badges: p.badges && Array.isArray(p.badges) ? (p.badges as string[]) : undefined,
    sizes: p.sizes as Record<string, number> | null,
  }));

  // Page title
  const shoeTypeLabels: Record<string, string> = {
    adult: l === "zh-HK" ? "男裝" : "Men",
    womens: l === "zh-HK" ? "女裝" : "Women",
    grade_school: l === "zh-HK" ? "童裝" : "Kids",
    preschool: l === "zh-HK" ? "童裝" : "Kids",
    toddler: l === "zh-HK" ? "童裝" : "Kids",
  };
  const categoryLabel = category || "";
  // Handle shoeType which might be comma-separated
  let typeLabel = "";
  if (shoeType) {
    const types = shoeType.split(",");
    const firstType = types[0].trim();
    typeLabel = shoeTypeLabels[firstType] || firstType;
  }
  const pageTitle = [typeLabel, categoryLabel].filter(Boolean).join(" · ") || (l === "zh-HK" ? "所有產品" : "All Products");

  return (
    <div className="px-4 py-6 pb-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{pageTitle}</h1>
          <span className="text-sm text-zinc-500">{productList.length} {l === "zh-HK" ? "件產品" : "products"}</span>
        </div>

        {productList.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="text-5xl mb-4">👟</div>
            <p className="text-zinc-500">{l === "zh-HK" ? "冇搵到相關產品" : "No products found"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {productList.map((p) => (
              <ProductCard key={p.id} locale={l} p={p} fillWidth />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
