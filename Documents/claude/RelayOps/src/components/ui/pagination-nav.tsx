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
    <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.38)]">
      <span className="font-medium text-slate-600">
        Page {page} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        {page > 1 && (
          <Link
            href={buildHref(page - 1)}
            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Previous
          </Link>
        )}
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {page}/{totalPages}
        </span>
        {page < totalPages && (
          <Link
            href={buildHref(page + 1)}
            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  )
}
