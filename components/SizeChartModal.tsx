"use client";

import { X } from "lucide-react";

type SizeChartModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isKids: boolean;
  locale: string;
};

// Kids size chart data
const TODDLER_SIZES = [
  { us: "2C", uk: "1.5", eu: "17", cm: "8" },
  { us: "3C", uk: "2.5", eu: "18.5", cm: "9" },
  { us: "4C", uk: "3.5", eu: "19.5", cm: "10" },
  { us: "5C", uk: "4.5", eu: "21", cm: "11" },
  { us: "6C", uk: "5.5", eu: "22", cm: "12" },
  { us: "7C", uk: "6", eu: "23.5", cm: "13" },
  { us: "8C", uk: "7", eu: "25", cm: "14" },
  { us: "9C", uk: "8", eu: "26", cm: "15" },
  { us: "10C", uk: "9", eu: "27", cm: "16" },
];

const PRESCHOOL_SIZES = [
  { us: "10.5C", uk: "9.5", eu: "27.5", cm: "16.5" },
  { us: "11C", uk: "10", eu: "28", cm: "17" },
  { us: "11.5C", uk: "10.5", eu: "28.5", cm: "17.5" },
  { us: "12C", uk: "11", eu: "29.5", cm: "18" },
  { us: "12.5C", uk: "11.5", eu: "30", cm: "18.5" },
  { us: "13C", uk: "12", eu: "31", cm: "19" },
  { us: "13.5C", uk: "12.5", eu: "31.5", cm: "19.5" },
  { us: "1Y", uk: "13", eu: "32", cm: "20" },
  { us: "1.5Y", uk: "13.5", eu: "32.5", cm: "20.5" },
  { us: "2Y", uk: "1", eu: "33.5", cm: "21" },
  { us: "2.5Y", uk: "1.5", eu: "34", cm: "21.5" },
  { us: "3Y", uk: "2", eu: "35", cm: "22" },
];

const GRADE_SCHOOL_SIZES = [
  { us: "3.5Y", uk: "3", eu: "35.5", cm: "22.5" },
  { us: "4Y", uk: "3.5", eu: "36", cm: "23" },
  { us: "4.5Y", uk: "4", eu: "36.5", cm: "23.5" },
  { us: "5Y", uk: "4.5", eu: "37.5", cm: "24" },
  { us: "5.5Y", uk: "5", eu: "38", cm: "24.5" },
  { us: "6Y", uk: "5.5", eu: "38.5", cm: "25" },
  { us: "6.5Y", uk: "6", eu: "39", cm: "25.5" },
  { us: "7Y", uk: "6", eu: "40", cm: "25.5" },
];

// Adult size chart data
const ADULT_SIZES = [
  { us: "6", uk: "5.5", eu: "38.5", cm: "24" },
  { us: "6.5", uk: "6", eu: "39", cm: "24.5" },
  { us: "7", uk: "6", eu: "40", cm: "25" },
  { us: "7.5", uk: "6.5", eu: "40.5", cm: "25.5" },
  { us: "8", uk: "7", eu: "41", cm: "26" },
  { us: "8.5", uk: "7.5", eu: "42", cm: "26.5" },
  { us: "9", uk: "8", eu: "42.5", cm: "27" },
  { us: "9.5", uk: "8.5", eu: "43", cm: "27.5" },
  { us: "10", uk: "9", eu: "44", cm: "28" },
  { us: "10.5", uk: "9.5", eu: "44.5", cm: "28.5" },
  { us: "11", uk: "10", eu: "45", cm: "29" },
  { us: "11.5", uk: "10.5", eu: "45.5", cm: "29.5" },
  { us: "12", uk: "11", eu: "46", cm: "30" },
  { us: "13", uk: "12", eu: "47.5", cm: "31" },
];

function SizeTable({
  title,
  sizes,
}: {
  title: string;
  sizes: { us: string; uk: string; eu: string; cm: string }[];
}) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{title}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-800">
              <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">US</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">UK</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">EU</th>
              <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">CM</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((size, idx) => (
              <tr
                key={size.us}
                className={idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-800/50"}
              >
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-100">{size.us}</td>
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-100">{size.uk}</td>
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-100">{size.eu}</td>
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-100">{size.cm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SizeChartModal({
  isOpen,
  onClose,
  isKids,
  locale,
}: SizeChartModalProps) {
  if (!isOpen) return null;

  const title = isKids
    ? locale === "zh-HK"
      ? "童裝尺碼對照表"
      : "Kids Size Chart"
    : locale === "zh-HK"
      ? "成人尺碼對照表"
      : "Adult Size Chart";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 mx-auto max-w-lg bg-white dark:bg-zinc-900 rounded-2xl max-h-[80vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isKids ? (
            <>
              <SizeTable
                title="Toddler (TD) - US 2C-10C"
                sizes={TODDLER_SIZES}
              />
              <SizeTable
                title="Preschool (PS) - US 10.5C-3Y"
                sizes={PRESCHOOL_SIZES}
              />
              <SizeTable
                title="Grade School (GS) - US 3.5Y-7Y"
                sizes={GRADE_SCHOOL_SIZES}
              />
            </>
          ) : (
            <SizeTable
              title={locale === "zh-HK" ? "成人尺碼" : "Adult Sizes"}
              sizes={ADULT_SIZES}
            />
          )}

          {/* Tip */}
          <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs text-zinc-600 dark:text-zinc-400">
            {locale === "zh-HK"
              ? "提示：建議量度腳長（CM）選擇合適尺碼。如介乎兩個尺碼之間，建議選擇較大尺碼。"
              : "Tip: Measure your foot length (CM) to find the right size. If between sizes, go with the larger one."}
          </div>
        </div>
      </div>
    </>
  );
}
