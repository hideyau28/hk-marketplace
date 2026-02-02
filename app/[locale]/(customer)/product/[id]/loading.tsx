export default function ProductDetailLoading() {
  return (
    <div className="pb-40 pt-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Image Skeleton */}
        <div className="px-4 md:px-0">
          <div className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          {/* Thumbnail dots */}
          <div className="mt-3 flex justify-center gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-zinc-300 dark:bg-zinc-700 rounded-full animate-pulse" />
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="px-4 md:px-0 space-y-4">
          {/* Brand */}
          <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />

          {/* Title */}
          <div className="space-y-2">
            <div className="h-6 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>

          {/* Price */}
          <div className="h-8 w-28 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />

          {/* Trust badges */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>

          {/* Size chart link */}
          <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>

          {/* Size selector skeleton */}
          <div className="space-y-2">
            <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="flex flex-wrap gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Desktop buttons skeleton */}
          <div className="hidden md:flex gap-3 pt-2">
            <div className="flex-1 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="w-14 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Related products skeleton */}
      <div className="mt-6 px-4">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="aspect-square bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              <div className="p-2.5 space-y-2">
                <div className="h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile bottom bar skeleton */}
      <div className="fixed bottom-[56px] left-0 right-0 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 md:hidden z-40 px-4 py-3">
        <div className="flex gap-3">
          <div className="flex-1 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          <div className="w-14 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
