import type { SupabaseClient } from '@supabase/supabase-js'
import type { LedgerEntry } from '@/lib/types/database'
import type { LedgerType } from '@/lib/types/enums'
import type { PaginatedResult, PaginationParams } from '@/lib/types/pagination'
import { normalizePagination, buildPaginatedResult } from '@/lib/types/pagination'

interface CreateLedgerEntryParams {
  ticketId?: string
  organizationId?: string
  workerId?: string
  disputeId?: string
  type: LedgerType
  amountDollars: number
  currency?: string
  metadata?: Record<string, unknown>
}

export async function createLedgerEntry(
  supabase: SupabaseClient,
  params: CreateLedgerEntryParams
): Promise<{ data: LedgerEntry | null; error: string | null }> {
  // 金额校验：防止写入无效财务记录
  if (typeof params.amountDollars !== 'number' || !isFinite(params.amountDollars)) {
    return { data: null, error: 'Amount must be a finite number' }
  }
  if (params.amountDollars <= 0) {
    return { data: null, error: 'Amount must be positive' }
  }
  if (params.amountDollars > 100_000) {
    return { data: null, error: 'Amount exceeds maximum ($100,000)' }
  }
  // 保留两位小数，防止浮点精度污染财务记录
  const sanitizedAmount = Math.round(params.amountDollars * 100) / 100

  const { data, error } = await supabase
    .from('ledger_entries')
    .insert({
      ticket_id: params.ticketId ?? null,
      organization_id: params.organizationId ?? null,
      worker_id: params.workerId ?? null,
      dispute_id: params.disputeId ?? null,
      type: params.type,
      amount: sanitizedAmount,
      currency: params.currency ?? 'USD',
      status: 'pending',
      metadata_json: params.metadata ?? {},
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as LedgerEntry, error: null }
}

export async function confirmLedgerEntry(
  supabase: SupabaseClient,
  ledgerEntryId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('ledger_entries')
    .update({ status: 'confirmed' })
    .eq('id', ledgerEntryId)

  return { error: error?.message ?? null }
}

export async function getLedgerEntriesForOrg(
  supabase: SupabaseClient,
  organizationId: string,
  pagination?: PaginationParams
): Promise<PaginatedResult<LedgerEntry> & { error: string | null }> {
  const { page, pageSize, offset } = normalizePagination(pagination)

  const { data, error, count } = await supabase
    .from('ledger_entries')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (error) {
    return { ...buildPaginatedResult<LedgerEntry>([], 0, page, pageSize), error: error.message }
  }
  return { ...buildPaginatedResult((data as LedgerEntry[]) ?? [], count, page, pageSize), error: null }
}

export async function getAllLedgerEntries(
  supabase: SupabaseClient,
  pagination?: PaginationParams,
  filters?: { type?: string }
): Promise<PaginatedResult<LedgerEntry> & { error: string | null }> {
  const { page, pageSize, offset } = normalizePagination(pagination)

  let query = supabase
    .from('ledger_entries')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  const { data, error, count } = await query

  if (error) {
    return { ...buildPaginatedResult<LedgerEntry>([], 0, page, pageSize), error: error.message }
  }
  return { ...buildPaginatedResult((data as LedgerEntry[]) ?? [], count, page, pageSize), error: null }
}
