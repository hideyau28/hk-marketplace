export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Image skeleton */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-200 aspect-square animate-pulse" />

      {/* Content skeleton */}
      <div className="pt-2.5">
        {/* Brand */}
        <div className="h-3 w-16 bg-zinc-200 rounded animate-pulse" />
        {/* Title */}
        <div className="mt-1.5 h-4 w-full bg-zinc-200 rounded animate-pulse" />
        <div className="mt-1 h-4 w-3/4 bg-zinc-200 rounded animate-pulse" />
      </div>

      {/* Price row */}
      <div className="mt-auto pt-1.5 flex items-center justify-between">
        <div className="h-5 w-16 bg-zinc-200 rounded animate-pulse" />
        <div className="h-7 w-14 bg-zinc-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
