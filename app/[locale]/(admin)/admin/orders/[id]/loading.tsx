export default function OrderDetailLoading() {
  return (
    <div className="px-4 pb-16 pt-4 pl-16">
      <div className="mb-6">
        <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse mb-3"></div>
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-zinc-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-zinc-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-zinc-200 rounded-xl animate-pulse"></div>
            <div className="h-10 w-28 bg-zinc-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 space-y-4">
            <div className="h-5 w-28 bg-zinc-200 rounded animate-pulse"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-zinc-100 last:border-0">
                <div className="h-14 w-14 bg-zinc-200 rounded-xl animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-zinc-200 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-zinc-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse"></div>
              </div>
            ))}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-zinc-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-zinc-200 rounded animate-pulse"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-5 w-16 bg-zinc-200 rounded animate-pulse"></div>
                <div className="h-5 w-24 bg-zinc-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 space-y-4">
            <div className="h-5 w-20 bg-zinc-200 rounded animate-pulse"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 w-full bg-zinc-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 space-y-4">
            <div className="h-5 w-24 bg-zinc-200 rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-zinc-200 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-zinc-200 rounded animate-pulse"></div>
              <div className="h-4 w-1/2 bg-zinc-200 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 space-y-4">
            <div className="h-5 w-20 bg-zinc-200 rounded animate-pulse"></div>
            <div className="h-8 w-full bg-zinc-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
