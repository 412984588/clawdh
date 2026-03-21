import { loadTicketComments } from '@/lib/loaders/ticket-details'
import { Badge } from '@/components/ui/badge'
import type { UserRole, CommentVisibility } from '@/lib/types/enums'
import { format } from 'date-fns'
import { AddCommentForm } from './add-comment-form'

interface CommentThreadProps {
  ticketId: string
  viewerRole: UserRole
}

function visibilityLabel(visibility: CommentVisibility): string {
  switch (visibility) {
    case 'partner_admin':
      return 'Partner'
    case 'worker_admin':
      return 'Worker'
    case 'internal_only':
      return 'Internal'
  }
}

function visibilityVariant(
  visibility: CommentVisibility
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (visibility) {
    case 'partner_admin':
      return 'default'
    case 'worker_admin':
      return 'secondary'
    case 'internal_only':
      return 'outline'
  }
}

export async function CommentThread({ ticketId, viewerRole }: CommentThreadProps) {
  const comments = await loadTicketComments(ticketId, viewerRole)

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Comments</h3>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-md border bg-card p-3 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={visibilityVariant(comment.visibility)} className="text-xs">
                  {visibilityLabel(comment.visibility)}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium capitalize">
                  {comment.author_role.replace('_', ' ')}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {format(new Date(comment.created_at), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
            </li>
          ))}
        </ul>
      )}

      <AddCommentForm ticketId={ticketId} viewerRole={viewerRole} />
    </div>
  )
}
