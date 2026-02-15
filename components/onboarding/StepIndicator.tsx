"use client";

import type { Locale } from "@/lib/i18n";

interface StepIndicatorProps {
  total: number;
  current: number;
  locale?: Locale;
}

export default function StepIndicator({ total, current, locale }: StepIndicatorProps) {
  const percentage = (current / total) * 100;
  const isZh = locale === "zh-HK";

  return (
    <div className="mt-6">
      {/* Progress bar */}
      <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#FF9500] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Step text */}
      <p className="text-center text-xs text-zinc-400 mt-2">
        {isZh ? `第 ${current} 步（共 ${total} 步）` : `Step ${current} of ${total}`}
      </p>
    </div>
  );
}
