import { Skeleton } from '@/components/ui/skeleton'

export default function AdminMetricsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-5 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="rounded-lg border p-6 space-y-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-48 w-full" />
      </div>

      {/* Second chart area */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-36 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
