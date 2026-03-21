import Link from 'next/link'

interface PaginationNavProps {
  page: number
  totalPages: number
  /** Generate href with page number; caller retains existing query params */
  buildHref: (page: number) => string
}

// Generic server-side pagination nav — prev/next + page info
export function PaginationNav({ page, totalPages, buildHref }: PaginationNavProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-6 text-sm text-slate-600">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={buildHref(page - 1)}
            className="px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Previous
          </Link>
        )}
        {page < totalPages && (
          <Link
            href={buildHref(page + 1)}
            className="px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  )
}
