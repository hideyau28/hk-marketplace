import { notFound } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { resolveTenant } from "@/lib/tenant";
import ProductCard from "@/components/ProductCard";

type ResolvedBadge = {
  nameZh: string;
  nameEn: string;
  color: string;
};

function isCuid(value: string) {
  return value.startsWith("c") && value.length >= 25;
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params;
  const l = locale as Locale;
  const isZh = l === "zh-HK";

  const tenant = await resolveTenant();

  // Fetch category by slug + tenantId
  const category = await prisma.category.findUnique({
    where: { tenantId_slug: { tenantId: tenant.id, slug } },
    include: {
      children: {
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!category || !category.active) {
    notFound();
  }

  // Collect category IDs (self + children) for product lookup
  const categoryIds = [
    category.id,
    ...category.children.map((c: { id: string }) => c.id),
  ];

  // Fetch active products in this category or its children
  const products = await prisma.product.findMany({
    where: {
      categoryId: { in: categoryIds },
      active: true,
      tenantId: tenant.id,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      variants: { where: { active: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  // Resolve badge IDs to display names/colors
  const allBadges = await prisma.badge.findMany({ where: { tenantId: tenant.id } });
  const badgeMap = new Map(
    allBadges.map((b: { id: string; nameZh: string; nameEn: string; color: string }) => [b.id, b])
  );

  type ProductRow = (typeof products)[number];
  const productsWithBadges = products.map((product: ProductRow) => {
    const resolvedBadges: ResolvedBadge[] = [];
    if (Array.isArray(product.badges)) {
      for (const entry of product.badges) {
        if (typeof entry !== "string") continue;
        if (isCuid(entry)) {
          const badge = badgeMap.get(entry) as ResolvedBadge | undefined;
          if (badge) {
            resolvedBadges.push({ nameZh: badge.nameZh, nameEn: badge.nameEn, color: badge.color });
          }
        } else {
          resolvedBadges.push({ nameZh: entry, nameEn: entry, color: "" });
        }
      }
    }
    return { ...product, resolvedBadges };
  });

  type ProductWithBadges = (typeof productsWithBadges)[number];
  // Map to ProductCard format
  const productList = productsWithBadges.map((p: ProductWithBadges) => ({
    id: p.id,
    brand: p.brand || undefined,
    title: p.title,
    image: p.imageUrl || undefined,
    price: p.price,
    originalPrice: p.originalPrice,
    stock: p.stock ?? 0,
    resolvedBadges: p.resolvedBadges,
    promotionBadges: p.promotionBadges ?? undefined,
    sizes: (p.sizes as Record<string, number> | null) ?? undefined,
  }));

  // Find parent category for breadcrumb if this is a child category
  let parentCategory: { name: string; slug: string } | null = null;
  if (category.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: category.parentId },
      select: { name: true, slug: true },
    });
    parentCategory = parent;
  }

  return (
    <div className="px-4 py-6 pb-28">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-zinc-500 mb-4">
          <Link href={`/${locale}`} className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
            {isZh ? "主頁" : "Home"}
          </Link>
          <span>/</span>
          {parentCategory && (
            <>
              <Link
                href={`/${locale}/categories/${parentCategory.slug}`}
                className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                {parentCategory.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-zinc-900 dark:text-zinc-100 font-medium">{category.name}</span>
        </nav>

        {/* Category header */}
        {category.imageUrl ? (
          <div className="relative w-full h-40 md:h-56 rounded-xl overflow-hidden mb-6">
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <h1 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
              {category.name}
            </h1>
          </div>
        ) : (
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            {category.name}
          </h1>
        )}

        {/* Sub-categories navigation */}
        {category.children.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4">
            {category.children.map((child: { id: string; name: string; slug: string }) => (
              <Link
                key={child.id}
                href={`/${locale}/categories/${child.slug}`}
                className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "var(--tmpl-accent, #2D6A4F)",
                  color: "white",
                  opacity: 0.85,
                }}
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}

        {/* Product count */}
        <p className="text-sm text-gray-500 mb-4">
          {isZh
            ? `顯示 ${productList.length} 件產品`
            : `Showing ${productList.length} products`}
        </p>

        {/* Products grid */}
        {productList.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="text-5xl mb-4">👟</div>
            <p className="text-zinc-500">
              {isZh ? "呢個分類暫時冇產品" : "No products in this category"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {productList.map((p: (typeof productList)[number]) => (
              <ProductCard key={p.id} locale={l} p={p} fillWidth />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
