"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Pencil, Plus, Eye, Copy, Check, X, Loader2, Star } from "lucide-react";
import ProductEditSheet from "./ProductEditSheet";
import { COVER_TEMPLATES, getCoverCSS } from "@/lib/cover-templates";

type Product = {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  images: string[];
  sizes: Record<string, unknown> | null;
  sizeSystem: string | null;
  featured?: boolean;
};

type Tenant = {
  name: string;
  slug: string;
  coverPhoto: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  tagline: string | null;
  location: string | null;
  coverTemplate: string | null;
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

  // Header editing state
  const [coverSheetOpen, setCoverSheetOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [editTagline, setEditTagline] = useState(tenant.tagline || "");
  const [editLocation, setEditLocation] = useState(tenant.location || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCover, setSavingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const isZh = locale === "zh-HK";
  const storeUrl = `wowlix.com/${tenant.slug}`;
  const brandColor = tenant.brandColor || "#FF9500";
  const coverBackground = getCoverCSS(tenant.coverTemplate, tenant.coverPhoto);

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

  // Save cover template
  const handleSelectCover = async (templateId: string) => {
    setSavingCover(true);
    try {
      await fetch("/api/admin/tenant-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverTemplate: templateId, coverPhoto: null }),
      });
      router.refresh();
    } catch {
      // ignore
    } finally {
      setSavingCover(false);
      setCoverSheetOpen(false);
    }
  };

  // Upload cover photo
  const handleUploadCoverPhoto = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;

    setSavingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.ok && uploadData.data?.url) {
        await fetch("/api/admin/tenant-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coverPhoto: uploadData.data.url }),
        });
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setSavingCover(false);
      setCoverSheetOpen(false);
    }
  };

  // Upload logo
  const handleUploadLogo = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.ok && uploadData.data?.url) {
        await fetch("/api/admin/tenant-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logoUrl: uploadData.data.url }),
        });
        router.refresh();
      }
    } catch {
      // ignore
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save tagline + location
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await fetch("/api/admin/tenant-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagline: editTagline.trim() || null,
          location: editLocation.trim() || null,
        }),
      });
      router.refresh();
    } catch {
      // ignore
    } finally {
      setSavingProfile(false);
      setProfileEditOpen(false);
    }
  };

  const isEmpty = initialProducts.length === 0;

  return (
    <div className="px-4 pb-4">
      {/* Cover / Header */}
      <div
        className="relative rounded-2xl overflow-hidden mb-6 -mx-4 -mt-0"
        style={{ background: coverBackground }}
      >
        {/* Edit cover button */}
        <button
          onClick={() => setCoverSheetOpen(true)}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
          title={isZh ? "改封面" : "Change cover"}
        >
          <Camera size={14} />
        </button>

        <div className="px-6 py-8 text-center text-white">
          {/* Avatar with edit */}
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-1 text-2xl font-bold">
              {uploadingLogo ? (
                <Loader2 size={20} className="animate-spin text-white/60" />
              ) : tenant.logoUrl ? (
                <img src={tenant.logoUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                tenant.name.charAt(0).toUpperCase()
              )}
            </div>
            <button
              onClick={() => logoInputRef.current?.click()}
              className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
              title={isZh ? "改頭像" : "Change avatar"}
            >
              <Camera size={10} />
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUploadLogo(e.target.files)}
            />
          </div>

          <h2 className="text-xl font-bold">{tenant.name}</h2>

          {/* Tagline display + edit button */}
          <button
            onClick={() => {
              setEditTagline(tenant.tagline || "");
              setEditLocation(tenant.location || "");
              setProfileEditOpen(true);
            }}
            className="inline-flex items-center gap-1 mt-1 text-sm text-white/70 hover:text-white transition-colors"
          >
            <span>{tenant.tagline || (isZh ? "加簡介" : "Add tagline")}</span>
            <Pencil size={11} />
          </button>

          {tenant.location && (
            <p className="text-xs text-white/50 mt-0.5">📍 {tenant.location}</p>
          )}

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 mt-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <span>{storeUrl}</span>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>

          {!isEmpty && (
            <div className="mt-3">
              <button
                onClick={handlePreview}
                className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
              >
                <Eye size={14} />
                {isZh ? "預覽" : "Preview"}
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
            {isZh ? "加你第一件商品" : "Add your first product"}
          </p>
          <p className="text-sm text-zinc-400 mt-1">
            {isZh ? "影相或上傳就搞掂" : "Take a photo or upload an image"}
          </p>
        </button>
      )}

      {/* Product grid */}
      {!isEmpty && (
        <div className="grid grid-cols-3 gap-3">
          {initialProducts.map((product) => (
            <div key={product.id} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
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
              </div>
              {/* Featured badge */}
              {product.featured && (
                <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-[#FF9500] rounded-full flex items-center justify-center shadow-sm">
                  <Star size={12} className="text-white fill-white" />
                </div>
              )}
              <div className="mt-1.5">
                <p className="text-xs text-zinc-600 truncate">{product.title}</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-zinc-900">${product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-zinc-400 line-through">${product.originalPrice}</span>
                  )}
                </div>
              </div>
              {/* Edit button */}
              <button
                onClick={() => handleEditProduct(product)}
                className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <Pencil size={13} className="text-zinc-600" />
              </button>
            </div>
          ))}

          {/* Add new product card */}
          <button
            onClick={handleNewProduct}
            className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center hover:border-[#FF9500] hover:bg-orange-50/50 transition-colors group"
          >
            <Plus size={24} className="text-zinc-400 group-hover:text-[#FF9500] transition-colors" />
            <span className="text-xs text-zinc-400 group-hover:text-[#FF9500] mt-1 transition-colors">
              {isZh ? "新增" : "Add"}
            </span>
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

      {/* Cover Template Picker Sheet */}
      {coverSheetOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setCoverSheetOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-zinc-300" />
            </div>
            <div className="flex items-center justify-between px-5 pb-3 border-b border-zinc-100">
              <h3 className="text-lg font-semibold text-zinc-900">
                {isZh ? "選擇封面" : "Choose Cover"}
              </h3>
              <button onClick={() => setCoverSheetOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-100">
                <X size={20} className="text-zinc-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {savingCover && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 size={24} className="animate-spin text-zinc-400" />
                </div>
              )}
              {!savingCover && (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {COVER_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        onClick={() => handleSelectCover(tmpl.id)}
                        className={`aspect-[16/9] rounded-xl overflow-hidden border-2 transition-colors ${
                          tenant.coverTemplate === tmpl.id && !tenant.coverPhoto
                            ? "border-[#FF9500]"
                            : "border-zinc-200 hover:border-zinc-400"
                        }`}
                      >
                        <div className="w-full h-full" style={{ background: tmpl.css }} />
                        <p className="text-[10px] text-zinc-600 mt-1 text-center">{tmpl.label}</p>
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-zinc-300 text-zinc-600 hover:border-[#FF9500] hover:text-[#FF9500] cursor-pointer transition-colors text-sm font-medium">
                    <Camera size={16} />
                    {isZh ? "上傳自己嘅圖" : "Upload your own image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadCoverPhoto(e.target.files)}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Profile Edit Sheet (tagline + location) */}
      {profileEditOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setProfileEditOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[60vh] flex flex-col animate-slide-up">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-zinc-300" />
            </div>
            <div className="flex items-center justify-between px-5 pb-3 border-b border-zinc-100">
              <h3 className="text-lg font-semibold text-zinc-900">
                {isZh ? "店舖簡介" : "Store Profile"}
              </h3>
              <button onClick={() => setProfileEditOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-100">
                <X size={20} className="text-zinc-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  {isZh ? "簡介" : "Tagline"}
                </label>
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  placeholder={isZh ? "例如：手工烏龍茶專門店" : "e.g. Handmade oolong tea shop"}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  {isZh ? "地點（可選）" : "Location (optional)"}
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder={isZh ? "例如：觀塘" : "e.g. Kwun Tong"}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-zinc-100">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full py-3 rounded-xl bg-[#FF9500] text-white font-semibold hover:bg-[#E68600] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {savingProfile && <Loader2 size={16} className="animate-spin" />}
                {isZh ? "儲存" : "Save"}
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
