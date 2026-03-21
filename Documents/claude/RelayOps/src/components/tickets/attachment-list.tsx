import { loadTicketAttachments } from '@/lib/loaders/ticket-details'
import { Badge } from '@/components/ui/badge'
import type { AttachmentRole } from '@/lib/types/enums'
import { format } from 'date-fns'
import { Download, Paperclip } from 'lucide-react'

interface AttachmentListProps {
  ticketId: string
}

function attachmentRoleVariant(
  role: AttachmentRole
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (role) {
    case 'deliverable':
      return 'default'
    case 'input':
    case 'sample':
      return 'secondary'
    default:
      return 'outline'
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export async function AttachmentList({ ticketId }: AttachmentListProps) {
  const attachmentsWithUrls = await loadTicketAttachments(ticketId)

  if (attachmentsWithUrls.length === 0) {
    return <p className="text-sm text-muted-foreground">No attachments.</p>
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-1.5">
        <Paperclip className="w-4 h-4" />
        Attachments ({attachmentsWithUrls.length})
      </h3>

      <ul className="space-y-2">
        {attachmentsWithUrls.map((att) => (
          <li
            key={att.id}
            className="flex items-start gap-3 rounded-md border bg-card px-3 py-2"
          >
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-sm font-medium truncate">{att.file_name}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={attachmentRoleVariant(att.attachment_role)}
                  className="text-xs"
                >
                  {att.attachment_role.replace(/_/g, ' ')}
                </Badge>
                <span className="text-xs text-muted-foreground capitalize">
                  {att.uploaded_by_role.replace('_', ' ')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(att.byte_size)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(att.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            {att.signedUrl && (
              <a
                href={att.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
