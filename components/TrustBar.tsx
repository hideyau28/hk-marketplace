import { ShieldCheck, Package, Plane, CreditCard } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    labelEn: "100% Authenticated",
    labelZh: "正品保證",
  },
  {
    icon: Package,
    labelEn: "Ships from Hong Kong",
    labelZh: "香港直送",
  },
  {
    icon: Plane,
    labelEn: "3-7 Day Delivery",
    labelZh: "3-7 日送達",
  },
  {
    icon: CreditCard,
    labelEn: "Secure Payment",
    labelZh: "安全付款",
  },
] as const;

export default function TrustBar({
  locale,
  region,
}: {
  locale: string;
  region?: string | null;
}) {
  // Only show for sneaker stores (ME region)
  if (region !== "ME") return null;

  const isZh = locale === "zh-HK";

  return (
    <section className="px-4 py-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.labelEn}
            className="flex items-center gap-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <item.icon
              size={20}
              className="shrink-0 text-emerald-600 dark:text-emerald-400"
              strokeWidth={2}
            />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 leading-tight">
              {isZh ? item.labelZh : item.labelEn}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
