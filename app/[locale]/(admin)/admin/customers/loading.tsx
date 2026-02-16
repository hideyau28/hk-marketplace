export default function CustomersLoading() {
  return (
    <div className="pl-16 pr-4 pb-16 pt-4">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse mb-2"></div>
          <div className="h-8 w-32 bg-zinc-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-zinc-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Sort tabs skeleton */}
      <div className="mt-4 flex gap-2">
        <div className="h-9 w-20 bg-zinc-200 rounded-full animate-pulse"></div>
        <div className="h-9 w-24 bg-zinc-200 rounded-full animate-pulse"></div>
      </div>

      {/* Search skeleton */}
      <div className="mt-4">
        <div className="h-12 w-full bg-zinc-200 rounded-2xl animate-pulse"></div>
      </div>

      {/* Customer cards skeleton */}
      <div className="mt-6 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-200 bg-white p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-zinc-200 rounded animate-pulse"></div>
                <div className="h-3 w-48 bg-zinc-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-5 w-16 bg-zinc-200 rounded animate-pulse ml-auto"></div>
                <div className="h-3 w-12 bg-zinc-200 rounded animate-pulse ml-auto"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
