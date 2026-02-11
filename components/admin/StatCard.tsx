interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "flat";
}

export default function StatCard({ icon, label, value, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-zinc-100">
      <div className="text-sm text-zinc-500">
        {icon} {label}
      </div>
      <div className="text-2xl font-bold text-zinc-900 mt-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {trend && (
        <div className="text-xs text-zinc-400 mt-1">
          {trend === "up" && "↑"}
          {trend === "down" && "↓"}
          {trend === "flat" && "→"}
        </div>
      )}
    </div>
  );
}
