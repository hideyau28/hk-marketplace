import { ProductGridSkeleton } from "@/components/skeletons";

export default function SearchLoading() {
  return (
    <div className="min-h-screen pb-[calc(96px+env(safe-area-inset-bottom))]">
      {/* Search header skeleton */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-zinc-100 px-4 py-3">
        <div className="h-11 bg-zinc-200 rounded-full animate-pulse" />
      </div>

      <div className="px-4 pt-6">
        {/* Results count skeleton */}
        <div className="h-4 w-28 bg-zinc-200 rounded animate-pulse mb-4" />

        {/* Grid skeleton */}
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
