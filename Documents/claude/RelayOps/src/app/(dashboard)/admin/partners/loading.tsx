import { Skeleton } from '@/components/ui/skeleton'

export default function AdminPartnersLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="grid grid-cols-4 gap-4 px-4 py-3 border-b bg-muted/40">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full max-w-[80px]" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3 border-b last:border-0">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
