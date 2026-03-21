import type { SupabaseClient } from '@supabase/supabase-js'
import type { Ticket } from '@/lib/types/database'
import type { TicketStatus } from '@/lib/types/enums'
import type { TicketCreateInput } from '@/lib/validations/ticket'
import type { PaginatedResult } from '@/lib/types/pagination'
import { normalizePagination, buildPaginatedResult } from '@/lib/types/pagination'

export async function createTicket(
  supabase: SupabaseClient,
  input: TicketCreateInput,
  createdBy: string,
  organizationId: string
): Promise<{ data: Ticket | null; error: string | null }> {
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      ...input,
      organization_id: organizationId,
      created_by: createdBy,
      status: 'draft' as TicketStatus,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Ticket, error: null }
}

export async function getTicket(
  supabase: SupabaseClient,
  ticketId: string
): Promise<{ data: Ticket | null; error: string | null }> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Ticket, error: null }
}

export async function listTickets(
  supabase: SupabaseClient,
  filters: { organizationId?: string; status?: TicketStatus; page?: number; pageSize?: number }
): Promise<PaginatedResult<Ticket> & { error: string | null }> {
  const { page, pageSize, offset } = normalizePagination(filters)

  let query = supabase
    .from('tickets')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (filters.organizationId) {
    query = query.eq('organization_id', filters.organizationId)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error, count } = await query
  if (error) {
    return { ...buildPaginatedResult<Ticket>([], 0, page, pageSize), error: error.message }
  }
  return { ...buildPaginatedResult((data as Ticket[]) || [], count, page, pageSize), error: null }
}
