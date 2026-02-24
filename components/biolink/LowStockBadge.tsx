"use client";

type Props = {
  count: number;
};

export default function LowStockBadge({ count }: Props) {
  return (
    <span className="biolink-stock-pulse inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#FF9500] text-white">
      剩 {count} 件
    </span>
  );
}
