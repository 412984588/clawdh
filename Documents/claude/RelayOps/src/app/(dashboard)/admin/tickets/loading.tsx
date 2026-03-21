import { Skeleton } from '@/components/ui/skeleton'

export default function AdminTicketsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-md" />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        {/* Header row */}
        <div className="grid grid-cols-6 gap-4 px-4 py-3 border-b bg-muted/40">
          {['Title', 'Category', 'Status', 'Created', 'Due', ''].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full max-w-[80px]" />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 px-4 py-3 border-b last:border-0">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-7 w-12 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
