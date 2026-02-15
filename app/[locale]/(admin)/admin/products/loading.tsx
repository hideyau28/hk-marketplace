export default function ProductsLoading() {
  return (
    <div className="px-4 pb-16 pt-4 pl-16">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse mb-2"></div>
          <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-zinc-200 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="h-12 w-48 bg-zinc-200 rounded-2xl animate-pulse"></div>
        <div className="h-12 w-32 bg-zinc-200 rounded-xl animate-pulse"></div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-zinc-100 last:border-0">
              <div className="h-12 w-12 bg-zinc-200 rounded-xl animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-zinc-200 rounded animate-pulse"></div>
                <div className="h-3 w-32 bg-zinc-200 rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-20 bg-zinc-200 rounded-full animate-pulse"></div>
              <div className="h-10 w-16 bg-zinc-200 rounded-xl animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
