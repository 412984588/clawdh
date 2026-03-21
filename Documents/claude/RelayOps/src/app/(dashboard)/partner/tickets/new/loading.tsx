import { Skeleton } from '@/components/ui/skeleton'

export default function PartnerNewTicketLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Form fields */}
      <div className="rounded-lg border p-6 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}

        {/* Textarea fields */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        ))}

        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  )
}
