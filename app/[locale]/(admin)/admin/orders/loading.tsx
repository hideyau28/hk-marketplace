export default function OrdersLoading() {
  return (
    <div className="pl-16 pr-4 pb-16 pt-4">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="h-4 w-16 bg-wlx-mist rounded animate-pulse mb-2"></div>
          <div className="h-8 w-32 bg-wlx-mist rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-wlx-mist rounded animate-pulse"></div>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-12 w-full bg-wlx-mist rounded-2xl animate-pulse"></div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-wlx-mist bg-white">
        <div className="p-4 space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-wlx-mist last:border-0">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-wlx-mist rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-wlx-mist rounded animate-pulse"></div>
              </div>
              <div className="h-6 w-16 bg-wlx-mist rounded-full animate-pulse"></div>
              <div className="h-6 w-20 bg-wlx-mist rounded-full animate-pulse"></div>
              <div className="h-10 w-16 bg-wlx-mist rounded-xl animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
