import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/utils/logger'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PartnerActionButtons } from './partner-action-buttons'

export const metadata: Metadata = {
  title: 'Partner Applications — RelayOps Admin',
}

const PAGE_SIZE = 50

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>
}

async function getPartners(statusFilter: StatusFilter, page: number) {
  const admin = createAdminClient()
  const offset = (page - 1) * PAGE_SIZE

  let query = admin
    .from('partner_profiles')
    .select(
      `
      organization_id,
      service_focus,
      monthly_ticket_estimate,
      approval_status,
      notes,
      created_at,
      organizations (
        id,
        name,
        website,
        country
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (statusFilter !== 'all') {
    query = query.eq('approval_status', statusFilter)
  }

  const { data, error, count } = await query

  if (error) {
    logger.error('Error fetching partners', { context: 'admin-partners', error })
    return { data: [], total: 0 }
  }

  return { data: data ?? [], total: count ?? 0 }
}

function extractContactEmail(notes: string | null): string {
  if (!notes) return '—'
  const match = notes.match(/Contact email:\s*(.+)/)
  return match ? match[1].trim() : '—'
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case 'approved':
      return 'default' as const
    case 'rejected':
      return 'destructive' as const
    default:
      return 'secondary' as const
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function AdminPartnersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const statusFilter = (params.status as StatusFilter) ?? 'all'
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const { data: partners, total } = await getPartners(statusFilter, page)
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1

  function pageHref(p: number) {
    const qs = new URLSearchParams()
    if (statusFilter !== 'all') qs.set('status', statusFilter)
    if (p > 1) qs.set('page', String(p))
    const s = qs.toString()
    return s ? `?${s}` : '?'
  }

  const tabs: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ]

  return (
    <div className="dashboard-page">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Partner Applications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and approve partner access requests.
          </p>
        </div>
        {statusFilter === 'pending' && total > 0 && (
          <Badge variant="destructive" className="text-sm">
            {total} pending
          </Badge>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((tab) => (
          <a
            key={tab.value}
            href={tab.value === 'all' ? '?' : `?status=${tab.value}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              statusFilter === tab.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Table */}
      {partners.length === 0 && total === 0 ? (
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-10 text-center">
          <p className="text-slate-400 text-sm">
            No {statusFilter === 'all' ? '' : statusFilter} applications found.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Organization</TableHead>
                <TableHead className="font-semibold text-slate-700">Contact email</TableHead>
                <TableHead className="font-semibold text-slate-700">Service focus</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">
                  Monthly est.
                </TableHead>
                <TableHead className="font-semibold text-slate-700">Applied</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map((partner) => {
                const org = Array.isArray(partner.organizations)
                  ? partner.organizations[0]
                  : partner.organizations
                const contactEmail = extractContactEmail(partner.notes ?? null)

                return (
                  <TableRow key={partner.organization_id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-medium text-slate-900 text-sm">
                          {org?.name ?? '—'}
                        </p>
                        {org?.website && (
                          <p className="text-xs text-slate-400 truncate max-w-[140px]">
                            {org.website}
                          </p>
                        )}
                        {org?.country && (
                          <p className="text-xs text-slate-400">{org.country}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-700">{contactEmail}</p>
                    </TableCell>
                    <TableCell>
                      <p
                        className="text-sm text-slate-600 max-w-[220px] truncate"
                        title={partner.service_focus ?? ''}
                      >
                        {partner.service_focus ?? '—'}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-medium text-slate-700">
                        {partner.monthly_ticket_estimate ?? '—'}
                        {partner.monthly_ticket_estimate ? '/mo' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500">
                        {formatDate(partner.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={statusBadgeVariant(partner.approval_status)}
                        className="capitalize text-xs"
                      >
                        {partner.approval_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <PartnerActionButtons
                        organizationId={partner.organization_id}
                        currentStatus={partner.approval_status}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
          <span>
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={pageHref(page - 1)}
                className="px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={pageHref(page + 1)}
                className="px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
