"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, Plus, Eye, Copy, Check, Star, Edit, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ProductEditSheet from "./ProductEditSheet";

type Product = {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  images: string[];
  videoUrl?: string | null;
  sizes: Record<string, unknown> | null;
  sizeSystem: string | null;
  hidden?: boolean;
  featured?: boolean;
  sortOrder?: number;
  createdAt?: string;
};

type Tenant = {
  name: string;
  slug: string;
  coverPhoto: string | null;
  logoUrl: string | null;
  brandColor: string | null;
};

type Props = {
  locale: string;
  tenant: Tenant;
  products: Product[];
  pendingOrders: number;
};

type QuickSort = "manual" | "newest" | "price-asc" | "price-desc";

// --- Sortable product card ---
function SortableProductCard({
  product,
  isEditMode,
  isSelected,
  onToggleSelect,
  onTap,
}: {
  product: Product;
  isEditMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onTap: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto" as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative">
      <div
        onClick={() => {
          if (isEditMode) return;
          onTap();
        }}
        className={isEditMode ? "" : "cursor-pointer"}
      >
        {/* Image */}
        <div
          className={`aspect-square rounded-xl overflow-hidden bg-zinc-100 border ${
            isSelected ? "border-[#FF9500] ring-2 ring-[#FF9500]/30" : "border-zinc-200"
          } ${product.hidden ? "opacity-50" : ""}`}
        >
          {product.imageUrl || product.images?.[0] ? (
            <img
              src={product.imageUrl || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-300">
              <Camera size={24} />
            </div>
          )}

          {/* Drag handle — edit mode only */}
          {isEditMode && (
            <button
              ref={setActivatorNodeRef}
              {...listeners}
              className="absolute top-1.5 left-1.5 w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center shadow-sm touch-none cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={14} className="text-zinc-500" />
            </button>
          )}

          {/* Hidden badge */}
          {product.hidden && !isEditMode && (
            <div className="absolute top-1.5 left-1.5 bg-zinc-900/80 text-white text-xs px-2 py-0.5 rounded-full">
              已隱藏
            </div>
          )}

          {/* Featured badge */}
          {product.featured && !isEditMode && (
            <div className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <Star size={10} fill="white" />
              精選
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-1.5">
          <p className="text-xs text-zinc-600 truncate">{product.title}</p>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-zinc-900">${product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-zinc-400 line-through">${product.originalPrice}</span>
            )}
          </div>
        </div>
      </div>

      {/* Checkbox — edit mode only */}
      {isEditMode && (
        <div className="flex justify-center mt-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? "bg-[#FF9500] border-[#FF9500] text-white"
                : "border-zinc-300 bg-white hover:border-zinc-400"
            }`}
          >
            {isSelected && <Check size={12} strokeWidth={3} />}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BioLinkDashboard({ locale, tenant, products: initialProducts, pendingOrders }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quickSort, setQuickSort] = useState<QuickSort>("manual");
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);

  const isZh = locale === "zh-HK";
  const storeUrl = `wowlix.com/${tenant.slug}`;
  const brandColor = tenant.brandColor || "#FF9500";

  // dnd-kit sensors — activationConstraint prevents accidental drags
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${storeUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  const handlePreview = () => {
    window.open(`/${locale}/${tenant.slug}`, "_blank");
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsNewProduct(false);
    setIsSheetOpen(true);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setIsNewProduct(true);
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setEditingProduct(null);
    setIsNewProduct(false);
  };

  const handleSheetSave = () => {
    handleSheetClose();
    router.refresh();
  };

  const enterEditMode = () => {
    setIsEditMode(true);
    setSelectedIds(new Set());
    setQuickSort("manual");
    setConfirmBatchDelete(false);
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setSelectedIds(new Set());
    setConfirmBatchDelete(false);
  };

  // --- Selection ---
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setConfirmBatchDelete(false);
  }, []);

  // --- Drag end → reorder + save ---
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...products];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setProducts(reordered);
    setQuickSort("manual");

    await fetch("/api/admin/products/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productIds: reordered.map((p) => p.id) }),
    });
  };

  // --- Quick sort ---
  const applyQuickSort = async (mode: QuickSort) => {
    setQuickSort(mode);
    let sorted: Product[];
    switch (mode) {
      case "newest":
        sorted = [...products].sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });
        break;
      case "price-asc":
        sorted = [...products].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted = [...products].sort((a, b) => b.price - a.price);
        break;
      default:
        return; // manual — no-op
    }
    setProducts(sorted);

    // Persist new order
    await fetch("/api/admin/products/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productIds: sorted.map((p) => p.id) }),
    });
  };

  // --- Batch actions ---
  const handleBatchHide = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    // Optimistic update — toggle: if all selected are hidden → show, else hide
    const allHidden = ids.every((id) => products.find((p) => p.id === id)?.hidden);
    const newHidden = !allHidden;

    setProducts((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, hidden: newHidden } : p))
    );
    setSelectedIds(new Set());

    await Promise.all(
      ids.map((id) =>
        fetch(`/api/admin/products/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ hidden: newHidden }),
        })
      )
    );
  };

  const handleBatchDelete = async () => {
    if (!confirmBatchDelete) {
      setConfirmBatchDelete(true);
      return;
    }

    const ids = Array.from(selectedIds);
    setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    setConfirmBatchDelete(false);

    await Promise.all(
      ids.map((id) =>
        fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      )
    );
  };

  const isEmpty = products.length === 0;
  const selectedCount = selectedIds.size;

  const quickSortButtons: { key: QuickSort; label: string }[] = [
    { key: "manual", label: isZh ? "手動" : "Manual" },
    { key: "newest", label: isZh ? "最新" : "Newest" },
    { key: "price-asc", label: isZh ? "平→貴" : "Low→High" },
    { key: "price-desc", label: isZh ? "貴→平" : "High→Low" },
  ];

  return (
    <div className="px-4 pb-4">
      {/* Cover / Header */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6 -mx-4 -mt-0"
        style={{
          background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)`,
        }}
      >
        <div className="px-6 py-8 text-center text-white">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              tenant.name.charAt(0).toUpperCase()
            )}
          </div>
          <h2 className="text-xl font-bold">{tenant.name}</h2>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 mt-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <span>{storeUrl}</span>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>

          {!isEmpty && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={handlePreview}
                className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
              >
                <Eye size={14} />
                {isZh ? "預覽" : "Preview"}
              </button>

              <button
                onClick={() => (isEditMode ? exitEditMode() : enterEditMode())}
                className={`inline-flex items-center gap-1.5 ${
                  isEditMode
                    ? "bg-white text-zinc-900 hover:bg-white/90"
                    : "bg-white/20 hover:bg-white/30 text-white"
                } text-sm font-medium px-4 py-2 rounded-full transition-colors`}
              >
                {isEditMode ? (
                  <>
                    <Check size={14} />
                    {isZh ? "完成" : "Done"}
                  </>
                ) : (
                  <>
                    <Edit size={14} />
                    {isZh ? "編輯" : "Edit"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick sort bar — edit mode only */}
      {isEditMode && !isEmpty && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {quickSortButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => applyQuickSort(btn.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                quickSort === btn.key
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <button
          onClick={handleNewProduct}
          className="w-full border-2 border-dashed border-zinc-300 rounded-2xl p-8 text-center hover:border-[#FF9500] hover:bg-orange-50/50 transition-colors group"
        >
          <div className="w-16 h-16 rounded-full bg-zinc-100 group-hover:bg-[#FF9500]/10 flex items-center justify-center mx-auto mb-4 transition-colors">
            <Camera size={28} className="text-zinc-400 group-hover:text-[#FF9500] transition-colors" />
          </div>
          <p className="text-lg font-semibold text-zinc-700 group-hover:text-[#FF9500] transition-colors">
            {isZh ? "加你第一件商品" : "Add your first product"}
          </p>
          <p className="text-sm text-zinc-400 mt-1">
            {isZh ? "影相或上傳就搞掂" : "Take a photo or upload an image"}
          </p>
        </button>
      )}

      {/* Product grid */}
      {!isEmpty && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={products.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-3">
              {products.map((product) => (
                <SortableProductCard
                  key={product.id}
                  product={product}
                  isEditMode={isEditMode}
                  isSelected={selectedIds.has(product.id)}
                  onToggleSelect={() => toggleSelect(product.id)}
                  onTap={() => handleEditProduct(product)}
                />
              ))}

              {/* Add new product card — normal mode only */}
              {!isEditMode && (
                <button
                  onClick={handleNewProduct}
                  className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center hover:border-[#FF9500] hover:bg-orange-50/50 transition-colors group"
                >
                  <Plus size={24} className="text-zinc-400 group-hover:text-[#FF9500] transition-colors" />
                  <span className="text-xs text-zinc-400 group-hover:text-[#FF9500] mt-1 transition-colors">
                    {isZh ? "新增" : "Add"}
                  </span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Bottom action bar — visible when items selected */}
      {isEditMode && selectedCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 shadow-lg px-4 py-3 flex items-center gap-3 safe-area-pb">
          <span className="text-sm font-medium text-zinc-700 mr-auto">
            {isZh ? `已選 ${selectedCount} 件` : `${selectedCount} selected`}
          </span>
          <button
            onClick={handleBatchHide}
            className="px-4 py-2 rounded-lg bg-zinc-100 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            {isZh ? "隱藏" : "Hide"}
          </button>
          <button
            onClick={handleBatchDelete}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              confirmBatchDelete
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-red-50 text-red-700 hover:bg-red-100"
            }`}
          >
            {confirmBatchDelete
              ? (isZh ? "確定刪除？" : "Confirm?")
              : (isZh ? "刪除" : "Delete")}
          </button>
          <button
            onClick={() => { setSelectedIds(new Set()); setConfirmBatchDelete(false); }}
            className="px-4 py-2 rounded-lg bg-zinc-100 text-sm font-medium text-zinc-500 hover:bg-zinc-200 transition-colors"
          >
            {isZh ? "取消" : "Cancel"}
          </button>
        </div>
      )}

      {/* Product Edit Sheet */}
      <ProductEditSheet
        isOpen={isSheetOpen}
        onClose={handleSheetClose}
        onSave={handleSheetSave}
        product={editingProduct}
        isNew={isNewProduct}
        locale={locale}
      />
    </div>
  );
}
