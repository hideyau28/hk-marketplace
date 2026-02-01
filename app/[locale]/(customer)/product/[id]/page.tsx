import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
    originalPrice: product.originalPrice,
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
      <div className="flex items-center gap-2 text-sm text-zinc-600 mb-4 dark:text-zinc-400">
        <Link href={`/${locale}`} className="hover:text-zinc-900 dark:hover:text-zinc-100">
          {t.product.home}
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
        <span className="text-zinc-900 dark:text-zinc-100">{p.title}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white aspect-square dark:border-zinc-800 dark:bg-zinc-900">
          <Image src={p.image} alt={p.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
        </div>
        <ProductDetailClient
          product={p}
          locale={locale}
          t={t}
        />
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4 dark:text-zinc-100">
            {t.product.relatedProducts}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/product/${item.id}`}
                className="group rounded-2xl border border-zinc-200 bg-white overflow-hidden hover:border-zinc-300 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <div className="p-3">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{item.brand}</div>
                  <div className="mt-1 text-sm font-medium text-zinc-900 line-clamp-2 dark:text-zinc-100">{item.title}</div>
                  <div className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
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
