"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { type Locale } from "@/lib/i18n";
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

export function ProductsTable({ products, locale, showAddButton }: ProductsTableProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);
  const [togglingHotSelling, setTogglingHotSelling] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [openFilter, setOpenFilter] = useState<"category" | "status" | "stock" | null>(null);
  const [sortKey, setSortKey] = useState<"originalPrice" | "price" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  // Inline price editing
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editOriginalPrice, setEditOriginalPrice] = useState("");
  const [savingPrice, setSavingPrice] = useState(false);

  const CATEGORY_OPTIONS = [
    "All",
    "Air Jordan",
    "Dunk/SB",
    "Air Max",
    "Air Force",
    "Running",
    "Basketball",
    "Lifestyle",
    "Training",
    "Sandals",
  ];

  const STATUS_OPTIONS = ["All", "Active", "Inactive"];
  const STOCK_OPTIONS = ["All", "In Stock", "Out of Stock"];

  const hasStock = (product: ProductWithBadges) => {
    const sizes = (product as { sizes?: Record<string, number> | null }).sizes;
    if (sizes && typeof sizes === "object" && !Array.isArray(sizes)) {
      return Object.values(sizes).some((value) => typeof value === "number" && value > 0);
    }
    return (product.stock ?? 0) > 0;
  };

  const getBadgeStyles = (badge: string) => {
    if (badge === "今期熱賣" || badge.toLowerCase() === "hot") {
      return "bg-orange-100 text-orange-700";
    }
    if (badge === "新品上架" || badge.toLowerCase() === "new") {
      return "bg-blue-100 text-blue-700";
    }
    if (badge === "快將售罄" || badge.toLowerCase() === "low") {
      return "bg-red-100 text-red-700";
    }
    if (badge === "店長推介" || badge.toLowerCase() === "featured") {
      return "bg-olive-100 text-olive-700";
    }
    return "bg-zinc-100 text-zinc-700";
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = products.filter((p) => {
      const matchesSearch = !query
        || p.title.toLowerCase().includes(query)
        || (p.sku && p.sku.toLowerCase().includes(query))
        || (p.brand && p.brand.toLowerCase().includes(query));

      const matchesCategory = categoryFilter === "All" || (p.category || "") === categoryFilter;
      const matchesStatus = statusFilter === "All"
        || (statusFilter === "Active" ? p.active : !p.active);
      const matchesStock = stockFilter === "All"
        || (stockFilter === "In Stock" ? hasStock(p) : !hasStock(p));

      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });

    if (sortKey && sortDirection) {
      result = [...result].sort((a, b) => {
        const aValue = sortKey === "originalPrice"
          ? (a.originalPrice ?? 0)
          : a.price;
        const bValue = sortKey === "originalPrice"
          ? (b.originalPrice ?? 0)
          : b.price;
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      });
    }

    return result;
  }, [products, searchQuery, categoryFilter, statusFilter, stockFilter, sortKey, sortDirection]);

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

  const toggleSort = (key: "originalPrice" | "price") => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
      setCurrentPage(1);
      return;
    }
    if (sortDirection === "asc") {
      setSortDirection("desc");
      setCurrentPage(1);
      return;
    }
    if (sortDirection === "desc") {
      setSortKey(null);
      setSortDirection(null);
      setCurrentPage(1);
    }
  };

  const getSortIndicator = (key: "originalPrice" | "price") => {
    if (sortKey !== key) return "↕";
    if (sortDirection === "asc") return "↑";
    if (sortDirection === "desc") return "↓";
    return "↕";
  };

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, SKU, brand..."
            className="w-full rounded-2xl border border-zinc-200 bg-white pl-12 pr-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <button
            onClick={() => exportProductsToCsv(products)}
            className="rounded-xl bg-olive-600 px-4 py-3 text-sm text-white font-semibold hover:bg-olive-700"
          >
            Export CSV
          </button>
          <a
            href="/api/admin/products/csv-template"
            className="rounded-xl bg-olive-600 px-4 py-3 text-sm text-white font-semibold hover:bg-olive-700"
          >
            Download Template
          </a>
          <button
            onClick={() => setIsCsvOpen(true)}
            className="rounded-xl bg-olive-600 px-4 py-3 text-sm text-white font-semibold hover:bg-olive-700"
          >
            Import CSV
          </button>
          {showAddButton && (
            <button
              onClick={handleCreateProduct}
              className="rounded-xl bg-olive-600 px-4 py-3 text-sm text-white font-semibold hover:bg-olive-700 transition-colors whitespace-nowrap"
            >
              + Add Product
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[1400px] w-full text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-200">
                <th className="px-4 py-3 text-left">Photo</th>
                <th className="px-4 py-3 text-left">Brand</th>
                <th className="px-4 py-3 text-left">Style</th>
                <th className="px-4 py-3 text-left relative">
                  <button
                    type="button"
                    onClick={() => setOpenFilter(openFilter === "category" ? null : "category")}
                    className="inline-flex items-center gap-1 hover:text-zinc-700"
                  >
                    Category <span className="text-xs">▼</span>
                  </button>
                  {openFilter === "category" && (
                    <div className="absolute left-0 mt-2 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg z-10">
                      {CATEGORY_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setCategoryFilter(option);
                            setOpenFilter(null);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 ${
                            categoryFilter === option ? "text-olive-700 font-semibold" : "text-zinc-600"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort("originalPrice")}
                    className="inline-flex items-center gap-1 hover:text-zinc-700"
                  >
                    Orig. Price <span className="text-xs">{getSortIndicator("originalPrice")}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort("price")}
                    className="inline-flex items-center gap-1 hover:text-zinc-700"
                  >
                    Price <span className="text-xs">{getSortIndicator("price")}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-center">Discount</th>
                <th className="px-4 py-3 text-right relative">
                  <button
                    type="button"
                    onClick={() => setOpenFilter(openFilter === "stock" ? null : "stock")}
                    className="inline-flex items-center gap-1 hover:text-zinc-700"
                  >
                    Stock <span className="text-xs">▼</span>
                  </button>
                  {openFilter === "stock" && (
                    <div className="absolute left-0 mt-2 w-40 rounded-lg border border-zinc-200 bg-white shadow-lg z-10">
                      {STOCK_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setStockFilter(option);
                            setOpenFilter(null);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 ${
                            stockFilter === option ? "text-olive-700 font-semibold" : "text-zinc-600"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </th>
                <th className="px-4 py-3 text-left">Badges</th>
                <th className="px-4 py-3 text-left relative">
                  <button
                    type="button"
                    onClick={() => setOpenFilter(openFilter === "status" ? null : "status")}
                    className="inline-flex items-center gap-1 hover:text-zinc-700"
                  >
                    Status <span className="text-xs">▼</span>
                  </button>
                  {openFilter === "status" && (
                    <div className="absolute left-0 mt-2 w-36 rounded-lg border border-zinc-200 bg-white shadow-lg z-10">
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setStatusFilter(option);
                            setOpenFilter(null);
                            setCurrentPage(1);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 ${
                            statusFilter === option ? "text-olive-700 font-semibold" : "text-zinc-600"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </th>
                <th className="px-4 py-3 text-left">Updated</th>
              </tr>
            </thead>

            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-zinc-500">
                    {searchQuery ? "No products match your search." : "No data available."}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const isOnSale = product.originalPrice != null && product.originalPrice > product.price;
                  const discountPercent = isOnSale ? Math.round((1 - product.price / product.originalPrice!) * 100) : 0;
                  const productBadges = Array.isArray((product as { badges?: string[] }).badges)
                    ? (product as { badges: string[] }).badges
                    : [];
                  return (
                  <tr key={product.id} className="border-t border-zinc-200 hover:bg-zinc-50">
                    {/* Photo */}
                    <td className="px-4 py-3">
                      {product.imageUrl ? (
                        <div className="relative h-[52px] w-[52px] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                          <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="52px" />
                        </div>
                      ) : (
                        <div className="h-[52px] w-[52px] rounded-lg border border-dashed border-zinc-200 bg-zinc-50" />
                      )}
                    </td>
                    {/* Brand */}
                    <td className="px-4 py-3 text-zinc-900 font-semibold text-sm">{product.brand || "—"}</td>
                    {/* Style */}
                    <td className="px-4 py-3 text-zinc-500 text-sm">{product.sku || "—"}</td>
                    {/* Category */}
                    <td className="px-4 py-3 text-zinc-600 text-sm">{product.category || "—"}</td>
                    {/* Orig. Price */}
                    <td className="px-4 py-3 text-right text-sm">
                      {product.originalPrice != null ? (
                        <span className="text-zinc-600">${Math.round(product.originalPrice)}</span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    {/* Price (editable on click) */}
                    <td className="px-4 py-3 text-right">
                      {editingPriceId === product.id ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editOriginalPrice}
                              onChange={(e) => setEditOriginalPrice(e.target.value)}
                              className="w-20 rounded-lg border border-zinc-200 px-2 py-1 text-sm text-right text-zinc-500 focus:outline-none focus:ring-1 focus:ring-olive-500"
                              placeholder="Orig."
                            />
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-20 rounded-lg border border-zinc-300 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-olive-500"
                              placeholder="Price"
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
                    {/* Discount */}
                    <td className="px-4 py-3 text-center text-sm text-zinc-600">
                      {isOnSale ? `-${discountPercent}%` : ""}
                    </td>
                    {/* Stock */}
                    <td className="px-4 py-3 text-right text-zinc-700 text-sm">{product.stock ?? 0}</td>
                    {/* Badges */}
                    <td className="px-4 py-3">
                      {productBadges.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {productBadges.map((badge) => (
                            <span
                              key={badge}
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${getBadgeStyles(badge)}`}
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${
                          product.active
                            ? "bg-olive-100 text-olive-700 border-olive-200"
                            : "bg-zinc-100 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        {product.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {/* Updated */}
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span>{new Date(product.updatedAt).toISOString().slice(0, 10)}</span>
                        <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50"
                        >
                          Edit
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
                              title={isHot ? "Remove hot selling" : "Mark as hot selling"}
                            >
                              <Flame
                                size={14}
                                fill={isHot ? "currentColor" : "none"}
                              />
                            </button>
                          );
                        })()}
                        </div>
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
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
            {searchQuery && " (filtered)"}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50"
              >
                Previous
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
                Next
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
