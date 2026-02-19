export default function HomepageLoading() {
  return (
    <div className="px-4 pb-16 pt-4 pl-16">
      <div className="mb-6">
        <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse mb-2"></div>
        <div className="h-8 w-44 bg-zinc-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-60 bg-zinc-200 rounded animate-pulse"></div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
            <div className="h-40 bg-zinc-200 animate-pulse"></div>
            <div className="p-4 space-y-3">
              <div className="h-5 w-36 bg-zinc-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-zinc-200 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-zinc-200 rounded animate-pulse"></div>
              <div className="flex gap-2 pt-1">
                <div className="h-8 w-20 bg-zinc-200 rounded-xl animate-pulse"></div>
                <div className="h-8 w-20 bg-zinc-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
