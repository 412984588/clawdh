import { z } from 'zod'

export const reviewSubmitSchema = z.object({
  ticketId: z.string().uuid(),
  decision: z.enum(['approved', 'revision_requested']),
  acceptanceFailures: z.array(z.string()).default([]),
  notes: z.string().max(2000).optional(),
})

export type ReviewSubmitInput = z.infer<typeof reviewSubmitSchema>
