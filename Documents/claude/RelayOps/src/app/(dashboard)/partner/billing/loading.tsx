import { Skeleton } from '@/components/ui/skeleton'

export default function PartnerBillingLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />

      {/* Balance card */}
      <div className="rounded-lg border p-6 space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>

      {/* Recent transactions */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <div className="rounded-md border">
          <div className="grid grid-cols-4 gap-4 px-4 py-3 border-b bg-muted/40">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full max-w-[80px]" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3 border-b last:border-0">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
