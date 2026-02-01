import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import HeroCarousel from "@/components/HeroCarousel";
import RecommendedGrid from "@/components/home/RecommendedGrid";
import FeaturedSneakers from "@/components/home/FeaturedSneakers";
import PromoBannerFull from "@/components/home/PromoBannerFull";
import SportsApparel from "@/components/home/SportsApparel";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "HK•Market - Sports Gear for Hong Kong",
    description: "Shop the latest sports apparel and gear from Nike, Adidas, Puma and more.",
    openGraph: {
      title: "HK•Market - Sports Gear for Hong Kong",
      description: "Shop the latest sports apparel and gear from Nike, Adidas, Puma and more.",
      type: "website",
      locale: locale === "zh-HK" ? "zh_HK" : "en_US",
    },
  };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = getDict(l);

  // Fetch all active products
  const allProductsRaw = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  // Map products to expected format
  const allProducts = allProductsRaw.map((p) => ({
    id: p.id,
    brand: p.brand || "",
    title: p.title,
    price: p.price,
    category: (p as any).category || "",
    image:
      p.imageUrl ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
  }));

  // Randomized products for Recommended section (6 products)
  const recommendedProducts = shuffleArray(allProducts).slice(0, 6);

  // Featured Sneakers: category = "Shoes" (8 products)
  const shoesProducts = allProducts.filter((p) => p.category === "Shoes").slice(0, 8);

  // Sports Apparel: category IN ("Tops", "Pants", "Jackets") (10 products)
  const apparelProducts = allProducts
    .filter((p) => ["Tops", "Pants", "Jackets"].includes(p.category))
    .slice(0, 10);

  // Fallback for Recently Viewed / You Might Like (8 products)
  const fallbackProducts = shuffleArray(allProducts).slice(0, 8);

  return (
    <div className="pb-[calc(96px+env(safe-area-inset-bottom))]">
      {/* 1) Hero Banner */}
      <div className="px-4 pt-4">
        <HeroCarousel
          slides={[
            {
              title: t.home.hero1Title,
              subtitle: t.home.hero1Subtitle,
              cta: t.home.hero1Cta,
              href: `/${l}`,
              imageUrl:
                "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=70",
            },
            {
              title: t.home.hero2Title,
              subtitle: t.home.hero2Subtitle,
              cta: t.home.hero2Cta,
              href: `/${l}?category=Shoes`,
              imageUrl:
                "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1400&q=70",
            },
            {
              title: t.home.hero3Title,
              subtitle: t.home.hero3Subtitle,
              cta: t.home.hero3Cta,
              href: `/${l}?category=Tops`,
              imageUrl:
                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=70",
            },
          ]}
        />
      </div>

      {/* Sentinel: used for floating search pill (if needed) */}
      <div id="home-search-sentinel" className="h-px w-full" />

      {/* 2) 為你推薦 Recommended (2-column grid) */}
      <RecommendedGrid
        locale={l}
        products={recommendedProducts}
        title={t.home.recommended}
        viewAllText={t.home.viewAll}
      />

      {/* 3) 精選鞋款 Featured Sneakers (large horizontal scroll) */}
      <FeaturedSneakers
        locale={l}
        products={shoesProducts}
        title={t.home.featuredSneakers}
        viewAllText={t.home.viewAll}
      />

      {/* 4) Promotional Banner (full-width) */}
      <PromoBannerFull
        locale={l}
        headline={t.home.winterGear}
        subtext={t.home.upTo30Off}
        ctaText={t.home.shopNow}
      />

      {/* 5) 運動服裝 Sports Apparel (small horizontal scroll) */}
      <SportsApparel
        locale={l}
        products={apparelProducts}
        title={t.home.sportsApparel}
        viewAllText={t.home.viewAll}
      />

      {/* 6) 最近瀏覽 / 你可能鍾意 (mini horizontal scroll) */}
      <RecentlyViewed
        locale={l}
        fallbackProducts={fallbackProducts}
        recentTitle={t.home.recentlyViewed}
        fallbackTitle={t.home.youMightLike}
      />
    </div>
  );
}
