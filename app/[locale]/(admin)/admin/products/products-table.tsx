"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getDict, type Locale } from "@/lib/i18n";
import type { Product } from "@prisma/client";
import { ProductModal } from "./product-modal";
import CsvUpload from "@/components/admin/CsvUpload";
import { Star, Flame, Search, Check, X, Pencil } from "lucide-react";
import { toggleFeatured, toggleHotSelling, updatePrice } from "./actions";

const ITEMS_PER_PAGE = 50;

// Extended Product type to include promotionBadges and featured fields
type ProductWithBadges = Product & {
  promotionBadges?: string[];
  featured?: boolean;
  images?: string[];
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
    "SKU",
    "Brand",
    "Title",
    "Category",
    "shoeType",
    "Price",
    "originalPrice",
    "imageUrl",
    "images",
    "sizeInventory",
    "Stock",
    "promotionBadges",
    "featured",
    "active",
    "updatedAt",
  ];

  const rows = products.map((product) => {
    const sizesJson = product.sizes ? JSON.stringify(product.sizes) : "";
    const imagesStr = Array.isArray(product.images)
      ? product.images.join("|")
      : "";
    const promotionBadges = Array.isArray(product.promotionBadges)
      ? product.promotionBadges.join(",")
      : "";

    return [
      product.sku || "",
      product.brand || "",
      product.title,
      product.category || "",
      product.shoeType || "",
      String(product.price),
      product.originalPrice != null ? String(product.originalPrice) : "",
      product.imageUrl || "",
      imagesStr,
      sizesJson,
      String(product.stock ?? 0),
      promotionBadges,
      String(product.featured ?? false),
      String(product.active),
      new Date(product.updatedAt).toISOString(),
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
  // Inline price editing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editOriginalPrice, setEditOriginalPrice] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);

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

  const startEditingPrice = (product: ProductWithBadges) => {
    setEditingPriceId(product.id);
    setEditPrice(Math.round(product.price).toString());
    setEditOriginalPrice(product.originalPrice != null ? Math.round(product.originalPrice).toString() : "");
  };

  const cancelEditingPrice = () => {
    setEditingPriceId(null);
    setEditPrice("");
    setEditOriginalPrice("");
  };

  const savePrice = async (productId: string) => {
    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum < 0) return;

    const originalPriceNum = editOriginalPrice.trim() ? parseFloat(editOriginalPrice) : null;
    if (editOriginalPrice.trim() && (isNaN(originalPriceNum!) || originalPriceNum! < 0)) return;

    setSavingPrice(true);
    try {
      await updatePrice(productId, priceNum, originalPriceNum);
      router.refresh();
      cancelEditingPrice();
    } catch (error) {
      console.error("Failed to update price:", error);
    } finally {
      setSavingPrice(false);
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
          <table className="min-w-[1100px] w-full text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-200">
                <th className="px-4 py-3 text-left">{t.admin.products.product}</th>
                <th className="px-4 py-3 text-left">{t.admin.products.category}</th>
                <th className="px-4 py-3 text-right">原價</th>
                <th className="px-4 py-3 text-right">售價</th>
                <th className="px-4 py-3 text-center">折扣</th>
                <th className="px-4 py-3 text-right">{t.admin.products.stock}</th>
                <th className="px-4 py-3 text-left">{t.admin.products.status}</th>
                <th className="px-4 py-3 text-left">{t.admin.products.updatedAt}</th>
                <th className="px-4 py-3 text-right">{t.admin.common.actions}</th>
              </tr>
            </thead>

            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-zinc-500">
                    {searchQuery ? "找不到符合的產品" : t.admin.common.noData}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const isOnSale = product.originalPrice != null && product.originalPrice > product.price;
                  const discountPercent = isOnSale ? Math.round((1 - product.price / product.originalPrice!) * 100) : 0;
                  return (
                  <tr key={product.id} className="border-t border-zinc-200 hover:bg-zinc-50">
                    {/* Product: thumbnail + Brand (bold) + SKU (gray) */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl && (
                          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 flex-shrink-0">
                            <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="40px" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-zinc-900 font-semibold text-sm">{product.brand || "Nike"}</div>
                          {product.sku && (
                            <div className="text-zinc-400 text-xs truncate">{product.sku}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-4 py-3 text-zinc-600 text-sm">{product.category || "—"}</td>
                    {/* 原價 (strikethrough if exists) */}
                    <td className="px-4 py-3 text-right text-sm">
                      {product.originalPrice != null ? (
                        <span className="text-zinc-400 line-through">${Math.round(product.originalPrice)}</span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    {/* 售價 (editable on click) */}
                    <td className="px-4 py-3 text-right">
                      {editingPriceId === product.id ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editOriginalPrice}
                              onChange={(e) => setEditOriginalPrice(e.target.value)}
                              className="w-20 rounded-lg border border-zinc-200 px-2 py-1 text-sm text-right text-zinc-500 focus:outline-none focus:ring-1 focus:ring-olive-500"
                              placeholder="原價"
                            />
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-20 rounded-lg border border-zinc-300 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-olive-500"
                              placeholder="售價"
                              autoFocus
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => savePrice(product.id)}
                              disabled={savingPrice}
                              className="p-1 rounded-lg text-olive-600 hover:bg-olive-50 disabled:opacity-50"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={cancelEditingPrice}
                              disabled={savingPrice}
                              className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="group cursor-pointer inline-flex items-center gap-1"
                          onClick={() => startEditingPrice(product)}
                        >
                          <span className="text-zinc-900 font-medium">${Math.round(product.price)}</span>
                          <Pencil size={12} className="text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>
                    {/* 折扣 */}
                    <td className="px-4 py-3 text-center">
                      {isOnSale ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                          -{discountPercent}%
                        </span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    {/* 庫存 */}
                    <td className="px-4 py-3 text-right text-zinc-700 text-sm">{product.stock ?? 0}</td>
                    {/* Status */}
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
                    {/* Updated */}
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {new Date(product.updatedAt).toISOString().slice(0, 10)}
                    </td>
                    {/* Actions: Edit + Featured star + 熱賣 fire (compact row) */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50"
                        >
                          {t.admin.common.edit}
                        </button>
                        {/* Featured toggle (star) */}
                        <button
                          onClick={() => handleToggleFeatured(product.id, product.featured ?? false)}
                          disabled={togglingFeatured === product.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            product.featured
                              ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                              : "text-zinc-400 hover:text-yellow-500 hover:bg-zinc-100"
                          } disabled:opacity-50`}
                          title={product.featured ? "Remove from featured" : "Mark as featured"}
                        >
                          <Star
                            size={14}
                            fill={product.featured ? "currentColor" : "none"}
                          />
                        </button>
                        {/* Hot selling toggle (fire) */}
                        {(() => {
                          const badges = product.promotionBadges || [];
                          const isHot = badges.includes("今期熱賣");
                          return (
                            <button
                              onClick={() => handleToggleHotSelling(product.id, badges, isHot)}
                              disabled={togglingHotSelling === product.id}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isHot
                                  ? "text-orange-500 bg-orange-50 hover:bg-orange-100"
                                  : "text-zinc-400 hover:text-orange-500 hover:bg-zinc-100"
                              } disabled:opacity-50`}
                              title={isHot ? "移除熱賣" : "設為熱賣"}
                            >
                              <Flame
                                size={14}
                                fill={isHot ? "currentColor" : "none"}
                              />
                            </button>
                          );
                        })()}
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
