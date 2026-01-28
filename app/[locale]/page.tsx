import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import ProductRail from "@/components/ProductRail";
import CategoryGrid from "@/components/CategoryGrid";
import BrandRail from "@/components/BrandRail";
import HeroCarousel from "@/components/HeroCarousel";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = getDict(l);

  // Fetch products from DB
  const dbProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 40,
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

  // Product rails (mobile-first)
  const rail1 = products.slice(0, 8);
  const rail2 = products.slice(8, 16);
  const rail3 = products.slice(16, 24);
  const rail4 = products.slice(24, 32);

  return (
    <div className="pb-[calc(96px+env(safe-area-inset-bottom))]">
      {/* Sentinel for showing/hiding floating search */}
      <div id="home-search-sentinel" className="h-px w-full" />

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

      {/* 2) Shop by Category (icon grid) */}
      <CategoryGrid locale={l} title={t.home.shopByCategory} />

      {/* 3) Product rails (4 rows, alternating sizes sm/lg/sm/lg) — always show all 4 */}
      <ProductRail
        locale={l}
        title={t.home.recentlyViewed}
        products={rail1}
        size="sm"
      />

      <ProductRail
        locale={l}
        title={t.home.forYou}
        products={rail2}
        size="lg"
      />

      <ProductRail
        locale={l}
        title={l === "zh-HK" ? "熱門" : "Trending"}
        products={rail3}
        size="sm"
      />

      <ProductRail
        locale={l}
        title={l === "zh-HK" ? "新品上架" : "New arrivals"}
        products={rail4}
        size="lg"
      />

      {/* 4) Popular Brands (rail + "See all") */}
      <BrandRail
        locale={l}
        title={t.home.popularBrands}
        seeAllText={t.home.seeAll}
      />
    </div>
  );
}
