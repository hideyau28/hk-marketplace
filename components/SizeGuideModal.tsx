"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type SizeGuideModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "shoes" | "clothing";
  locale: string;
};

// UK to other size conversions
const SHOE_SIZE_DATA = [
  { uk: "3", eu: "35.5", us: "4", cm: "22" },
  { uk: "3.5", eu: "36", us: "4.5", cm: "22.5" },
  { uk: "4", eu: "36.5", us: "5", cm: "23" },
  { uk: "4.5", eu: "37", us: "5.5", cm: "23.5" },
  { uk: "5", eu: "37.5", us: "6", cm: "24" },
  { uk: "5.5", eu: "38", us: "6.5", cm: "24.5" },
  { uk: "6", eu: "39", us: "7", cm: "25" },
  { uk: "6.5", eu: "39.5", us: "7.5", cm: "25.5" },
  { uk: "7", eu: "40", us: "8", cm: "26" },
  { uk: "7.5", eu: "40.5", us: "8.5", cm: "26.5" },
  { uk: "8", eu: "41", us: "9", cm: "27" },
  { uk: "8.5", eu: "42", us: "9.5", cm: "27.5" },
  { uk: "9", eu: "42.5", us: "10", cm: "28" },
  { uk: "9.5", eu: "43", us: "10.5", cm: "28.5" },
  { uk: "10", eu: "44", us: "11", cm: "29" },
  { uk: "10.5", eu: "44.5", us: "11.5", cm: "29.5" },
  { uk: "11", eu: "45", us: "12", cm: "30" },
  { uk: "11.5", eu: "46", us: "12.5", cm: "30.5" },
  { uk: "12", eu: "47", us: "13", cm: "31" },
];

const CLOTHING_SIZE_DATA = [
  { size: "S", chest: "86-91", waist: "71-76", hip: "86-91" },
  { size: "M", chest: "91-97", waist: "76-81", hip: "91-97" },
  { size: "L", chest: "97-102", waist: "81-86", hip: "97-102" },
  { size: "XL", chest: "102-107", waist: "86-91", hip: "102-107" },
  { size: "XXL", chest: "107-112", waist: "91-97", hip: "107-112" },
];

export default function SizeGuideModal({ isOpen, onClose, type, locale }: SizeGuideModalProps) {
  const isZh = locale === "zh-HK";
  const title = isZh ? "尺碼指南" : "Size Guide";
  const closeText = isZh ? "關閉" : "Close";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white dark:bg-zinc-900"
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {type === "shoes" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-zinc-100 dark:bg-zinc-800">
                        <th className="py-3 px-3 text-left font-bold text-zinc-900 dark:text-zinc-100">UK</th>
                        <th className="py-3 px-3 text-left font-medium text-zinc-700 dark:text-zinc-300">EU</th>
                        <th className="py-3 px-3 text-left font-medium text-zinc-700 dark:text-zinc-300">US</th>
                        <th className="py-3 px-3 text-left font-medium text-zinc-700 dark:text-zinc-300">CM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SHOE_SIZE_DATA.map((row, idx) => (
                        <tr
                          key={row.uk}
                          className={`border-b border-zinc-100 dark:border-zinc-800 ${
                            idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-800/50"
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">{row.uk}</td>
                          <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{row.eu}</td>
                          <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{row.us}</td>
                          <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{row.cm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-zinc-100 dark:bg-zinc-800">
                        <th className="py-3 px-3 text-left font-bold text-zinc-900 dark:text-zinc-100">
                          {isZh ? "尺碼" : "Size"}
                        </th>
                        <th className="py-3 px-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                          {isZh ? "胸圍 (cm)" : "Chest (cm)"}
                        </th>
                        <th className="py-3 px-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                          {isZh ? "腰圍 (cm)" : "Waist (cm)"}
                        </th>
                        <th className="py-3 px-3 text-left font-medium text-zinc-700 dark:text-zinc-300">
                          {isZh ? "臀圍 (cm)" : "Hip (cm)"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {CLOTHING_SIZE_DATA.map((row, idx) => (
                        <tr
                          key={row.size}
                          className={`border-b border-zinc-100 dark:border-zinc-800 ${
                            idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-800/50"
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">{row.size}</td>
                          <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{row.chest}</td>
                          <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{row.waist}</td>
                          <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">{row.hip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Close button */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={onClose}
                className="w-full rounded-lg bg-olive-600 py-3 text-white font-semibold hover:bg-olive-700"
              >
                {closeText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
