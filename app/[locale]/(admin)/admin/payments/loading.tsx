export default function PaymentsLoading() {
  return (
    <div className="px-4 pb-16 pt-4 pl-16">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse mb-2"></div>
          <div className="h-8 w-36 bg-zinc-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-56 bg-zinc-200 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-3xl border border-zinc-200 bg-white p-5 space-y-3">
            <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse"></div>
            <div className="h-7 w-28 bg-zinc-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-10 w-48 bg-zinc-200 rounded-2xl animate-pulse"></div>
        <div className="h-10 w-32 bg-zinc-200 rounded-2xl animate-pulse"></div>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-200 bg-white">
        <div className="p-4 space-y-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-zinc-100 last:border-0">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 bg-zinc-200 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-zinc-200 rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-20 bg-zinc-200 rounded-full animate-pulse"></div>
              <div className="h-4 w-20 bg-zinc-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
