import { Skeleton } from '@/components/ui/skeleton'

export default function WorkerSubmissionDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <Skeleton className="h-4 w-32" />

      {/* Title + status */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Submission detail card */}
      <div className="rounded-lg border p-6 space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <div className="space-y-1.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>

      {/* Review feedback card */}
      <div className="rounded-lg border p-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  )
}
