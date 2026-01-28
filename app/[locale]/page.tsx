import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import ProductRail from "@/components/ProductRail";
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
    brand: p.brand || "",
    title: p.title,
    price: p.price,
    image: p.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
    badges: Array.isArray(p.badges) ? (p.badges as any[]) : [],
  }));

  // Simulate different product sets for sections
  const recentlyViewed = products.slice(0, 8);
  const recommended = products.slice(8, 16);

  return (
    <div className="pb-20">
      {/* Sentinel for showing/hiding floating search */}
      <div id="home-search-sentinel" className="h-px w-full" />

      {/* 1) Hero Banner */}
      <section className="px-4 pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 px-6 py-7 md:p-12 max-h-[240px]">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {t.home.heroTitle}
            </h1>
            <p className="mt-2 text-zinc-300 text-base md:text-lg max-w-md">
              {t.home.heroSubtitle}
            </p>
            <button className="mt-5 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--primary-dark)] transition">
              {t.home.viewAll}
            </button>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2 opacity-15">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-zinc-900" />
          </div>
        </div>
      </section>

      {/* 2) Recently Viewed (grid) */}
      {recentlyViewed.length > 0 && (
        <ProductRail
          locale={l}
          title={t.home.recentlyViewed}
          products={recentlyViewed}
        />
      )}

      {/* 3) Shop by Category (icon grid) */}
      <CategoryGrid locale={l} title={t.home.shopByCategory} />

      {/* 4) Recommended / For You (grid) */}
      <ProductRail
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
