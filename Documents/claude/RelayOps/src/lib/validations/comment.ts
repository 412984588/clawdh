import { z } from 'zod'

export const addCommentSchema = z.object({
  ticketId: z.string().uuid(),
  body: z.string().min(1).max(5000),
  visibility: z.enum(['partner_admin', 'worker_admin', 'internal_only']),
})

export type AddCommentInput = z.infer<typeof addCommentSchema>
