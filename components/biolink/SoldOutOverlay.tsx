"use client";

export default function SoldOutOverlay() {
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
      <span className="text-white font-bold text-sm tracking-wider uppercase">
        SOLD OUT
      </span>
    </div>
  );
}
