"use client";

interface StepIndicatorProps {
  total: number;
  current: number;
}

export default function StepIndicator({ total, current }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            i < current ? "bg-[#FF9500]" : "bg-zinc-300"
          }`}
        />
      ))}
    </div>
  );
}
