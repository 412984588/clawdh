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
  // Base path determines whether links go to partner or admin view
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
      <div className="rounded-md border py-16 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <tr className="border-b">
            <TableHead className="w-[35%]">Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="w-[80px]" />
          </tr>
        </TableHeader>
        <StaggerList as="tbody">
          {tickets.map((ticket) => (
            <StaggerItem
              as="tr"
              key={ticket.id}
              className="border-b transition-colors last:border-0 hover:bg-muted/50 data-[state=selected]:bg-muted"
            >
              <TableCell className="font-medium">
                <Link
                  href={`${basePath}/${ticket.id}`}
                  className="hover:underline line-clamp-2 leading-snug"
                >
                  {ticket.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  {CATEGORY_SHORT[ticket.category] ?? ticket.category}
                </Badge>
              </TableCell>
              <TableCell>
                <TicketStatusBadge status={ticket.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(ticket.created_at)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {ticket.due_at ? formatDate(ticket.due_at) : '—'}
              </TableCell>
              <TableCell>
                <Button asChild size="sm" variant="ghost">
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
