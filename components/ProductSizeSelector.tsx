"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Translations } from "@/lib/translations";

type SizeSystem = "EU" | "US Men" | "US Women" | "UK" | "Universal";

type SizeSelectorProps = {
  sizeSystem: string | null;
  sizes: any;
  locale: string;
  onSizeSelect: (size: string, system: string) => void;
  selectedSize: string | null;
  selectedSystem: string | null;
  t: Translations;
};

const SHOE_SIZE_CHART = {
  EU: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
  "US Men": ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13"],
  "US Women": ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
  UK: ["3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"],
};

export default function ProductSizeSelector({
  sizeSystem,
  sizes,
  locale,
  onSizeSelect,
  selectedSize,
  selectedSystem,
  t,
}: SizeSelectorProps) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<SizeSystem>("EU");

  // If no sizes or sizeSystem, don't render anything
  if (!sizeSystem || !sizes) {
    return null;
  }

  const isMultiSystem = sizeSystem === "Multi";
  const availableSizes: Record<string, string[]> = isMultiSystem
    ? (sizes as Record<string, string[]>)
    : { [sizeSystem]: Array.isArray(sizes) ? sizes : [] };

  // Get the current size list based on active tab or system
  const currentSystem = isMultiSystem ? activeTab : sizeSystem;
  const currentSizes = availableSizes[currentSystem] || [];

  const texts = t.size;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{texts.selectSize}</label>
        {isMultiSystem && (
          <button
            type="button"
            onClick={() => setShowSizeGuide(true)}
            className="text-sm text-olive-600 hover:text-olive-700 underline"
          >
            {texts.sizeGuide}
          </button>
        )}
      </div>

      {/* Size system tabs for Multi */}
      {isMultiSystem && (
        <div className="flex gap-2 border-b border-zinc-200">
          {Object.keys(availableSizes).map((system) => (
            <button
              key={system}
              type="button"
              onClick={() => setActiveTab(system as SizeSystem)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === system
                  ? "border-b-2 border-olive-600 text-olive-600"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {system}
            </button>
          ))}
        </div>
      )}

      {/* Size grid - 4 columns on mobile for UK sizes, adjust for others */}
      <div className="grid grid-cols-4 gap-2">
        {currentSizes.map((size) => {
          const isSelected = selectedSize === size && selectedSystem === currentSystem;
          // Check if it's a UK size (starts with "UK ")
          const isUKSize = size.startsWith("UK ");
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSizeSelect(size, currentSystem)}
              className={`rounded-lg border py-2 font-medium transition-colors ${
                isUKSize ? "text-xs px-1" : "text-sm px-3"
              } ${
                isSelected
                  ? "border-olive-600 bg-olive-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={() => setShowSizeGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl bg-white p-6 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{texts.sizeChart}</h3>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="py-2 px-3 text-left font-medium text-zinc-900 dark:text-zinc-100">EU</th>
                      <th className="py-2 px-3 text-left font-medium text-zinc-900 dark:text-zinc-100">US Men</th>
                      <th className="py-2 px-3 text-left font-medium text-zinc-900 dark:text-zinc-100">US Women</th>
                      <th className="py-2 px-3 text-left font-medium text-zinc-900 dark:text-zinc-100">UK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SHOE_SIZE_CHART.EU.map((euSize, idx) => (
                      <tr key={euSize} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">{euSize}</td>
                        <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">{SHOE_SIZE_CHART["US Men"][idx] || "—"}</td>
                        <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">{SHOE_SIZE_CHART["US Women"][idx] || "—"}</td>
                        <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">{SHOE_SIZE_CHART.UK[idx] || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="w-full rounded-lg bg-olive-600 py-3 text-white font-semibold hover:bg-olive-700"
                >
                  {texts.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
