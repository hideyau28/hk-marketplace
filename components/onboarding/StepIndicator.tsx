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
      <div className="h-px bg-wlx-mist overflow-hidden">
        <div
          className="h-full bg-wlx-ink transition-all duration-500"
          style={{
            width: `${percentage}%`,
            transitionTimingFunction: "var(--wlx-ease)",
          }}
        />
      </div>
      <p className="mt-3 text-center text-[11px] uppercase tracking-[0.22em] text-wlx-stone">
        {isZh
          ? `第 ${current} 步 · 共 ${total} 步`
          : `Step ${current} of ${total}`}
      </p>
    </div>
  );
}
