'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { scopeAndInvoiceWorkflow } from '@/lib/workflows/scope-and-invoice'
import type { ServerActionResult } from '@/lib/types/api'
import { requireRole } from '@/lib/utils/get-session-user'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const scopeAndInvoiceSchema = z.object({
  ticketId: z.string().uuid(),
  // Accept string from form inputs and coerce to number
  priceDollars: z.coerce.number().positive().max(50000),
})

export async function scopeAndInvoiceTicket(
  data: unknown
): Promise<ServerActionResult<{ invoiceUrl: string }>> {
  const parsed = scopeAndInvoiceSchema.safeParse(data)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const adminUser = await requireRole('admin')
  if (!adminUser) return { success: false, error: 'Unauthorized' }

  const admin = createAdminClient()
  const result = await scopeAndInvoiceWorkflow(admin, {
    ticketId: parsed.data.ticketId,
    priceDollars: parsed.data.priceDollars,
    adminId: adminUser.id,
    adminRole: 'admin',
  })

  if (!result.success) return { success: false, error: result.error }

  revalidatePath('/admin/tickets')
  revalidatePath(`/admin/tickets/${parsed.data.ticketId}`)

  return { success: true, data: { invoiceUrl: result.invoiceUrl! } }
}
