"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getDict, type Locale } from "@/lib/i18n";
import type { Product } from "@prisma/client";
import { ProductModal } from "./product-modal";
import CsvUpload from "@/components/admin/CsvUpload";

type ProductsTableProps = {
  products: Product[];
  locale: Locale;
  currentActive?: string;
  showAddButton?: boolean;
};

export function ProductsTable({ products, locale, currentActive, showAddButton }: ProductsTableProps) {
  const router = useRouter();
  const t = getDict(locale);
  const [selectedActive, setSelectedActive] = useState(currentActive || "");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);

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
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    {t.admin.common.noData}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-t border-zinc-200 hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl && (
                          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                            <Image src={product.imageUrl} alt={product.title} fill className="object-cover" sizes="40px" />
                          </div>
                        )}
                        <div className="text-zinc-900 font-medium">{product.title}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{product.category || "—"}</td>
                    <td className="px-4 py-3 text-right text-zinc-900 font-medium">${Math.round(product.price)}</td>
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
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-50"
                      >
                        {t.admin.common.edit}
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
