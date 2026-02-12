"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Pencil, Plus, Eye, Copy, Check, ChevronUp, ChevronDown, Trash2, EyeOff, Star, Edit, Loader2 } from "lucide-react";
import ProductEditSheet from "./ProductEditSheet";
import Image from "next/image";

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

export default function BioLinkDashboard({ locale, tenant, products: initialProducts, pendingOrders }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(tenant.coverPhoto);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const storeUrl = `wowlix.com/${tenant.slug}`;
  const brandColor = tenant.brandColor || "#FF9500";

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

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newProducts = [...products];
    [newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]];
    setProducts(newProducts);

    // Update sortOrder on server
    await fetch("/api/admin/products/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productIds: newProducts.map(p => p.id) }),
    });
  };

  const handleMoveDown = async (index: number) => {
    if (index === products.length - 1) return;

    const newProducts = [...products];
    [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];
    setProducts(newProducts);

    // Update sortOrder on server
    await fetch("/api/admin/products/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productIds: newProducts.map(p => p.id) }),
    });
  };

  const handleToggleHidden = async (product: Product) => {
    const newHidden = !product.hidden;

    // Optimistic update
    setProducts(products.map(p => p.id === product.id ? { ...p, hidden: newHidden } : p));

    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hidden: newHidden }),
    });
  };

  const handleToggleFeatured = async (product: Product) => {
    const newFeatured = !product.featured;

    // Optimistic update
    setProducts(products.map(p => p.id === product.id ? { ...p, featured: newFeatured } : p));

    await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ featured: newFeatured }),
    });
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`確定要刪除「${product.title}」？\n此操作無法復原。`)) {
      return;
    }

    // Optimistic update
    setProducts(products.filter(p => p.id !== product.id));

    await fetch(`/api/admin/products/${product.id}`, {
      method: "DELETE",
    });
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("請選擇圖片檔案");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("圖片大小不能超過 5MB");
      return;
    }

    setIsUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: {
          "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET || "",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error?.message || "上傳失敗");
      }

      const url = data.data.url;
      setCoverPhoto(url);

      // Update tenant settings
      await fetch("/api/admin/tenant-settings", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ coverPhoto: url }),
      });

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "上傳失敗");
    } finally {
      setIsUploadingCover(false);
      // Reset file input
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    }
  };

  const isEmpty = products.length === 0;

  return (
    <div className="px-4 pb-4">
      {/* Cover / Header */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6 -mx-4 -mt-0"
      >
        {/* Background Image or Gradient */}
        {coverPhoto ? (
          <div className="absolute inset-0">
            <Image
              src={coverPhoto}
              alt="Cover"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)`,
            }}
          />
        )}

        {/* Edit Cover Button */}
        {isEditMode && (
          <div className="absolute top-3 right-3 z-10">
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={isUploadingCover}
              className="inline-flex items-center gap-1.5 bg-white/90 hover:bg-white text-zinc-900 text-xs font-medium px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
            >
              {isUploadingCover ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  {locale === "zh-HK" ? "上傳中..." : "Uploading..."}
                </>
              ) : (
                <>
                  <Camera size={12} />
                  {locale === "zh-HK" ? "更換封面" : "Change Cover"}
                </>
              )}
            </button>
          </div>
        )}

        <div className="relative px-6 py-8 text-center text-white">
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
                {locale === "zh-HK" ? "預覽" : "Preview"}
              </button>

              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`inline-flex items-center gap-1.5 ${
                  isEditMode
                    ? "bg-white text-zinc-900 hover:bg-white/90"
                    : "bg-white/20 hover:bg-white/30 text-white"
                } text-sm font-medium px-4 py-2 rounded-full transition-colors`}
              >
                {isEditMode ? (
                  <>
                    <Check size={14} />
                    {locale === "zh-HK" ? "完成" : "Done"}
                  </>
                ) : (
                  <>
                    <Edit size={14} />
                    {locale === "zh-HK" ? "編輯" : "Edit"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

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
            {locale === "zh-HK" ? "加你第一件商品" : "Add your first product"}
          </p>
          <p className="text-sm text-zinc-400 mt-1">
            {locale === "zh-HK" ? "影相或上傳就搞掂" : "Take a photo or upload an image"}
          </p>
        </button>
      )}

      {/* Product grid */}
      {!isEmpty && (
        <div className="grid grid-cols-3 gap-3">
          {products.map((product, index) => (
            <div key={product.id} className="relative group">
              <div
                className={`aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 ${
                  product.hidden ? "opacity-50" : ""
                }`}
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

              <div className="mt-1.5">
                <p className="text-xs text-zinc-600 truncate">{product.title}</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-zinc-900">${product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-zinc-400 line-through">${product.originalPrice}</span>
                  )}
                </div>
              </div>

              {/* Edit mode actions */}
              {isEditMode && (
                <div className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center gap-2 p-2">
                  {/* Reorder buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp size={16} className="text-zinc-700" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === products.length - 1}
                      className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown size={16} className="text-zinc-700" />
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                      title="編輯"
                    >
                      <Pencil size={14} className="text-blue-700" />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                      title="刪除"
                    >
                      <Trash2 size={14} className="text-red-700" />
                    </button>
                  </div>

                  {/* Toggle buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleHidden(product)}
                      className={`w-8 h-8 ${
                        product.hidden ? "bg-zinc-200" : "bg-zinc-100"
                      } rounded-full flex items-center justify-center hover:bg-zinc-200 transition-colors`}
                      title={product.hidden ? "顯示" : "隱藏"}
                    >
                      {product.hidden ? (
                        <Eye size={14} className="text-zinc-700" />
                      ) : (
                        <EyeOff size={14} className="text-zinc-700" />
                      )}
                    </button>
                    <button
                      onClick={() => handleToggleFeatured(product)}
                      className={`w-8 h-8 ${
                        product.featured ? "bg-amber-200" : "bg-zinc-100"
                      } rounded-full flex items-center justify-center hover:bg-amber-200 transition-colors`}
                      title={product.featured ? "取消精選" : "精選"}
                    >
                      <Star
                        size={14}
                        className={product.featured ? "text-amber-700" : "text-zinc-700"}
                        fill={product.featured ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Normal mode edit button (hover only) */}
              {!isEditMode && (
                <button
                  onClick={() => handleEditProduct(product)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <Pencil size={13} className="text-zinc-600" />
                </button>
              )}
            </div>
          ))}

          {/* Add new product card */}
          {!isEditMode && (
            <button
              onClick={handleNewProduct}
              className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center hover:border-[#FF9500] hover:bg-orange-50/50 transition-colors group"
            >
              <Plus size={24} className="text-zinc-400 group-hover:text-[#FF9500] transition-colors" />
              <span className="text-xs text-zinc-400 group-hover:text-[#FF9500] mt-1 transition-colors">
                {locale === "zh-HK" ? "新增" : "Add"}
              </span>
            </button>
          )}
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
