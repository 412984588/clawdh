import type { SupabaseClient } from '@supabase/supabase-js'
import type { TicketComment } from '@/lib/types/database'
import type { UserRole, CommentVisibility } from '@/lib/types/enums'

interface AddCommentParams {
  ticketId: string
  authorId: string
  authorRole: UserRole
  visibility: CommentVisibility
  body: string
}

export async function addComment(
  supabase: SupabaseClient,
  params: AddCommentParams
): Promise<{ data: TicketComment | null; error: string | null }> {
  const { data, error } = await supabase
    .from('ticket_comments')
    .insert({
      ticket_id: params.ticketId,
      author_user_id: params.authorId,
      author_role: params.authorRole,
      visibility: params.visibility,
      body: params.body,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as TicketComment, error: null }
}

// Visibility filtering is enforced by RLS policies in the database.
// The viewerRole parameter is kept for API compatibility but no longer used
// to add application-level filters — RLS already guarantees correct visibility.
export async function getCommentsForTicket(
  supabase: SupabaseClient,
  ticketId: string,
  _viewerRole: UserRole
): Promise<{ data: TicketComment[]; error: string | null }> {
  const { data, error } = await supabase
    .from('ticket_comments')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) return { data: [], error: error.message }
  return { data: (data as TicketComment[]) ?? [], error: null }
}
