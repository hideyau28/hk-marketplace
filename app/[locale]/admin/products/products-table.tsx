"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import type { Product } from "@prisma/client";
import { ProductModal } from "./product-modal";

type ProductsTableProps = {
  products: Product[];
  locale: Locale;
  currentActive?: string;
};

const ACTIVE_FILTERS = [
  { value: "", label: "All Products" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

function badgeClass(active: boolean) {
  return active
    ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/20"
    : "bg-white/10 text-white/70 border-white/10";
}

export function ProductsTable({ products, locale, currentActive }: ProductsTableProps) {
  const router = useRouter();
  const [selectedActive, setSelectedActive] = useState(currentActive || "");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex-1">
          <select
            value={selectedActive}
            onChange={(e) => handleActiveChange(e.target.value)}
            className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            {ACTIVE_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCreateProduct}
          className="rounded-2xl bg-white px-4 py-3 text-black font-semibold hover:bg-white/90"
        >
          + Add Product
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="text-white/60 border-b border-white/10">
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-white/60">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl && (
                          <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                            <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="text-white font-medium">{product.title}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70">{product.category || "—"}</td>
                    <td className="px-4 py-3 text-right text-white font-medium">HK$ {product.price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${badgeClass(
                          product.active
                        )}`}
                      >
                        {product.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/70">{new Date(product.updatedAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-white/60 text-sm">
          <div>Showing {products.length} products</div>
        </div>
      </div>

      {(selectedProduct || isCreating) && (
        <ProductModal product={selectedProduct} onClose={handleCloseModal} locale={locale} />
      )}
    </>
  );
}
