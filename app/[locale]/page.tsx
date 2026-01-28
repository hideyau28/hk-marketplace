import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import ProductGrid from "@/components/ProductGrid";
import CategoryGrid from "@/components/CategoryGrid";
import BrandRail from "@/components/BrandRail";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = getDict(l);

  // Fetch products from DB
  const dbProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 16,
  });

  // Map DB products to expected format
  const products = dbProducts.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    image: p.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
    shopName: "HK Marketplace",
  }));

  // Simulate different product sets for sections
  const recentlyViewed = products.slice(0, 4);
  const recommended = products.slice(4, 12);

  return (
    <div className="pb-20">
      {/* 1) Hero Banner */}
      <section className="px-4 pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 md:p-12">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {t.home.heroTitle}
            </h1>
            <p className="mt-3 text-zinc-300 text-lg max-w-md">
              {t.home.heroSubtitle}
            </p>
            <button className="mt-6 rounded-full bg-[#4a5d23] px-6 py-3 text-sm font-medium text-white hover:bg-[#3a4a1c] transition">
              {t.home.viewAll}
            </button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-zinc-900" />
          </div>
        </div>
      </section>

      {/* 2) Recently Viewed (grid) */}
      {recentlyViewed.length > 0 && (
        <ProductGrid
          locale={l}
          title={t.home.recentlyViewed}
          products={recentlyViewed}
        />
      )}

      {/* 3) Shop by Category (icon grid) */}
      <CategoryGrid locale={l} title={t.home.shopByCategory} />

      {/* 4) Recommended / For You (grid) */}
      <ProductGrid
        locale={l}
        title={t.home.forYou}
        products={recommended}
      />

      {/* 5) Popular Brands (rail + "See all") */}
      <BrandRail
        locale={l}
        title={t.home.popularBrands}
        seeAllText={t.home.seeAll}
      />
    </div>
  );
}
