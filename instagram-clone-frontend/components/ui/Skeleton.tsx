export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-800/60 rounded ${className}`} />
  );
}

export function PostSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <Skeleton className="w-24 h-3.5 rounded" />
      </div>
      <Skeleton className="w-full aspect-square rounded-none" />
      <div className="px-4 pt-3 pb-4 space-y-3">
        <div className="flex gap-4">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="w-6 h-6 rounded" />
        </div>
        <Skeleton className="w-16 h-3.5 rounded" />
        <Skeleton className="w-3/4 h-3.5 rounded" />
      </div>
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-8">
      <Skeleton className="w-24 h-24 sm:w-36 sm:h-36 rounded-full shrink-0" />
      <div className="flex-1 w-full space-y-4">
        <div className="flex items-center gap-4 justify-center sm:justify-start">
          <Skeleton className="w-32 h-5 rounded" />
          <Skeleton className="w-24 h-8 rounded-lg" />
        </div>
        <div className="flex gap-8 justify-center sm:justify-start">
          <Skeleton className="w-16 h-4 rounded" />
          <Skeleton className="w-20 h-4 rounded" />
          <Skeleton className="w-20 h-4 rounded" />
        </div>
        <Skeleton className="w-40 h-3.5 rounded mx-auto sm:mx-0" />
      </div>
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-none" />
      ))}
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-32 h-3.5 rounded" />
        <Skeleton className="w-48 h-3 rounded" />
      </div>
    </div>
  );
}