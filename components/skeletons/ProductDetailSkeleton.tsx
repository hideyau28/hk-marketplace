export default function ProductDetailSkeleton() {
  return (
    <div className="px-4 pb-24 pt-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Image skeleton */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-200 aspect-square animate-pulse" />

        {/* Content skeleton */}
        <div>
          {/* Brand */}
          <div className="h-4 w-20 bg-zinc-200 rounded animate-pulse" />

          {/* Title */}
          <div className="mt-3 h-7 w-full bg-zinc-200 rounded animate-pulse" />
          <div className="mt-1.5 h-7 w-3/4 bg-zinc-200 rounded animate-pulse" />

          {/* Price */}
          <div className="mt-4 h-6 w-28 bg-zinc-200 rounded animate-pulse" />

          {/* Trust badges */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
            <div className="h-4 w-36 bg-zinc-200 rounded animate-pulse" />
          </div>

          {/* Size chart link */}
          <div className="mt-4 h-4 w-20 bg-zinc-200 rounded animate-pulse" />

          {/* Description */}
          <div className="mt-5 space-y-2">
            <div className="h-4 w-full bg-zinc-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-zinc-200 rounded animate-pulse" />
          </div>

          {/* Desktop buttons */}
          <div className="mt-6 hidden gap-3 md:flex">
            <div className="h-12 w-36 bg-zinc-200 rounded-2xl animate-pulse" />
            <div className="h-12 w-28 bg-zinc-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Mobile bottom bar skeleton */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white/90 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="h-5 w-20 bg-zinc-200 rounded animate-pulse" />
          <div className="flex-1 h-12 bg-zinc-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
