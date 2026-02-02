"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import SizeChartModal from "./SizeChartModal";

type SizeChartButtonProps = {
  isKids: boolean;
  locale: string;
};

export default function SizeChartButton({ isKids, locale }: SizeChartButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm text-olive-600 hover:text-olive-700 dark:text-olive-400 dark:hover:text-olive-300"
      >
        <Ruler size={16} />
        <span className="underline underline-offset-2">
          {locale === "zh-HK" ? "尺碼對照表" : "Size Chart"}
        </span>
      </button>
      <SizeChartModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isKids={isKids}
        locale={locale}
      />
    </>
  );
}
