type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "accent";
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  const baseClass = "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium";
  const variantClass =
    variant === "accent"
      ? "bg-[#4a5d4a]/10 text-[#4a5d4a]"
      : "bg-zinc-100 text-zinc-600";

  return <span className={`${baseClass} ${variantClass}`}>{children}</span>;
}
