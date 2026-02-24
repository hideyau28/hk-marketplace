"use client";

type Props = {
  accentColor?: string;
};

export default function NewBadge({ accentColor }: Props) {
  return (
    <span
      className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded text-white"
      style={{ backgroundColor: accentColor || "var(--tmpl-accent, #10b981)" }}
    >
      NEW
    </span>
  );
}
