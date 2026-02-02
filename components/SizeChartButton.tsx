"use client";

import { useState } from "react";
import SizeChartModal from "./SizeChartModal";

type SizeChartButtonProps = {
  isKids: boolean;
  locale: "zh-HK" | "en";
};

export default function SizeChartButton({ isKids, locale }: SizeChartButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-olive-600 hover:text-olive-700 underline underline-offset-2"
      >
        {locale === "zh-HK" ? "尺碼對照表" : "Size Chart"}
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
