import { ProductRailSkeleton } from "@/components/skeletons";

export default function HomeLoading() {
  return (
    <div className="pb-[calc(96px+env(safe-area-inset-bottom))]">
      {/* Hero skeleton */}
      <div className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-200 aspect-[16/9] animate-pulse" />
      </div>

      {/* Category grid skeleton */}
      <section className="mt-6 px-4">
        <div className="h-6 w-32 bg-zinc-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-zinc-200 rounded-full animate-pulse" />
              <div className="h-3 w-12 bg-zinc-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      {/* Product rails skeleton */}
      <ProductRailSkeleton size="sm" count={4} />
      <ProductRailSkeleton size="lg" count={4} />
      <ProductRailSkeleton size="sm" count={4} />
      <ProductRailSkeleton size="lg" count={4} />
    </div>
  );
}
