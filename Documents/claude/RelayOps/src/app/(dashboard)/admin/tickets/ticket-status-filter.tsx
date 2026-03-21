'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

const FILTER_OPTIONS = [
  { label: 'All', value: undefined },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Needs Scope Review', value: 'needs_scope_review' },
  { label: 'Scope Locked', value: 'scope_locked' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Review', value: 'submitted_for_review' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
] as const

interface TicketStatusFilterProps {
  currentStatus?: string
}

export function TicketStatusFilter({ currentStatus }: TicketStatusFilterProps) {
  const pathname = usePathname()

  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-2 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.38)]">
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map(({ label, value }) => {
          const href = value ? `${pathname}?status=${value}` : pathname
          const active = currentStatus === value || (!currentStatus && value === undefined)

          return (
            <Link
              key={label}
              href={href}
              className={cn(
                'rounded-2xl border px-3.5 py-2 text-xs font-semibold transition-colors',
                active
                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
