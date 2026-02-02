export default function ProductsLoading() {
  return (
    <div className="pb-20 pt-4">
      {/* Header skeleton */}
      <div className="px-4 mb-6">
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse shrink-0" />
          ))}
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex flex-col">
              {/* Image */}
              <div className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
              {/* Content */}
              <div className="pt-2.5 space-y-2">
                <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
