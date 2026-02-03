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

// Fetch products for a section based on filter or manual selection
async function fetchSectionProducts(
  section: {
    title: string;
    filterType: string | null;
    filterValue: string | null;
    productIds: string[];
  },
  allProducts: any[]
) {
  const KIDS_SHOE_TYPES = ["grade_school", "preschool", "toddler"];
  const isKidsSection = section.title === "童裝專區";

  // Helper to filter by kids/adult
  const filterByAgeGroup = (products: any[]) => {
    if (isKidsSection) {
      return products.filter((p) => KIDS_SHOE_TYPES.includes(p.shoeType || ""));
    }
    return products.filter((p) => !KIDS_SHOE_TYPES.includes(p.shoeType || ""));
  };

  // Manual selection
  if (section.productIds && section.productIds.length > 0) {
    const productMap = new Map(allProducts.map((p) => [p.id, p]));
    const selected = section.productIds
      .map((id) => productMap.get(id))
      .filter(Boolean);
    return filterByAgeGroup(selected).slice(0, 10);
  }

  // Auto filter
  if (section.filterType && section.filterValue) {
    let filtered: any[] = [];

    switch (section.filterType) {
      case "category":
        filtered = allProducts.filter((p) => p.category === section.filterValue);
        break;
      case "shoeType":
        if (section.filterValue === "kids") {
          // Kids section uses this filter value
          filtered = allProducts.filter((p) =>
            KIDS_SHOE_TYPES.includes(p.shoeType || "")
          );
          // Return early - no need to filter again
          return shuffleArray(filtered).slice(0, 10);
        } else {
          filtered = allProducts.filter((p) => p.shoeType === section.filterValue);
        }
        break;
      case "featured":
        filtered = allProducts.filter((p) => p.featured);
        break;
      case "promotion":
        // Filter by promotion badge (e.g., "今期熱賣")
        filtered = allProducts.filter((p) =>
          p.promotionBadges?.includes(section.filterValue!)
        );
        break;
      default:
        filtered = allProducts;
    }

    // Apply kids/adult filter (except for shoeType=kids which already returned)
    return shuffleArray(filterByAgeGroup(filtered)).slice(0, 10);
  }

  return [];
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = getDict(l);

  // Fetch CMS data: sections and banners
  const [sections, heroBanners, midBanners, allProductsRaw] = await Promise.all([
    prisma.homepageSection.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.homepageBanner.findMany({
      where: { active: true, position: "hero" },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.homepageBanner.findMany({
      where: { active: true, position: "mid" },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Map products to expected format
  const allProducts = allProductsRaw.map((p) => ({
    id: p.id,
    brand: p.brand || "",
    title: p.title,
    price: p.price,
    originalPrice: p.originalPrice,
    category: p.category || "",
    image:
      p.imageUrl ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
    sizes: p.sizes as Record<string, number> | null,
    stock: p.stock ?? 0,
    shoeType: p.shoeType || null,
    featured: p.featured || false,
    promotionBadges: (p.promotionBadges as string[]) || [],
  }));

  // Format hero banners for carousel
  const heroSlidesFormatted = heroBanners.map((banner) => ({
    key: banner.id,
    title: banner.title || "",
    subtitle: banner.subtitle || undefined,
    buttonLink: banner.linkUrl || undefined,
    imageUrl: banner.imageUrl || undefined,
  }));

  // Get first mid-page banner
  const midBanner = midBanners[0] || null;

  // Fetch products for each section
  const sectionsWithProducts = await Promise.all(
    sections.map(async (section) => ({
      ...section,
      products: await fetchSectionProducts(section, allProducts),
    }))
  );

  // Sale products: originalPrice > price
  const saleProducts = allProducts
    .filter((p) => p.originalPrice && p.originalPrice > p.price)
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      brand: p.brand,
      title: p.title,
      price: p.price,
      originalPrice: p.originalPrice!,
      image: p.image,
      sizes: p.sizes,
      stock: p.stock,
    }));

  // Fallback products for "你可能鍾意"
  const fallbackProducts = shuffleArray(allProducts).slice(0, 8).map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    image: p.image,
    sizes: p.sizes,
    stock: p.stock,
  }));

  // Determine where to insert mid-banner (after 4th section)
  const midBannerPosition = 4;

  return (
    <div className="pb-16">
      {/* 1) Hero Banner from CMS */}
      <div className="px-4 pt-4">
        <HeroCarouselCMS slides={heroSlidesFormatted} locale={l} />
      </div>

      {/* Sentinel */}
      <div id="home-search-sentinel" className="h-px w-full" />

      {/* Render sections from CMS */}
      {sectionsWithProducts.map((section, index) => {
        if (section.products.length === 0) return null;

        const isLarge = section.cardSize === "large";
        const isKidsSection =
          section.filterType === "shoeType" && section.filterValue === "kids";

        // Generate view all href based on filter
        let viewAllHref = `/${locale}/products`;
        if (section.filterType === "category" && section.filterValue) {
          viewAllHref = `/${locale}/products?category=${encodeURIComponent(section.filterValue)}`;
        } else if (section.filterType === "shoeType") {
          if (section.filterValue === "kids") {
            viewAllHref = `/${locale}/products?shoeType=grade_school,preschool,toddler`;
          } else if (section.filterValue) {
            viewAllHref = `/${locale}/products?shoeType=${section.filterValue}`;
          }
        } else if (section.filterType === "featured") {
          viewAllHref = `/${locale}/products?featured=true`;
        }

        const SectionComponent = isKidsSection
          ? KidsSection
          : isLarge
            ? FeaturedSneakers
            : section.filterType === "featured"
              ? RecommendedGrid
              : SportsApparel;

        return (
          <div key={section.id}>
            {/* Insert mid-banner after 4th section */}
            {index === midBannerPosition && midBanner && (
              <PromoBannerFull
                locale={l}
                headline={midBanner.title || ""}
                subtext={midBanner.subtitle || ""}
              />
            )}

            <SectionComponent
              locale={l}
              products={section.products}
              title={section.title}
              viewAllText={t.home.viewAll}
              viewAllHref={viewAllHref}
            />
          </div>
        );
      })}

      {/* Mid-banner fallback if fewer than 5 sections */}
      {sectionsWithProducts.length <= midBannerPosition && midBanner && (
        <PromoBannerFull
          locale={l}
          headline={midBanner.title || ""}
          subtext={midBanner.subtitle || ""}
        />
      )}

      {/* 🔥 特價專區 Sale Zone */}
      {saleProducts.length > 0 && (
        <SaleZone
          locale={l}
          products={saleProducts}
          title={t.home.onSale}
          viewAllText={t.home.viewAll}
        />
      )}

      {/* 最近瀏覽 / 你可能鍾意 */}
      <RecentlyViewed
        locale={l}
        fallbackProducts={fallbackProducts}
        recentTitle={t.home.recentlyViewed}
        fallbackTitle={t.home.youMightLike}
      />
    </div>
  );
}
