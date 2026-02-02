import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import HeroCarouselCMS from "@/components/home/HeroCarouselCMS";
import RecommendedGrid from "@/components/home/RecommendedGrid";
import FeaturedSneakers from "@/components/home/FeaturedSneakers";
import PromoBannerFull from "@/components/home/PromoBannerFull";
import SportsApparel from "@/components/home/SportsApparel";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import SaleZone from "@/components/home/SaleZone";
import KidsSection from "@/components/home/KidsSection";
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

  // Fetch second promo banner from CMS (for between Running/Basketball)
  const promoBanner2 = await prisma.siteContent.findFirst({
    where: { key: "mid-banner-2", active: true },
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

  // 為你推薦 — random 8 products (horizontal scroll)
  const recommendedProducts = shuffleArray(allProducts).slice(0, 8);

  // Air Jordan section (large cards)
  const jordanProducts = shuffleArray(allProducts.filter((p) => p.category === "Air Jordan")).slice(0, 8);

  // Dunk / SB section (small cards)
  const dunkProducts = shuffleArray(allProducts.filter((p) => p.category === "Dunk / SB")).slice(0, 10);

  // Air Max section (large cards)
  const airMaxProducts = shuffleArray(allProducts.filter((p) => p.category === "Air Max")).slice(0, 8);

  // Air Force section (small cards)
  const airForceProducts = shuffleArray(allProducts.filter((p) => p.category === "Air Force")).slice(0, 10);

  // Running section (large cards)
  const runningProducts = shuffleArray(allProducts.filter((p) => p.category === "Running")).slice(0, 8);

  // Basketball section (small cards)
  const basketballProducts = shuffleArray(allProducts.filter((p) => p.category === "Basketball")).slice(0, 10);

  // Sale products: originalPrice > price
  const saleProducts = allProducts
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
    .slice(0, 8)
    .map((p) => ({
      ...p,
      originalPrice: p.originalPrice!,
    }));

  // Kids products (shoeType: grade_school, preschool, toddler)
  const kidsProductsRaw = await prisma.product.findMany({
    where: {
      active: true,
      shoeType: { in: ["grade_school", "preschool", "toddler"] },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const kidsProducts = kidsProductsRaw.map((p) => ({
    id: p.id,
    brand: p.brand || "",
    title: p.title,
    price: p.price,
    image: p.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
  }));

  // 你可能鍾意 — random 8 products
  const fallbackProducts = shuffleArray(allProducts).slice(0, 8);

  return (
    <div className="pb-16">
      {/* 1) Hero Banner from CMS */}
      <div className="px-4 pt-4">
        <HeroCarouselCMS slides={heroSlidesFormatted} locale={l} />
      </div>

      {/* Sentinel */}
      <div id="home-search-sentinel" className="h-px w-full" />

      {/* 2) 為你推薦 Recommended (horizontal scroll) */}
      <RecommendedGrid
        locale={l}
        products={recommendedProducts}
        title={t.home.recommended}
        viewAllText={t.home.viewAll}
      />

      {/* 3) Air Jordan (large horizontal scroll) */}
      {jordanProducts.length > 0 && (
        <FeaturedSneakers
          locale={l}
          products={jordanProducts}
          title={l === "zh-HK" ? "Air Jordan 系列" : "Air Jordan"}
          viewAllText={t.home.viewAll}
          viewAllHref={`/${locale}/products?category=Air+Jordan`}
        />
      )}

      {/* 4) Dunk / SB (small horizontal scroll) */}
      {dunkProducts.length > 0 && (
        <SportsApparel
          locale={l}
          products={dunkProducts}
          title={l === "zh-HK" ? "Dunk / SB 系列" : "Dunk / SB"}
          viewAllText={t.home.viewAll}
          viewAllHref={`/${locale}/products?category=Dunk+%2F+SB`}
        />
      )}

      {/* 5) Promotional Banner #1 from CMS */}
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

      {/* 6) Air Max (large horizontal scroll) */}
      {airMaxProducts.length > 0 && (
        <FeaturedSneakers
          locale={l}
          products={airMaxProducts}
          title={l === "zh-HK" ? "Air Max 系列" : "Air Max"}
          viewAllText={t.home.viewAll}
          viewAllHref={`/${locale}/products?category=Air+Max`}
        />
      )}

      {/* 7) Air Force (small horizontal scroll) */}
      {airForceProducts.length > 0 && (
        <SportsApparel
          locale={l}
          products={airForceProducts}
          title={l === "zh-HK" ? "Air Force 系列" : "Air Force"}
          viewAllText={t.home.viewAll}
          viewAllHref={`/${locale}/products?category=Air+Force`}
        />
      )}

      {/* 8) Promotional Banner #2 from CMS (optional) */}
      {promoBanner2 && (
        <PromoBannerFull
          locale={l}
          headline={l === "zh-HK" ? promoBanner2.titleZh : promoBanner2.titleEn}
          subtext={
            (l === "zh-HK" ? promoBanner2.subtitleZh : promoBanner2.subtitleEn) || ""
          }
          ctaText={
            (l === "zh-HK" ? promoBanner2.buttonTextZh : promoBanner2.buttonTextEn) || t.home.shopNow
          }
        />
      )}

      {/* 9) Running (large horizontal scroll) */}
      {runningProducts.length > 0 && (
        <FeaturedSneakers
          locale={l}
          products={runningProducts}
          title={l === "zh-HK" ? "Running 系列" : "Running"}
          viewAllText={t.home.viewAll}
          viewAllHref={`/${locale}/products?category=Running`}
        />
      )}

      {/* 10) Basketball (small horizontal scroll) */}
      {basketballProducts.length > 0 && (
        <SportsApparel
          locale={l}
          products={basketballProducts}
          title={l === "zh-HK" ? "Basketball 系列" : "Basketball"}
          viewAllText={t.home.viewAll}
          viewAllHref={`/${locale}/products?category=Basketball`}
        />
      )}

      {/* 11) 童裝專區 Kids Section */}
      {kidsProducts.length > 0 && (
        <KidsSection
          locale={l}
          products={kidsProducts}
          title={l === "zh-HK" ? "童裝專區" : "Kids"}
          viewAllText={t.home.viewAll}
          viewAllHref={`/${locale}/products?shoeType=grade_school,preschool,toddler`}
        />
      )}

      {/* 12) 🔥 特價專區 Sale Zone */}
      {saleProducts.length > 0 && (
        <SaleZone
          locale={l}
          products={saleProducts}
          title={t.home.onSale}
          viewAllText={t.home.viewAll}
        />
      )}

      {/* 13) 最近瀏覽 / 你可能鍾意 */}
      <RecentlyViewed
        locale={l}
        fallbackProducts={fallbackProducts}
        recentTitle={t.home.recentlyViewed}
        fallbackTitle={t.home.youMightLike}
      />
    </div>
  );
}
