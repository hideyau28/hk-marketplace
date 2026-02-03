"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getDict, type Locale } from "@/lib/i18n";
import type { Product } from "@prisma/client";
import { ProductModal } from "./product-modal";
import CsvUpload from "@/components/admin/CsvUpload";
import { Star, Flame, Search } from "lucide-react";
import { toggleFeatured, toggleHotSelling } from "./actions";

const ITEMS_PER_PAGE = 50;

// Extended Product type to include promotionBadges and featured fields
type ProductWithBadges = Product & {
  promotionBadges?: string[];
  featured?: boolean;
};

type ProductsTableProps = {
  products: ProductWithBadges[];
  locale: Locale;
  currentActive?: string;
  showAddButton?: boolean;
};

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportProductsToCsv(products: ProductWithBadges[]): void {
  const headers = [
    "id",
    "sku",
    "title",
    "brand",
    "category",
    "shoeType",
    "price",
    "originalPrice",
    "stock",
    "active",
    "sizes",
    "imageUrl",
    "promotionBadges",
  ];

  const rows = products.map((product) => {
    const sizesJson = product.sizes ? JSON.stringify(product.sizes) : "";
    const promotionBadges = Array.isArray(product.promotionBadges)
      ? product.promotionBadges.join(",")
      : "";

    return [
      product.id,
      product.sku || "",
      product.title,
      product.brand || "",
      product.category || "",
      product.shoeType || "",
      String(product.price),
      product.originalPrice != null ? String(product.originalPrice) : "",
      String(product.stock ?? 0),
      String(product.active),
      sizesJson,
      product.imageUrl || "",
      promotionBadges,
    ].map(escapeCsvField);
  });

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().slice(0, 10);
  const filename = `hk-market-products-${today}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ProductsTable({ products, locale, currentActive, showAddButton }: ProductsTableProps) {
  const router = useRouter();
  const t = getDict(locale);
  const [selectedActive, setSelectedActive] = useState(currentActive || "");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);
  const [togglingHotSelling, setTogglingHotSelling] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter((p) =>
      p.title.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      (p.brand && p.brand.toLowerCase().includes(query))
    );
  }, [products, searchQuery]);

  // Paginate filtered products
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleToggleFeatured = async (productId: string, currentFeatured: boolean) => {
    setTogglingFeatured(productId);
    try {
      await toggleFeatured(productId, !currentFeatured);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle featured:", error);
    } finally {
      setTogglingFeatured(null);
    }
  };

  const handleToggleHotSelling = async (productId: string, currentBadges: string[], isHot: boolean) => {
    setTogglingHotSelling(productId);
    try {
      await toggleHotSelling(productId, currentBadges, !isHot);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle hot selling:", error);
    } finally {
      setTogglingHotSelling(null);
    }
  };

  const ACTIVE_FILTERS = [
    { value: "", label: t.admin.products.allProducts },
    { value: "true", label: t.admin.common.active },
    { value: "false", label: t.admin.common.inactive },
  ];

  const handleActiveChange = (active: string) => {
    setSelectedActive(active);
    const url = active ? `/${locale}/admin/products?active=${active}` : `/${locale}/admin/products`;
    router.push(url);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCreateProduct = () => {
    setIsCreating(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsCreating(false);
  };

  return (
    <>
      {/* Search bar */}
      <div className="mt-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="搜尋產品名稱、SKU、品牌..."
          className="w-full rounded-2xl border border-zinc-200 bg-white pl-12 pr-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <select
          value={selectedActive}
          onChange={(e) => handleActiveChange(e.target.value)}
          className="w-full md:max-w-xs rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          {ACTIVE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportProductsToCsv(products)}
            className="rounded-xl bg-olive-600 px-4 py-3 text-sm text-white font-semibold hover:bg-olive-700"
          >
            {t.admin.products.exportCsv}
          </button>
          <a
            href="/api/admin/products/csv-template"
            className="rounded-xl bg-olive-600 px-4 py-3 text-sm text-white font-semibold hover:bg-olive-700"
          >
            {t.admin.products.downloadTemplate}
          </a>
          <button
            onClick={() => setIsCsvOpen(true)}
            className="rounded-xl bg-olive-600 px-4 py-3 text-sm text-white font-semibold hover:bg-olive-700"
          >
            {t.admin.products.importCsv}
          </button>
          {showAddButton && (
            <button
              onClick={handleCreateProduct}
              className="rounded-xl bg-olive-600 px-4 py-3 text-sm text-white font-semibold hover:bg-olive-700 transition-colors whitespace-nowrap"
            >
              + {t.admin.products.addProduct}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-200">
                <th className="px-4 py-3 text-left">{t.admin.products.product}</th>
                <th className="px-4 py-3 text-left">{t.admin.products.category}</th>
                <th className="px-4 py-3 text-right">{t.admin.products.price}</th>
                <th className="px-4 py-3 text-right">{t.admin.products.stock}</th>
                <th className="px-4 py-3 text-left">{t.admin.products.status}</th>
                <th className="px-4 py-3 text-left">{t.admin.products.updatedAt}</th>
                <th className="px-4 py-3 text-right">{t.admin.common.actions}</th>
              </tr>
            </thead>

            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    {searchQuery ? "找不到符合的產品" : t.admin.common.noData}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const isOnSale = product.originalPrice != null && product.originalPrice > product.price;
                  return (
                  <tr key={product.id} className="border-t border-zinc-200 hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl && (
                          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                            <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="40px" />
                          </div>
                        )}
                        <div>
                          <div className="text-zinc-900 font-medium">{product.title}</div>
                          {product.sku && (
                            <div className="text-zinc-400 text-xs">{product.sku}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{product.category || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {isOnSale ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-900 font-medium">${Math.round(product.price)}</span>
                            <span className="text-zinc-400 text-xs line-through">${Math.round(product.originalPrice!)}</span>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                            減價
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-900 font-medium">${Math.round(product.price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-700">{product.stock ?? 0}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${
                          product.active
                            ? "bg-olive-100 text-olive-700 border-olive-200"
                            : "bg-zinc-100 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        {product.active ? t.admin.common.active : t.admin.common.inactive}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {new Date(product.updatedAt).toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Featured toggle (star) */}
                        <button
                          onClick={() => handleToggleFeatured(product.id, (product as ProductWithBadges).featured ?? false)}
                          disabled={togglingFeatured === product.id}
                          className={`p-2 rounded-lg transition-colors ${
                            (product as ProductWithBadges).featured
                              ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                              : "text-zinc-400 hover:text-yellow-500 hover:bg-zinc-100"
                          } disabled:opacity-50`}
                          title={(product as ProductWithBadges).featured ? "Remove from featured" : "Mark as featured"}
                        >
                          <Star
                            size={16}
                            fill={(product as ProductWithBadges).featured ? "currentColor" : "none"}
                          />
                        </button>
                        {/* Hot selling toggle (fire) */}
                        {(() => {
                          const badges = (product as ProductWithBadges).promotionBadges || [];
                          const isHot = badges.includes("今期熱賣");
                          return (
                            <button
                              onClick={() => handleToggleHotSelling(product.id, badges, isHot)}
                              disabled={togglingHotSelling === product.id}
                              className={`p-2 rounded-lg transition-colors ${
                                isHot
                                  ? "text-orange-500 bg-orange-50 hover:bg-orange-100"
                                  : "text-zinc-400 hover:text-orange-500 hover:bg-zinc-100"
                              } disabled:opacity-50`}
                              title={isHot ? "移除熱賣" : "設為熱賣"}
                            >
                              <Flame
                                size={16}
                                fill={isHot ? "currentColor" : "none"}
                              />
                            </button>
                          );
                        })()}
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50"
                        >
                          {t.admin.common.edit}
                        </button>
                      </div>
                    </td>
                  </tr>
                );})
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-zinc-200 px-4 py-3 text-zinc-500 text-sm gap-3">
          <div>
            顯示 {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} / 共 {filteredProducts.length} 件產品
            {searchQuery && ` (搜尋結果)`}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50"
              >
                上一頁
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
                      currentPage === pageNum
                        ? "bg-[#6B7A2F] text-white"
                        : "border border-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-1">...</span>
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50"
              >
                下一頁
              </button>
            </div>
          )}
        </div>
      </div>

      {(selectedProduct || isCreating) && (
        <ProductModal product={selectedProduct} onClose={handleCloseModal} locale={locale} />
      )}

      {isCsvOpen && (
        <CsvUpload
          open={isCsvOpen}
          onClose={() => setIsCsvOpen(false)}
          onImported={() => router.refresh()}
        />
      )}
    </>
  );
}
