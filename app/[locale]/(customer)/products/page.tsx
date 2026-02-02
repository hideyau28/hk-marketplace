import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { Metadata } from "next";

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
  searchParams: Promise<{ category?: string; shoeType?: string }>;
}) {
  const { locale } = await params;
  const { category, shoeType } = await searchParams;
  const l = locale as Locale;
  const t = getDict(l);

  // Build filter
  const where: any = { active: true };
  if (category) where.category = category;
  if (shoeType) {
    if (shoeType === "kids") {
      where.shoeType = { in: ["grade_school", "preschool", "toddler"] };
    } else {
      where.shoeType = shoeType;
    }
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const productList = products.map((p) => ({
    id: p.id,
    brand: p.brand || undefined,
    title: p.title,
    image: p.imageUrl || undefined,
    price: p.price,
    stock: (p as any).stock ?? 0,
    badges: p.badges && Array.isArray(p.badges) ? (p.badges as string[]) : undefined,
  }));

  // Page title
  const shoeTypeLabels: Record<string, string> = {
    adult: l === "zh-HK" ? "男裝" : "Men",
    womens: l === "zh-HK" ? "女裝" : "Women",
    kids: l === "zh-HK" ? "童裝" : "Kids",
  };
  const categoryLabel = category || "";
  const typeLabel = shoeType ? shoeTypeLabels[shoeType] || shoeType : "";
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {productList.map((p) => (
              <ProductCard key={p.id} locale={l} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
