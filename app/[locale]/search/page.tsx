import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import SearchForm from "./search-form";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const l = locale as Locale;
  const t = getDict(l);
  const query = q?.trim() || "";

  // Fetch products matching query
  let products: any[] = [];
  if (query) {
    const dbProducts = await prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { brand: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    products = dbProducts.map((p) => ({
      id: p.id,
      brand: p.brand || "",
      title: p.title,
      price: p.price,
      image: p.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
      badges: Array.isArray(p.badges) ? (p.badges as any[]) : [],
    }));
  }

  const emptyStateText = l === "zh-HK" ? "輸入關鍵字搜尋商品" : "Enter keywords to search products";
  const noResultsText = l === "zh-HK" ? "找不到相關商品" : "No products found";
  const resultsText = l === "zh-HK" ? `找到 ${products.length} 件商品` : `Found ${products.length} products`;

  return (
    <div className="min-h-screen pb-[calc(96px+env(safe-area-inset-bottom))]">
      {/* Search header */}
      <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-4 py-3">
        <SearchForm
          locale={l}
          initialQuery={query}
          placeholder={l === "zh-HK" ? "搜尋商品..." : "Search products..."}
        />
      </div>

      <div className="px-4 pt-4">
        {/* No query: show empty state */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-zinc-400 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="text-zinc-500 text-center">{emptyStateText}</p>
          </div>
        )}

        {/* Has query but no results */}
        {query && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-zinc-400 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 9.172a4 4 0 015.656 0M9 9l6 6m-6 0l6-6" />
              </svg>
            </div>
            <p className="text-zinc-500 text-center">{noResultsText}</p>
            <p className="text-zinc-400 text-sm mt-1">&quot;{query}&quot;</p>
          </div>
        )}

        {/* Has results */}
        {query && products.length > 0 && (
          <>
            <p className="text-sm text-zinc-500 mb-4">{resultsText}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {products.map((p) => (
                <ProductCard key={p.id} locale={l} p={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
