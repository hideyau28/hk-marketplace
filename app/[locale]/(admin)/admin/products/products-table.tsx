"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { type Locale } from "@/lib/i18n";
import type { Product } from "@prisma/client";
import { ProductModal } from "./product-modal";
import CsvUpload from "@/components/admin/CsvUpload";
import { Star, Flame, Search, Check, X, Pencil, Eye, EyeOff } from "lucide-react";
import { toggleFeatured, toggleHotSelling, updatePrice, toggleHidden } from "./actions";

const ITEMS_PER_PAGE = 50;

// Extended Product type to include promotionBadges and featured fields
type ProductWithBadges = Product & {
  promotionBadges?: string[];
  featured?: boolean;
  hidden?: boolean;
  images?: string[];
};

type ProductsTableProps = {
  products: ProductWithBadges[];
  locale: Locale;
  currentActive?: string;
  showAddButton?: boolean;
};

type Badge = {
  id: string;
  nameZh: string;
  nameEn: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

const BADGE_PRESETS = [
  { key: "red", color: "#EF4444", label: "限量/熱賣" },
  { key: "green", color: "#22C55E", label: "現貨/新品" },
  { key: "black", color: "#18181B", label: "經典" },
  { key: "blue", color: "#3B82F6", label: "推薦" },
  { key: "orange", color: "#F97316", label: "優惠" },
];

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
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [badgeError, setBadgeError] = useState<string | null>(null);
  const [badgeFormError, setBadgeFormError] = useState<string | null>(null);
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);
  const [badgeNameZh, setBadgeNameZh] = useState("");
  const [badgeNameEn, setBadgeNameEn] = useState("");
  const [badgeColor, setBadgeColor] = useState(BADGE_PRESETS[0]?.color || "#EF4444");
  const [badgeSaving, setBadgeSaving] = useState(false);
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
  // Show hidden toggle & multi-select
  const [showHidden, setShowHidden] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [togglingHidden, setTogglingHidden] = useState<string | null>(null);
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

  const badgeMap = useMemo(() => new Map(badges.map((badge) => [badge.id, badge])), [badges]);

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
      // 隱藏商品：showHidden off 就唔顯示
      if (p.hidden && !showHidden) return false;

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
  }, [products, searchQuery, categoryFilter, statusFilter, stockFilter, sortKey, sortDirection, showHidden]);

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

  const handleToggleHidden = async (productId: string, currentHidden: boolean) => {
    setTogglingHidden(productId);
    try {
      await toggleHidden(productId, !currentHidden);
      router.refresh();
    } catch (error) {
      console.error("Failed to toggle hidden:", error);
    } finally {
      setTogglingHidden(null);
    }
  };

  const handleBulkUnhide = async () => {
    for (const id of selectedIds) {
      await toggleHidden(id, false);
    }
    setSelectedIds(new Set());
    router.refresh();
  };

  const handleBulkHide = async () => {
    for (const id of selectedIds) {
      await toggleHidden(id, true);
    }
    setSelectedIds(new Set());
    router.refresh();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedProducts.map((p) => p.id)));
    }
  };

  const hiddenCount = products.filter((p) => p.hidden).length;

  const resetBadgeForm = () => {
    setEditingBadgeId(null);
    setBadgeNameZh("");
    setBadgeNameEn("");
    setBadgeColor(BADGE_PRESETS[0]?.color || "#EF4444");
    setBadgeFormError(null);
  };

  const loadBadges = async () => {
    setBadgeLoading(true);
    setBadgeError(null);
    try {
      const res = await fetch("/api/admin/badges");
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setBadgeError(json?.error?.message || "Failed to load badges.");
        return;
      }
      setBadges(json.data?.badges || []);
    } catch (error) {
      console.error("Failed to load badges:", error);
      setBadgeError("Failed to load badges.");
    } finally {
      setBadgeLoading(false);
    }
  };

  const handleEditBadge = (badge: Badge) => {
    setEditingBadgeId(badge.id);
    setBadgeNameZh(badge.nameZh);
    setBadgeNameEn(badge.nameEn);
    setBadgeColor(badge.color);
    setBadgeFormError(null);
  };

  const handleDeleteBadge = async (badge: Badge) => {
    const confirmed = window.confirm(`Delete badge "${badge.nameZh}"?`);
    if (!confirmed) return;
    const res = await fetch(`/api/admin/badges/${badge.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      alert(json?.error?.message || "Failed to delete badge.");
      return;
    }
    if (editingBadgeId === badge.id) {
      resetBadgeForm();
    }
    await loadBadges();
  };

  const handleSaveBadge = async () => {
    setBadgeFormError(null);
    if (!badgeNameZh.trim() || !badgeNameEn.trim()) {
      setBadgeFormError("Please provide both Chinese and English names.");
      return;
    }
    if (!badgeColor.trim()) {
      setBadgeFormError("Please provide a color.");
      return;
    }
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(badgeColor.trim())) {
      setBadgeFormError("Color must be a valid hex value (e.g. #EF4444).");
      return;
    }

    setBadgeSaving(true);
    try {
      const payload = {
        nameZh: badgeNameZh.trim(),
        nameEn: badgeNameEn.trim(),
        color: badgeColor.trim(),
      };
      const res = await fetch(
        editingBadgeId ? `/api/admin/badges/${editingBadgeId}` : "/api/admin/badges",
        {
          method: editingBadgeId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setBadgeFormError(json?.error?.message || "Failed to save badge.");
        return;
      }
      await loadBadges();
      resetBadgeForm();
    } catch (error) {
      console.error("Failed to save badge:", error);
      setBadgeFormError("Failed to save badge.");
    } finally {
      setBadgeSaving(false);
    }
  };

  useEffect(() => {
    loadBadges();
  }, []);

  useEffect(() => {
    if (isBadgeModalOpen && badges.length === 0) {
      loadBadges();
    }
  }, [isBadgeModalOpen, badges.length]);

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
            onClick={() => setIsBadgeModalOpen(true)}
            className="rounded-xl bg-olive-600 px-4 py-3 text-sm text-white font-semibold hover:bg-olive-700"
          >
            Manage Badges
          </button>
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
          {hiddenCount > 0 && (
            <button
              onClick={() => setShowHidden(!showHidden)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                showHidden
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200"
              }`}
            >
              {showHidden ? <Eye size={14} /> : <EyeOff size={14} />}
              {showHidden ? `隱藏商品 (${hiddenCount})` : `顯示隱藏 (${hiddenCount})`}
            </button>
          )}
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

      {/* Multi-select action bar */}
      {selectedIds.size > 0 && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-olive-200 bg-olive-50 px-4 py-2.5">
          <span className="text-sm text-olive-700 font-medium">
            已選 {selectedIds.size} 件
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {/* 顯示（unhide）按鈕 — 只喺有 hidden 嘅 selection 先出 */}
            {Array.from(selectedIds).some((id) => products.find((p) => p.id === id)?.hidden) && (
              <button
                onClick={handleBulkUnhide}
                className="rounded-lg bg-white border border-olive-200 px-3 py-1.5 text-xs text-olive-700 font-medium hover:bg-olive-100 transition-colors flex items-center gap-1"
              >
                <Eye size={12} /> 顯示
              </button>
            )}
            {Array.from(selectedIds).some((id) => !products.find((p) => p.id === id)?.hidden) && (
              <button
                onClick={handleBulkHide}
                className="rounded-lg bg-white border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 font-medium hover:bg-zinc-100 transition-colors flex items-center gap-1"
              >
                <EyeOff size={12} /> 隱藏
              </button>
            )}
            <button
              onClick={() => setSelectedIds(new Set())}
              className="rounded-lg bg-white border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[1400px] w-full text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-200">
                <th className="px-2 py-1 text-center w-8">
                  <input
                    type="checkbox"
                    checked={paginatedProducts.length > 0 && selectedIds.size === paginatedProducts.length}
                    onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 accent-olive-600"
                  />
                </th>
                <th className="px-2 py-1 text-left">Photo</th>
                <th className="px-2 py-1 text-left">Brand</th>
                <th className="px-2 py-1 text-left">Style</th>
                <th className="px-2 py-1 text-left relative">
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
                <th className="px-2 py-1 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort("originalPrice")}
                    className="inline-flex items-center gap-1 hover:text-zinc-700"
                  >
                    Orig. Price <span className="text-xs">{getSortIndicator("originalPrice")}</span>
                  </button>
                </th>
                <th className="px-2 py-1 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort("price")}
                    className="inline-flex items-center gap-1 hover:text-zinc-700 ml-auto"
                  >
                    Net Price <span className="text-xs">{getSortIndicator("price")}</span>
                  </button>
                </th>
                <th className="px-2 py-1 text-center">Discount</th>
                <th className="px-2 py-1 text-right relative">
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
                <th className="px-2 py-1 text-left">Badges</th>
                <th className="px-2 py-1 text-left relative">
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
                <th className="px-2 py-1 text-left">Updated</th>
              </tr>
            </thead>

            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-zinc-500">
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
                  const badgeDisplay = productBadges.map((badge) => {
                    const mapped = badgeMap.get(badge);
                    if (mapped) {
                      return {
                        key: mapped.id,
                        label: `${mapped.nameZh} / ${mapped.nameEn}`,
                        color: mapped.color,
                      };
                    }
                    return { key: badge, label: badge, color: null };
                  });
                  return (
                  <tr key={product.id} className={`border-t border-zinc-200 hover:bg-zinc-50 ${product.hidden ? "opacity-50" : ""}`}>
                    {/* Checkbox */}
                    <td className="px-2 py-1 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="h-3.5 w-3.5 accent-olive-600"
                      />
                    </td>
                    {/* Photo */}
                    <td className="px-2 py-1">
                      {product.imageUrl ? (
                        <div className="relative h-[36px] w-[36px] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                          <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="36px" />
                        </div>
                      ) : (
                        <div className="h-[36px] w-[36px] rounded-lg border border-dashed border-zinc-200 bg-zinc-50" />
                      )}
                    </td>
                    {/* Brand */}
                    <td className="px-2 py-1 text-zinc-900 font-semibold text-sm">{product.brand || "—"}</td>
                    {/* Style */}
                    <td className="px-2 py-1 text-zinc-500 text-sm">{product.sku || "—"}</td>
                    {/* Category */}
                    <td className="px-2 py-1 text-zinc-600 text-sm">{product.category || "—"}</td>
                    {/* Orig. Price */}
                    <td className="px-2 py-1 text-right text-sm">
                      {product.originalPrice != null ? (
                        <span className="text-zinc-600">${Math.round(product.originalPrice)}</span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    {/* Price (editable on click) */}
                    <td className="px-2 py-1 text-right">
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
                    <td className="px-2 py-1 text-center text-sm text-zinc-600">
                      {isOnSale ? `-${discountPercent}%` : ""}
                    </td>
                    {/* Stock */}
                    <td className="px-2 py-1 text-right text-zinc-700 text-sm">{product.stock ?? 0}</td>
                    {/* Badges */}
                    <td className="px-2 py-1">
                      {badgeDisplay.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {badgeDisplay.map((badge) => (
                            <span
                              key={badge.key}
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                badge.color ? "text-white" : getBadgeStyles(badge.label)
                              }`}
                              style={badge.color ? { backgroundColor: badge.color } : undefined}
                            >
                              {badge.label}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-2 py-1">
                      <div className="flex flex-wrap items-center gap-1">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${
                            product.active
                              ? "bg-olive-100 text-olive-700 border-olive-200"
                              : "bg-zinc-100 text-zinc-600 border-zinc-200"
                          }`}
                        >
                          {product.active ? "Active" : "Inactive"}
                        </span>
                        {product.hidden && (
                          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-600">
                            已隱藏
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Updated */}
                    <td className="px-2 py-1 text-zinc-500 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span>{new Date(product.updatedAt).toISOString().slice(0, 10)}</span>
                        <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleHidden(product.id, !!product.hidden)}
                          disabled={togglingHidden === product.id}
                          className={`rounded-lg border px-2 py-1.5 text-xs transition-colors disabled:opacity-50 ${
                            product.hidden
                              ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                              : "border-zinc-200 bg-white text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
                          }`}
                          title={product.hidden ? "取消隱藏" : "隱藏"}
                        >
                          {product.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
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

      {isBadgeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsBadgeModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-4xl rounded-3xl border border-zinc-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">Manage Badges</h2>
                <p className="mt-1 text-sm text-zinc-500">Create, edit, and organize product badges.</p>
              </div>
              <button
                onClick={() => setIsBadgeModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            {badgeError && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {badgeError}
              </div>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-zinc-800">Badge List</h3>
                  <button
                    onClick={loadBadges}
                    disabled={badgeLoading}
                    className="text-xs text-zinc-500 hover:text-zinc-700 disabled:opacity-50"
                  >
                    Refresh
                  </button>
                </div>
                {badgeLoading ? (
                  <div className="py-8 text-center text-sm text-zinc-500">Loading badges...</div>
                ) : badges.length === 0 ? (
                  <div className="py-8 text-center text-sm text-zinc-500">No badges yet</div>
                ) : (
                  <div className="space-y-2">
                    {badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: badge.color }}
                          />
                          <div>
                            <div className="text-sm font-medium text-zinc-900">
                              {badge.nameZh} / {badge.nameEn}
                            </div>
                            <div className="text-xs text-zinc-400">{badge.color}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditBadge(badge)}
                            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBadge(badge)}
                            className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-800">
                    {editingBadgeId ? "Edit Badge" : "Add Badge"}
                  </h3>
                  {editingBadgeId && (
                    <button
                      onClick={resetBadgeForm}
                      className="text-xs text-zinc-500 hover:text-zinc-700"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {badgeFormError && (
                  <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {badgeFormError}
                  </div>
                )}

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Name (Chinese)</label>
                    <input
                      value={badgeNameZh}
                      onChange={(e) => setBadgeNameZh(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                      placeholder="店長推介"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Name (English)</label>
                    <input
                      value={badgeNameEn}
                      onChange={(e) => setBadgeNameEn(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                      placeholder="Staff Pick"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Color Presets</label>
                    <div className="flex flex-wrap gap-2">
                      {BADGE_PRESETS.map((preset) => {
                        const isSelected = badgeColor.toUpperCase() === preset.color.toUpperCase();
                        return (
                          <button
                            key={preset.key}
                            type="button"
                            onClick={() => setBadgeColor(preset.color)}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                              isSelected
                                ? "border-olive-500 bg-olive-50 text-olive-700"
                                : "border-zinc-200 bg-white text-zinc-700"
                            }`}
                          >
                            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.color }} />
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Custom Hex</label>
                    <input
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                      placeholder="#EF4444"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Live Preview</label>
                    <div className="h-20 w-20 rounded-xl bg-zinc-200 relative overflow-hidden">
                      <span
                        className="absolute top-1 left-1 px-2 py-0.5 text-[10px] font-semibold text-white rounded"
                        style={{ backgroundColor: badgeColor || "#6B7A2F" }}
                      >
                        {(badgeNameZh || badgeNameEn || "Badge").slice(0, 6)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleSaveBadge}
                      disabled={badgeSaving}
                      className="rounded-xl bg-olive-600 px-4 py-2 text-sm text-white font-semibold hover:bg-olive-700 disabled:opacity-50"
                    >
                      {editingBadgeId ? "Save Changes" : "Add Badge"}
                    </button>
                    <button
                      onClick={resetBadgeForm}
                      type="button"
                      className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(selectedProduct || isCreating) && (
        <ProductModal product={selectedProduct} onClose={handleCloseModal} onSaved={() => router.refresh()} locale={locale} />
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
