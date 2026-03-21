'use client'

import Link from 'next/link'
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StaggerItem, StaggerList } from '@/components/ui/motion'
import type { Ticket } from '@/lib/types/database'
import { TicketStatusBadge } from './ticket-status-badge'
import { formatDate } from '@/lib/utils/format'

const CATEGORY_SHORT: Record<string, string> = {
  data_cleanup_import_prep: 'Data Cleanup',
  data_normalization_report_prep: 'Data Normalization',
  crm_import_failure_diagnosis: 'CRM Diagnosis',
}

interface TicketListTableProps {
  tickets: Ticket[]
  // 基路径决定链接到 partner 还是 admin 视图
  basePath: '/partner/tickets' | '/admin/tickets'
  emptyMessage?: string
}

export function TicketListTable({
  tickets,
  basePath,
  emptyMessage = 'No tickets found.',
}: TicketListTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-16 text-center text-sm text-slate-500 shadow-[0_28px_70px_-52px_rgba(15,23,42,0.38)]">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_28px_70px_-52px_rgba(15,23,42,0.38)]">
      <Table className="min-w-[720px]">
        <TableHeader>
          <tr className="border-b border-slate-200/80 bg-slate-50/90">
            <TableHead className="h-14 w-[35%] px-5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Title
            </TableHead>
            <TableHead className="h-14 px-5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Category
            </TableHead>
            <TableHead className="h-14 px-5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Status
            </TableHead>
            <TableHead className="h-14 px-5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Created
            </TableHead>
            <TableHead className="h-14 px-5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Due
            </TableHead>
            <TableHead className="h-14 w-[88px] px-5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500" />
          </tr>
        </TableHeader>
        <StaggerList as="tbody">
          {tickets.map((ticket) => (
            <StaggerItem
              as="tr"
              key={ticket.id}
              className="group border-b border-slate-100/90 bg-white/80 transition-colors last:border-0 hover:bg-blue-50/40 data-[state=selected]:bg-muted"
            >
              <TableCell className="px-5 py-4 font-medium">
                <Link
                  href={`${basePath}/${ticket.id}`}
                  className="line-clamp-2 leading-snug text-slate-900 underline-offset-4 transition-colors group-hover:text-blue-700 hover:underline"
                >
                  {ticket.title}
                </Link>
              </TableCell>
              <TableCell className="px-5 py-4">
                <Badge
                  variant="outline"
                  className="whitespace-nowrap border-slate-200 bg-slate-50/90 text-xs font-medium text-slate-600"
                >
                  {CATEGORY_SHORT[ticket.category] ?? ticket.category}
                </Badge>
              </TableCell>
              <TableCell className="px-5 py-4">
                <TicketStatusBadge status={ticket.status} />
              </TableCell>
              <TableCell className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                {formatDate(ticket.created_at)}
              </TableCell>
              <TableCell className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                {ticket.due_at ? formatDate(ticket.due_at) : '—'}
              </TableCell>
              <TableCell className="px-5 py-4">
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                >
                  <Link href={`${basePath}/${ticket.id}`}>View</Link>
                </Button>
              </TableCell>
            </StaggerItem>
          ))}
        </StaggerList>
      </Table>
    </div>
  )
}
