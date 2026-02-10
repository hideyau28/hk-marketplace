"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Pencil, Plus, Eye, Copy, Check } from "lucide-react";
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

  const isEmpty = initialProducts.length === 0;

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
            <div className="mt-3">
              <button
                onClick={handlePreview}
                className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
              >
                <Eye size={14} />
                {locale === "zh-HK" ? "預覽" : "Preview"}
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
              {locale === "zh-HK" ? "新增" : "Add"}
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
    </div>
  );
}
