import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getStoreName } from "@/lib/get-store-name";
import { getServerTenantId, isPlatformMode } from "@/lib/tenant";
import HeroCarouselCMS from "@/components/home/HeroCarouselCMS";
import RecommendedGrid from "@/components/home/RecommendedGrid";
import FeaturedSneakers from "@/components/home/FeaturedSneakers";
import SportsApparel from "@/components/home/SportsApparel";
import RecentlyViewed from "@/components/home/RecentlyViewed";
import SaleZone from "@/components/home/SaleZone";
import KidsSection from "@/components/home/KidsSection";
import { Metadata } from "next";
import LandingPage from "@/components/marketing/LandingPage";

// Force dynamic rendering because we need headers() for tenant resolution
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  // Platform bare domain → landing page metadata
  if (await isPlatformMode()) {
    return {
      title: "WoWlix — Turn Followers into Customers",
      description: "Instagram 小店嘅最強武器。2 分鐘開店，一條連結搞掂所有嘢。免費開始。",
      openGraph: {
        title: "WoWlix — Turn Followers into Customers",
        description: "Instagram 小店嘅最強武器。2 分鐘開店，一條連結搞掂所有嘢。",
        url: "https://wowlix.com",
        siteName: "WoWlix",
        locale: "zh_HK",
        type: "website",
      },
    };
  }

  // Fallback: check if tenant exists
  try {
    await getServerTenantId();
  } catch (error) {
    return {
      title: "WoWlix — Turn Followers into Customers",
      description: "Instagram 小店嘅最強武器。2 分鐘開店，一條連結搞掂所有嘢。免費開始。",
      openGraph: {
        title: "WoWlix — Turn Followers into Customers",
        description: "Instagram 小店嘅最強武器。2 分鐘開店，一條連結搞掂所有嘢。",
        url: "https://wowlix.com",
        siteName: "WoWlix",
        locale: "zh_HK",
        type: "website",
      },
    };
  }

  const storeName = await getStoreName();

  const title = `${storeName} - 香港波鞋專門店`;
  const description = locale === "zh-HK"
    ? "探索最新波鞋及運動裝備，正品保證！"
    : "Shop the latest sneakers and sports gear. 100% authentic!";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: storeName,
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

  const filterByAgeGroup = (products: any[]) => {
    if (isKidsSection) {
      return products.filter((p) => KIDS_SHOE_TYPES.includes(p.shoeType || ""));
    }
    return products.filter((p) => !KIDS_SHOE_TYPES.includes(p.shoeType || ""));
  };

  if (section.productIds && section.productIds.length > 0) {
    const productMap = new Map(allProducts.map((p) => [p.id, p]));
    const selected = section.productIds.map((id) => productMap.get(id)).filter(Boolean);
    return filterByAgeGroup(selected).slice(0, 10);
  }

  if (section.filterType && section.filterValue) {
    let filtered: any[] = [];

    switch (section.filterType) {
      case "category":
        filtered = allProducts.filter((p) => p.category === section.filterValue);
        break;
      case "shoeType":
        if (section.filterValue === "kids") {
          filtered = allProducts.filter((p) => KIDS_SHOE_TYPES.includes(p.shoeType || ""));
          return shuffleArray(filtered).slice(0, 10);
        } else {
          filtered = allProducts.filter((p) => p.shoeType === section.filterValue);
        }
        break;
      case "featured":
        filtered = allProducts.filter((p) => p.featured);
        break;
      case "promotion":
        filtered = allProducts.filter((p) => p.promotionBadges?.includes(section.filterValue!));
        break;
      default:
        filtered = allProducts;
    }

    return shuffleArray(filterByAgeGroup(filtered)).slice(0, 10);
  }

  return [];
}

type HomepageItem =
  | { type: "section"; data: any; products: any[] }
  | { type: "banner"; data: any };

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = getDict(l);

  // Platform bare domain → landing page
  if (await isPlatformMode()) {
    return <LandingPage locale={l} />;
  }

  // Check if tenant exists; if not, show landing page
  let tenantId: string;
  try {
    tenantId = await getServerTenantId();
  } catch (error) {
    // Tenant not found
    return <LandingPage locale={l} />;
  }

  const PAID_STATUSES = ["PAID", "FULFILLING", "SHIPPED", "COMPLETED"] as const;
  const hpNow = new Date();
  const start30 = new Date(hpNow.getFullYear(), hpNow.getMonth(), hpNow.getDate() - 29);

  const [sectionsRaw, bannersRaw, allProductsRaw, paidOrders] = await Promise.all([
    prisma.homepageSection.findMany({
      where: { active: true, tenantId },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.homepageBanner.findMany({
      where: { active: true, tenantId },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { active: true, tenantId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { tenantId, createdAt: { gte: start30 }, status: { in: [...PAID_STATUSES] } },
      select: { items: true },
    }),
  ]);

  // Compute top 3 seller IDs for 🔥 badge
  const productSales = new Map<string, number>();
  for (const order of paidOrders) {
    const items = Array.isArray(order.items) ? (order.items as Record<string, unknown>[]) : [];
    for (const item of items) {
      const productId = typeof item?.productId === "string" ? item.productId : null;
      if (!productId) continue;
      const qty = Number(item?.quantity ?? item?.qty ?? 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;
      productSales.set(productId, (productSales.get(productId) || 0) + qty);
    }
  }
  const topSellerIds = Array.from(productSales.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

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

  const unifiedItems: HomepageItem[] = [];

  for (const section of sectionsRaw) {
    const products = await fetchSectionProducts(section, allProducts);
    unifiedItems.push({ type: "section", data: section, products });
  }

  for (const banner of bannersRaw) {
    unifiedItems.push({ type: "banner", data: banner });
  }

  unifiedItems.sort((a, b) => a.data.sortOrder - b.data.sortOrder);

  // No need to group banners anymore - each banner can have multiple images
  type RenderItem =
    | { type: "section"; data: any; products: any[] }
    | { type: "banner"; data: any };

  const renderItems: RenderItem[] = unifiedItems;

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

  const fallbackProducts = shuffleArray(allProducts).slice(0, 8).map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    image: p.image,
    sizes: p.sizes,
    stock: p.stock,
  }));

  return (
    <div className="pb-16">
      {renderItems.map((item) => {
        if (item.type === "banner") {
          const banner = item.data;

          // Get slides from banner.images or fallback to old imageUrl field
          const slides =
            banner.images && banner.images.length > 0
              ? banner.images
              : [
                  {
                    imageUrl: banner.imageUrl,
                    linkUrl: banner.linkUrl,
                    title: banner.title,
                    subtitle: banner.subtitle,
                  },
                ];

          const carouselSlides = slides.map((slide: any, idx: number) => ({
            key: `${banner.id}-${idx}`,
            title: slide.title || "",
            subtitle: slide.subtitle || undefined,
            buttonLink: slide.linkUrl || undefined,
            imageUrl: slide.imageUrl || undefined,
          }));

          return (
            <HeroCarouselCMS key={`banner-${banner.id}`} slides={carouselSlides} locale={l} />
          );
        }

        const section = item.data;
        const products = item.products;

        if (products.length === 0) return null;

        const isLarge = section.cardSize === "large";
        const isKidsSection =
          section.filterType === "shoeType" && section.filterValue === "kids";

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
          <SectionComponent
            key={section.id}
            locale={l}
            products={products}
            title={section.title}
            viewAllText={t.home.viewAll}
            viewAllHref={viewAllHref}
            topSellerIds={topSellerIds}
          />
        );
      })}

      <div id="home-search-sentinel" className="h-px w-full" />

      {saleProducts.length > 0 && (
        <SaleZone
          locale={l}
          products={saleProducts}
          title={t.home.onSale}
          viewAllText={t.home.viewAll}
        />
      )}

      <RecentlyViewed
        locale={l}
        fallbackProducts={fallbackProducts}
        recentTitle={t.home.recentlyViewed}
        fallbackTitle={t.home.youMightLike}
      />
    </div>
  );
}
