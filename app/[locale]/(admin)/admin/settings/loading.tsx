export default function SettingsLoading() {
  return (
    <div className="px-4 pb-16 pt-4 pl-16">
      <div className="mb-6">
        <div className="h-4 w-16 bg-wlx-mist rounded animate-pulse mb-2"></div>
        <div className="h-8 w-40 bg-wlx-mist rounded animate-pulse mb-2"></div>
        <div className="h-4 w-56 bg-wlx-mist rounded animate-pulse"></div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-wlx-mist bg-white">
        <div className="p-6 space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-wlx-mist last:border-0">
              <div className="space-y-2">
                <div className="h-4 w-40 bg-wlx-mist rounded animate-pulse"></div>
                <div className="h-3 w-64 bg-wlx-mist rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-24 bg-wlx-mist rounded-xl animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-wlx-mist bg-white">
        <div className="p-6 space-y-4">
          <div className="h-5 w-32 bg-wlx-mist rounded animate-pulse mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-wlx-mist rounded animate-pulse"></div>
              <div className="h-10 w-full bg-wlx-mist rounded-xl animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
