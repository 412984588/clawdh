import { Skeleton } from '@/components/ui/skeleton'

export default function WorkerAssignmentsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />

      {/* Table */}
      <div className="rounded-md border">
        <div className="grid grid-cols-5 gap-4 px-4 py-3 border-b bg-muted/40">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full max-w-[80px]" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 px-4 py-3 border-b last:border-0">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-12 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
