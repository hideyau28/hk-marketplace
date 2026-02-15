export default function DashboardLoading() {
  return (
    <div className="p-4 pb-16 max-w-full overflow-hidden">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-10 w-10 bg-zinc-200 rounded-lg animate-pulse" />
        <div>
          <div className="h-3 w-12 bg-zinc-200 rounded animate-pulse mb-2" />
          <div className="h-7 w-32 bg-zinc-200 rounded animate-pulse mb-1" />
          <div className="h-3 w-40 bg-zinc-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Welcome banner skeleton */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 mb-6">
        <div className="h-6 w-48 bg-zinc-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-zinc-100">
            <div className="h-3 w-16 bg-zinc-200 rounded animate-pulse mb-2" />
            <div className="h-8 w-12 bg-zinc-200 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-xl p-4 border border-zinc-100">
            <div className="h-3 w-16 bg-zinc-200 rounded animate-pulse mb-2" />
            <div className="h-8 w-12 bg-zinc-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="h-3 w-20 bg-zinc-200 rounded animate-pulse mb-3" />
                <div className="h-7 w-16 bg-zinc-200 rounded animate-pulse" />
              </div>
              <div className="h-6 w-6 bg-zinc-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-6">
            <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse mb-4" />
            <div className="h-48 bg-zinc-100 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>

      {/* Recent orders skeleton */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 bg-zinc-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse" />
        </div>
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-zinc-100 last:border-0">
                <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-zinc-200 rounded animate-pulse" />
                <div className="h-5 w-16 bg-zinc-200 rounded-full animate-pulse" />
                <div className="flex-1" />
                <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
