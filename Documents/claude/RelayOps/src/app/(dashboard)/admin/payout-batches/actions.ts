'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
async function getAdminUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!data || data.role !== 'admin') return null
  return data
}

export async function createPayoutBatchAction(): Promise<void> {
  const adminUser = await getAdminUser()
  if (!adminUser) return

  const admin = createAdminClient()

  // Period covers the current calendar month
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10)

  // Sum unpaid worker_payout ledger entries to set total_amount
  const { data: pendingEntries } = await admin
    .from('ledger_entries')
    .select('amount')
    .eq('type', 'worker_payout')
    .eq('status', 'pending')

  const totalAmount = (pendingEntries ?? []).reduce(
    (sum, e) => sum + Number(e.amount),
    0
  )

  const { data: batch, error } = await admin
    .from('payout_batches')
    .insert({
      period_start: periodStart,
      period_end: periodEnd,
      status: 'draft',
      total_amount: totalAmount,
    })
    .select('id')
    .single()

  if (error || !batch) {
    return
  }

  revalidatePath('/admin/payout-batches')
}
