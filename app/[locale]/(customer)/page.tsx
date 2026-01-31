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
              title: l === "zh-HK" ? "裝備勝利" : "Gear Up for Victory",
              subtitle: l === "zh-HK" ? "頂級運動裝備，助你突破極限" : "Premium sports gear for peak performance",
              cta: l === "zh-HK" ? "立即選購" : "Shop Now",
              href: `/${l}`,
              imageUrl:
                "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=70",
            },
            {
              title: l === "zh-HK" ? "跑得更遠，更快" : "Run Further, Go Faster",
              subtitle: l === "zh-HK" ? "專業跑步裝備系列" : "Professional running gear collection",
              cta: l === "zh-HK" ? "查看跑步系列" : "View Running",
              href: `/${l}?category=Shoes`,
              imageUrl:
                "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1400&q=70",
            },
            {
              title: l === "zh-HK" ? "像冠軍般訓練" : "Train Like a Champion",
              subtitle: l === "zh-HK" ? "專業訓練服飾，提升表現" : "Pro training apparel for better results",
              cta: l === "zh-HK" ? "探索訓練裝備" : "Explore Training",
              href: `/${l}?category=Tops`,
              imageUrl:
                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=70",
            },
          ]}
        />
      </div>

      <div className="px-4">
        <PromoBanner />
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
