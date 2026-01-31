import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductDetailClient from "@/components/ProductDetailClient";
import CurrencyPrice from "@/components/CurrencyPrice";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;

  const product = await prisma.product.findUnique({
    where: { id, active: true },
  });

  if (!product) {
    return {
      title: "Product Not Found - HK•Market",
    };
  }

  return {
    title: `${product.title} - HK•Market`,
    description: `Shop ${product.title}${product.brand ? ` by ${product.brand}` : ""} at HK•Market. Premium sports gear for Hong Kong.`,
    openGraph: {
      title: `${product.title} - HK•Market`,
      description: `Shop ${product.title}${product.brand ? ` by ${product.brand}` : ""} at HK•Market. Premium sports gear for Hong Kong.`,
      type: "website",
      locale: locale === "zh-HK" ? "zh_HK" : "en_US",
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const t = getDict(locale as Locale);

  // Fetch product from database
  const product = await prisma.product.findUnique({
    where: { id, active: true },
  });

  if (!product) {
    notFound();
  }

  const p = {
    id: product.id,
    brand: product.brand || "—",
    title: product.title,
    price: product.price,
    image: product.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
    category: product.category,
    sizeSystem: (product as any).sizeSystem || null,
    sizes: (product as any).sizes || null,
    stock: (product as any).stock ?? 0,
  };

  // Fetch related products (same category, max 4)
  const relatedProducts = product.category
    ? await prisma.product.findMany({
        where: {
          active: true,
          category: product.category,
          id: { not: product.id },
        },
        take: 4,
        orderBy: { createdAt: "desc" },
      })
    : [];

  const related = relatedProducts.map((rp) => ({
    id: rp.id,
    brand: rp.brand || "",
    title: rp.title,
    price: rp.price,
    image: rp.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
    stock: (rp as any).stock ?? 0,
  }));

  return (
    <div className="px-4 pb-24 pt-6">
      <span className="sr-only" data-product-name={p.title} />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-600 mb-4">
        <Link href={`/${locale}`} className="hover:text-zinc-900">
          {locale === "zh-HK" ? "首頁" : "Home"}
        </Link>
        {p.category && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/${locale}?category=${p.category}`} className="hover:text-zinc-900">
              {p.category}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="text-zinc-900">{p.title}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white aspect-square">
          <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
        </div>
        <ProductDetailClient
          product={p}
          locale={locale}
          texts={{
            addToCart: t.product.addToCart,
            addedToCart: t.product.addedToCart,
            buyNow: t.product.buyNow,
            pleaseSelectSize: locale === "zh-HK" ? "請選擇尺碼" : "Please select a size",
          }}
        />
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">
            {locale === "zh-HK" ? "相關產品" : "Related Products"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/product/${item.id}`}
                className="group rounded-2xl border border-zinc-200 bg-white overflow-hidden hover:border-zinc-300 transition-colors"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3">
                  <div className="text-xs text-zinc-500">{item.brand}</div>
                  <div className="mt-1 text-sm font-medium text-zinc-900 line-clamp-2">{item.title}</div>
                  <div className="mt-2 text-sm font-semibold text-zinc-900">
                    <CurrencyPrice amount={item.price} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
