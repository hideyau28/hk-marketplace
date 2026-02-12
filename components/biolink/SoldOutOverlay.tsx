"use client";

export default function SoldOutOverlay() {
  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
      <span className="px-3 py-1.5 rounded-md bg-zinc-500 text-white font-bold text-sm">
        已售完
      </span>
    </div>
  );
}
