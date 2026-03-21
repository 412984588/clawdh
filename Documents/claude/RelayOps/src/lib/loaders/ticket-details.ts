import { createAdminClient } from '@/lib/supabase/admin'
import { getAttachmentsForTicket } from '@/lib/services/attachment.service'
import { getCommentsForTicket } from '@/lib/services/comment.service'
import { getTicketEvents } from '@/lib/services/event.service'
import { getSignedDownloadUrl } from '@/lib/integrations/storage/signed-urls'
import { logger } from '@/lib/utils/logger'
import type { Attachment, TicketComment, TicketEvent } from '@/lib/types/database'
import type { UserRole } from '@/lib/types/enums'

export interface AttachmentWithSignedUrl extends Attachment {
  signedUrl: string | null
}

export async function loadTicketComments(
  ticketId: string,
  viewerRole: UserRole
): Promise<TicketComment[]> {
  const admin = createAdminClient()
  const result = await getCommentsForTicket(admin, ticketId, viewerRole)

  if (result.error) {
    logger.error('Failed to load ticket comments', {
      context: 'ticket-details-loader',
      ticketId,
      error: result.error,
    })
  }

  return result.data
}

export async function loadTicketEvents(ticketId: string): Promise<TicketEvent[]> {
  const admin = createAdminClient()
  const result = await getTicketEvents(admin, ticketId)

  if (result.error) {
    logger.error('Failed to load ticket events', {
      context: 'ticket-details-loader',
      ticketId,
      error: result.error,
    })
  }

  return result.data
}

export async function loadTicketAttachments(
  ticketId: string
): Promise<AttachmentWithSignedUrl[]> {
  const admin = createAdminClient()
  const result = await getAttachmentsForTicket(admin, ticketId)

  if (result.error) {
    logger.error('Failed to load ticket attachments', {
      context: 'ticket-details-loader',
      ticketId,
      error: result.error,
    })
    return []
  }

  return Promise.all(
    result.data.map(async (attachment) => {
      const signedUrlResult = await getSignedDownloadUrl(attachment.storage_path)

      if (signedUrlResult.error) {
        logger.warn('Failed to create attachment download URL', {
          context: 'ticket-details-loader',
          ticketId,
          attachmentId: attachment.id,
          error: signedUrlResult.error,
        })
      }

      return {
        ...attachment,
        signedUrl: signedUrlResult.data,
      }
    })
  )
}
