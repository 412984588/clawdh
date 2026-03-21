import Link from 'next/link'

interface PaginationNavProps {
  page: number
  totalPages: number
  /** 生成带页码的 href，调用者负责保留已有 query params */
  buildHref: (page: number) => string
}

// 通用服务端分页导航 — 上一页/下一页 + 页码信息
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
