import ProductCardSkeleton from "./ProductCardSkeleton";

export default function ProductRailSkeleton({
  title,
  count = 4,
  size = "sm",
}: {
  title?: string;
  count?: number;
  size?: "sm" | "lg";
}) {
  return (
    <section className="mt-8">
      <div className="px-4">
        {title ? (
          <h2 className="text-zinc-900 text-lg font-semibold mb-3">{title}</h2>
        ) : (
          <div className="h-6 w-32 bg-zinc-200 rounded animate-pulse mb-3" />
        )}
      </div>

      {/* Mobile: horizontal scroll, Desktop: grid */}
      <div className="lg:px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] snap-x snap-mandatory pl-4 pr-4 lg:grid lg:grid-cols-4 xl:grid-cols-5 lg:gap-3 lg:overflow-visible lg:pl-0 lg:pr-0">
          {Array.from({ length: count }).map((_, idx) => (
            <div
              key={idx}
              className={
                (size === "lg" ? "w-[200px]" : "w-[160px]") +
                " shrink-0 snap-start lg:w-auto"
              }
            >
              <ProductCardSkeleton />
            </div>
          ))}
          <div className="w-10 shrink-0 lg:hidden" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
