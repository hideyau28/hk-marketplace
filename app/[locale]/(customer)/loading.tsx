export default function CustomerLoading() {
  return (
    <div className="pb-[calc(96px+env(safe-area-inset-bottom))]">
      {/* Hero Skeleton */}
      <div className="px-4 pt-4">
        <div className="h-[200px] md:h-[280px] bg-zinc-200 rounded-3xl animate-pulse"></div>
        <div className="mt-3 flex justify-center gap-1.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 bg-zinc-300 rounded-full"></div>
          ))}
        </div>
      </div>

      {/* Category Grid Skeleton */}
      <section className="mt-12 px-4">
        <div className="h-6 w-48 bg-zinc-200 rounded animate-pulse mb-4"></div>
        <div className="grid grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-zinc-200">
              <div className="w-12 h-12 rounded-full bg-zinc-200 animate-pulse"></div>
              <div className="h-3 w-16 bg-zinc-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Filter Skeleton */}
      <section className="mt-8">
        <div className="h-6 w-32 bg-zinc-200 rounded animate-pulse mb-4 px-4"></div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 w-32 bg-zinc-200 rounded-full animate-pulse flex-shrink-0"></div>
          ))}
        </div>
      </section>

      {/* Product Rails Skeleton */}
      {[...Array(2)].map((_, railIndex) => (
        <section key={railIndex} className="mt-12 px-4">
          <div className="h-6 w-40 bg-zinc-200 rounded animate-pulse mb-4"></div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[160px]">
                <div className="h-[160px] bg-zinc-200 rounded-2xl animate-pulse mb-3"></div>
                <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse mb-2"></div>
                <div className="h-5 w-16 bg-zinc-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
