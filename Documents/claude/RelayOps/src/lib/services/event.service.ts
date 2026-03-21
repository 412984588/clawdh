import type { SupabaseClient } from '@supabase/supabase-js'
import type { TicketEvent } from '@/lib/types/database'
import type { UserRole } from '@/lib/types/enums'
import { logger } from '@/lib/utils/logger'

export async function logEvent(
  supabase: SupabaseClient,
  ticketId: string,
  actorId: string | null,
  actorRole: UserRole | null,
  eventType: string,
  payload: Record<string, unknown> = {}
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('ticket_events').insert({
    ticket_id: ticketId,
    actor_user_id: actorId,
    actor_role: actorRole,
    event_type: eventType,
    payload_json: payload,
  })
  if (error) {
    logger.error(`Failed to log event "${eventType}" for ticket ${ticketId}`, {
      context: 'event-service',
      error: error.message,
    })
    return { error: error.message }
  }

  return { error: null }
}

export async function getTicketEvents(
  supabase: SupabaseClient,
  ticketId: string
): Promise<{ data: TicketEvent[]; error: string | null }> {
  const { data, error } = await supabase
    .from('ticket_events')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) {
    logger.error(`Failed to fetch events for ticket ${ticketId}`, {
      context: 'event-service',
      error: error.message,
    })
    return { data: [], error: error.message }
  }

  return { data: (data as TicketEvent[]) || [], error: null }
}
