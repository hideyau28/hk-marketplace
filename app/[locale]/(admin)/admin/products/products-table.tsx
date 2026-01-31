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
  showAddButton?: boolean;
};

const ACTIVE_FILTERS = [
  { value: "", label: "All Products" },
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export function ProductsTable({ products, locale, currentActive, showAddButton }: ProductsTableProps) {
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
        <select
          value={selectedActive}
          onChange={(e) => handleActiveChange(e.target.value)}
          className="w-full max-w-xs rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300"
        >
          {ACTIVE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        {showAddButton && (
          <button
            onClick={handleCreateProduct}
            className="rounded-xl bg-olive-600 px-4 py-3 text-white font-semibold hover:bg-olive-700 transition-colors whitespace-nowrap"
          >
            + Add Product
          </button>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-200">
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
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-t border-zinc-200 hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl && (
                          <div className="h-10 w-10 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                            <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="text-zinc-900 font-medium">{product.title}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{product.category || "—"}</td>
                    <td className="px-4 py-3 text-right text-zinc-900 font-medium">HK$ {product.price.toFixed(2)}</td>
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
                    <td className="px-4 py-3 text-zinc-600">
                      {new Date(product.updatedAt).toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50"
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

        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-zinc-500 text-sm">
          <div>Showing {products.length} products</div>
        </div>
      </div>

      {(selectedProduct || isCreating) && (
        <ProductModal product={selectedProduct} onClose={handleCloseModal} locale={locale} />
      )}
    </>
  );
}
