"use client";

type Props = {
  count: number;
  accentColor?: string;
};

export default function LowStockBadge({ count, accentColor }: Props) {
  return (
    <span
      className="biolink-stock-pulse inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded text-white"
      style={{ backgroundColor: accentColor || "var(--tmpl-accent, #FF9500)" }}
    >
      剩 {count} 件
    </span>
  );
}
