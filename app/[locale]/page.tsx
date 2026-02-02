import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import ProductRail from "@/components/ProductRail";
import ProductCard from "@/components/ProductCard";
import CategoryGrid from "@/components/CategoryGrid";
import BrandRail from "@/components/BrandRail";
import HeroCarousel from "@/components/HeroCarousel";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = getDict(l);

  // Fetch products with category-based strategy
  // Use exclusion set to avoid duplication across rails
  const excludedIds = new Set<string>();

  // Rail 1: Recent (newest 8 products)
  const recentProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  recentProducts.forEach((p) => excludedIds.add(p.id));

  // Rail 2: For You (newest excluding recent)
  const forYouProducts = await prisma.product.findMany({
    where: {
      active: true,
      id: { notIn: Array.from(excludedIds) },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  forYouProducts.forEach((p) => excludedIds.add(p.id));

  // Rail 3: Trending (prefer category='sports', fallback to newest excluding previous)
  const trendingProducts = await prisma.product.findMany({
    where: {
      active: true,
      id: { notIn: Array.from(excludedIds) },
      category: "sports",
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // If not enough sports products, fill with newest
  if (trendingProducts.length < 8) {
    const fillCount = 8 - trendingProducts.length;
    const fillProducts = await prisma.product.findMany({
      where: {
        active: true,
        id: {
          notIn: Array.from([...excludedIds, ...trendingProducts.map((p) => p.id)]),
        },
      },
      orderBy: { createdAt: "desc" },
      take: fillCount,
    });
    trendingProducts.push(...fillProducts);
  }
  trendingProducts.forEach((p) => excludedIds.add(p.id));

  // Rail 4: New Arrivals (newest excluding all previous)
  const newArrivalsProducts = await prisma.product.findMany({
    where: {
      active: true,
      id: { notIn: Array.from(excludedIds) },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  newArrivalsProducts.forEach((p) => excludedIds.add(p.id));

  // Rail 5: Kids (shoeType: grade_school, preschool, toddler)
  const kidsProducts = await prisma.product.findMany({
    where: {
      active: true,
      id: { notIn: Array.from(excludedIds) },
      shoeType: { in: ["grade_school", "preschool", "toddler"] },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // Map products to expected format
  const mapProducts = (products: any[]) =>
    products.map((p) => ({
      id: p.id,
      brand: p.brand || "",
      title: p.title,
      price: p.price,
      stock: p.stock,
      image:
        p.imageUrl ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
      badges: Array.isArray(p.badges) ? (p.badges as any[]) : [],
      promotionBadges: [], // Not available in current schema
      sizes: p.sizes || null,
    }));

  const rail1 = mapProducts(recentProducts);
  const rail2 = mapProducts(forYouProducts);
  const rail3 = mapProducts(trendingProducts);
  const rail4 = mapProducts(newArrivalsProducts);
  const rail5 = mapProducts(kidsProducts);

  return (
    <div className="pb-[calc(96px+env(safe-area-inset-bottom))]">
      {/* 1) Hero carousel (4–5 slides) */}
      <div className="px-4 pt-4">
        <HeroCarousel
          slides={[
            {
              title: t.home.heroTitle,
              subtitle: t.home.heroSubtitle,
              cta: t.home.viewAll,
              href: `/${l}?section=featured`,
              imageUrl:
                "https://images.unsplash.com/photo-1518441902117-f0aee0b2fbd9?auto=format&fit=crop&w=1400&q=70",
            },
            {
              title: l === "zh-HK" ? "精選運動裝備" : "Sports essentials",
              subtitle: l === "zh-HK" ? "跑步／健身／球類" : "Run / gym / ball sports",
              cta: l === "zh-HK" ? "查看" : "View",
              href: `/${l}?category=sports`,
              imageUrl:
                "https://images.unsplash.com/photo-1526401485004-2fda9f6a7fdc?auto=format&fit=crop&w=1400&q=70",
            },
            {
              title: l === "zh-HK" ? "潮流配件" : "Accessories",
              subtitle: l === "zh-HK" ? "每日穿搭加分" : "Upgrade your daily fit",
              cta: l === "zh-HK" ? "查看" : "View",
              href: `/${l}?category=accessories`,
              imageUrl:
                "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1400&q=70",
            },
            {
              title: l === "zh-HK" ? "居家辦公" : "Home office",
              subtitle: l === "zh-HK" ? "桌面整理好物" : "Desk setup picks",
              cta: l === "zh-HK" ? "查看" : "View",
              href: `/${l}?category=office`,
              imageUrl:
                "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=70",
            },
            {
              title: l === "zh-HK" ? "新品上架" : "New arrivals",
              subtitle: l === "zh-HK" ? "每日更新" : "Updated daily",
              cta: l === "zh-HK" ? "查看" : "View",
              href: `/${l}?sort=new`,
              imageUrl:
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=70",
            },
          ]}
        />
      </div>

      {/* Sentinel: used to hide floating search once user scrolls past hero */}
      <div id="home-search-sentinel" className="h-px w-full" />

      {/* 2) Shop by Category (icon grid) */}
      <CategoryGrid locale={l} title={t.home.shopByCategory} />

      {/* 3) Product rails (4 rows, alternating sizes sm/lg/sm/lg) — always show all 4 */}
      <ProductRail locale={l} title={t.home.recentlyViewed} products={rail1} size="sm" />

      <ProductRail locale={l} title={t.home.forYou} products={rail2} size="lg" />

      <ProductRail locale={l} title={l === "zh-HK" ? "熱門" : "Trending"} products={rail3} size="sm" />

      <ProductRail locale={l} title={l === "zh-HK" ? "新品上架" : "New arrivals"} products={rail4} size="lg" />

      {/* 5) Kids section */}
      {rail5.length > 0 && (
        <section className="mt-8">
          <div className="px-4 flex items-center justify-between mb-3">
            <h2 className="text-zinc-900 text-lg font-semibold">
              {l === "zh-HK" ? "童裝專區" : "Kids"}
            </h2>
            <a
              href={`/${l}/products?shoeType=grade_school,preschool,toddler`}
              className="text-sm text-olive-600 hover:text-olive-700 font-medium"
            >
              {t.home.viewAll}
            </a>
          </div>
          <div className="lg:px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] snap-x snap-mandatory pl-4 pr-4 lg:grid lg:grid-cols-4 xl:grid-cols-5 lg:gap-3 lg:overflow-visible lg:pl-0 lg:pr-0">
              {rail5.map((p) => (
                <div key={p.id} className="w-[160px] shrink-0 snap-start lg:w-auto">
                  <ProductCard locale={l} p={p} />
                </div>
              ))}
              <div className="w-10 shrink-0 lg:hidden" aria-hidden="true" />
            </div>
          </div>
        </section>
      )}

      {/* 6) Popular Brands (rail + "See all") */}
      <BrandRail locale={l} title={t.home.popularBrands} seeAllText={t.home.seeAll} />
    </div>
  );
}
