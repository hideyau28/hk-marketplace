import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import HeroCarouselCMS from "@/components/home/HeroCarouselCMS";
import RecommendedGrid from "@/components/home/RecommendedGrid";
import FeaturedSneakers from "@/components/home/FeaturedSneakers";
import PromoBannerFull from "@/components/home/PromoBannerFull";
import SportsApparel from "@/components/home/SportsApparel";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import SaleZone from "@/components/home/SaleZone";
import PromoBanner from "@/components/PromoBanner";
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

  // Fetch hero slides from CMS
  const heroSlides = await prisma.siteContent.findMany({
    where: { type: "hero", active: true },
    orderBy: { sortOrder: "asc" },
  });

  const heroSlidesFormatted = heroSlides.map((slide) => ({
    key: slide.key,
    title: l === "zh-HK" ? slide.titleZh : slide.titleEn,
    subtitle: (l === "zh-HK" ? slide.subtitleZh : slide.subtitleEn) || undefined,
    buttonText: (l === "zh-HK" ? slide.buttonTextZh : slide.buttonTextEn) || undefined,
    buttonLink: slide.buttonLink || undefined,
    imageUrl: slide.imageUrl || undefined,
  }));

  // Fetch promo banner from CMS
  const promoBanner = await prisma.siteContent.findFirst({
    where: { key: "mid-banner", active: true },
  });

  // Fetch top promo bar from CMS
  const promoBar = await prisma.siteContent.findFirst({
    where: { type: "promo", active: true },
    orderBy: { sortOrder: "asc" },
  });

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
    originalPrice: p.originalPrice,
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

  // Sale products: originalPrice > price (8 products)
  const saleProducts = allProducts
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
    .slice(0, 8)
    .map((p) => ({
      ...p,
      originalPrice: p.originalPrice!,
    }));

  // Fallback for Recently Viewed / You Might Like (8 products)
  const fallbackProducts = shuffleArray(allProducts).slice(0, 8);

  return (
    <div className="pb-16">
      {/* Top Promo Bar */}
      {promoBar && (
        <PromoBanner
          promoKey={promoBar.key}
          message={l === "zh-HK" ? promoBar.titleZh : promoBar.titleEn}
        />
      )}

      {/* 1) Hero Banner from CMS */}
      <div className="px-4 pt-4">
        <HeroCarouselCMS slides={heroSlidesFormatted} locale={l} />
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

      {/* 4) Promotional Banner from CMS (full-width) */}
      {promoBanner && (
        <PromoBannerFull
          locale={l}
          headline={l === "zh-HK" ? promoBanner.titleZh : promoBanner.titleEn}
          subtext={
            (l === "zh-HK" ? promoBanner.subtitleZh : promoBanner.subtitleEn) || ""
          }
          ctaText={
            (l === "zh-HK" ? promoBanner.buttonTextZh : promoBanner.buttonTextEn) || t.home.shopNow
          }
        />
      )}

      {/* 5) 運動服裝 Sports Apparel (small horizontal scroll) */}
      <SportsApparel
        locale={l}
        products={apparelProducts}
        title={t.home.sportsApparel}
        viewAllText={t.home.viewAll}
      />

      {/* 6) 🔥 特價專區 Sale Zone (2-column grid) */}
      {saleProducts.length > 0 && (
        <SaleZone
          locale={l}
          products={saleProducts}
          title={t.home.onSale}
          viewAllText={t.home.viewAll}
        />
      )}

      {/* 7) 最近瀏覽 / 你可能鍾意 (mini horizontal scroll) */}
      <RecentlyViewed
        locale={l}
        fallbackProducts={fallbackProducts}
        recentTitle={t.home.recentlyViewed}
        fallbackTitle={t.home.youMightLike}
      />
    </div>
  );
}
