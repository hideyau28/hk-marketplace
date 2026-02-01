import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import CategoryGrid from "@/components/CategoryGrid";
import BrandRail from "@/components/BrandRail";
import HeroCarousel from "@/components/HeroCarousel";
import HomeClient from "@/components/HomeClient";
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
    stock: (p as any).stock ?? 0,
    image:
      p.imageUrl ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
    badges: Array.isArray(p.badges) ? (p.badges as any[]) : [],
  }));

  return (
    <div className="pb-[calc(96px+env(safe-area-inset-bottom))]">
      {/* 1) Hero carousel (4–5 slides) */}
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

      <div className="px-4">
        <PromoBanner t={t} />
      </div>

      {/* Sentinel: used to hide floating search once user scrolls past hero */}
      <div id="home-search-sentinel" className="h-px w-full" />

      {/* 2) Shop by Category (icon grid) */}
      <CategoryGrid locale={l} title={t.home.shopByCategory} />

      {/* 3) Brand Filter + Product Rails */}
      <HomeClient locale={l} allProducts={allProducts} t={t} />

      {/* 4) Popular Brands (rail + "See all") */}
      <BrandRail locale={l} title={t.home.popularBrands} seeAllText={t.home.seeAll} />
    </div>
  );
}
