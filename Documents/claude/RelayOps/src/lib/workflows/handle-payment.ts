import { createAdminClient } from '@/lib/supabase/admin'
import { transitionTicket } from '@/lib/state-machine/engine'
import { createLedgerEntry, confirmLedgerEntry } from '@/lib/services/ledger.service'
import { notifyTicketEvent } from '@/lib/services/notification.service'
import { clearPaymentRetryFields } from '@/lib/services/payment-retry.service'
import { logger } from '@/lib/utils/logger'
import { triggerAlert } from '@/lib/utils/alerts'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/integrations/analytics/events'

interface HandlePaymentParams {
  stripeInvoiceId: string
  amountPaidDollars: number
  currency: string
  stripeCustomerId: string
}

interface HandlePaymentResult {
  success: boolean
  ticketId?: string
  error?: string
}

async function recoverPaidTicket(
  ticketId: string,
  organizationId: string | null | undefined,
  params: HandlePaymentParams
): Promise<HandlePaymentResult> {
  const admin = createAdminClient()
  const { data: existingLedger } = await admin
    .from('ledger_entries')
    .select('id, status, metadata_json')
    .eq('ticket_id', ticketId)
    .eq('type', 'invoice_payment')
    .single()

  const metadataInvoiceId = existingLedger?.metadata_json?.stripe_invoice_id
  const matchedLedger =
    existingLedger && metadataInvoiceId === params.stripeInvoiceId ? existingLedger : null

  let ledgerToConfirm = matchedLedger
  if (!ledgerToConfirm) {
    const { data: newLedger, error: ledgerError } = await createLedgerEntry(admin, {
      ticketId,
      organizationId: organizationId ?? undefined,
      type: 'invoice_payment',
      amountDollars: params.amountPaidDollars,
      currency: params.currency.toUpperCase(),
      metadata: {
        stripe_invoice_id: params.stripeInvoiceId,
        stripe_customer_id: params.stripeCustomerId,
      },
    })
    if (ledgerError) {
      return { success: false, error: 'Failed to create recovery ledger entry' }
    }
    ledgerToConfirm = newLedger
  }

  const systemActor = { id: ticketId, role: 'admin' as const }
  const queuedResult = await transitionTicket(admin, ticketId, 'queued', systemActor)

  if (!queuedResult.success) {
    // ⚠️ 已创建账本条目，但 queued 转移失败
    // 不删除账本（保留审计轨迹），返回失败让 Stripe 重试。
    // 下次 webhook 重试时 matchedLedger 检查会跳过账本创建，直接重试 transition。
    if (ledgerToConfirm) {
      logger.error('CRITICAL: Recovery ledger exists but queued transition failed', {
        context: 'handle-payment-recovery',
        ticketId,
        ledgerId: ledgerToConfirm.id,
        error: queuedResult.error,
      })
    }
    return { success: false, error: queuedResult.error }
  }

  if (ledgerToConfirm && ledgerToConfirm.status !== 'confirmed') {
    await confirmLedgerEntry(admin, ledgerToConfirm.id)
  }

  await notifyTicketEvent(admin, ticketId, 'payment_confirmed', {
    amount_paid: params.amountPaidDollars,
  })

  return { success: true, ticketId }
}

export async function handlePaymentWorkflow(
  params: HandlePaymentParams
): Promise<HandlePaymentResult> {
  const admin = createAdminClient()

  // 1. 原子 claim：用条件 UPDATE 作为分布式锁
  //    只有 status='invoiced' 时才能成功，防止并发 webhook 重复记账
  const { data: claimed } = await admin
    .from('tickets')
    .update({ paid_at: new Date().toISOString() })
    .eq('stripe_invoice_id', params.stripeInvoiceId)
    .eq('status', 'invoiced')
    .select('id, organization_id')
    .single()

  if (!claimed) {
    // Claim 失败 → 查原因（幂等/未找到/异常状态）
    const { data: existing } = await admin
      .from('tickets')
      .select('id, status, organization_id')
      .eq('stripe_invoice_id', params.stripeInvoiceId)
      .single()

    if (!existing) {
      logger.error(`No ticket for invoice ${params.stripeInvoiceId}`, { context: 'handlePayment' })
      return { success: false, error: 'Ticket not found for this invoice' }
    }
    if (existing.status === 'queued') {
      return { success: true, ticketId: existing.id }
    }
    if (existing.status === 'paid') {
      return recoverPaidTicket(existing.id, existing.organization_id, params)
    }
    return { success: false, error: `Unexpected ticket status: ${existing.status}` }
  }

  // 2. 幂等性检查：同一 stripe_invoice_id 不重复创建 ledger entry
  //    防止 webhook 并发重试时创建重复账本记录
  const { data: existingLedger } = await admin
    .from('ledger_entries')
    .select('id, status')
    .eq('ticket_id', claimed.id)
    .eq('type', 'invoice_payment')
    .maybeSingle()

  let ledgerEntry = existingLedger
  if (!ledgerEntry) {
    const { data: newLedger, error: ledgerError } = await createLedgerEntry(admin, {
      ticketId: claimed.id,
      organizationId: claimed.organization_id,
      type: 'invoice_payment',
      amountDollars: params.amountPaidDollars,
      currency: params.currency.toUpperCase(),
      metadata: {
        stripe_invoice_id: params.stripeInvoiceId,
        stripe_customer_id: params.stripeCustomerId,
      },
    })
    if (ledgerError) {
      return { success: false, error: 'Failed to create payment ledger entry' }
    }
    ledgerEntry = newLedger
  }

  // Use the ticket id as the system actor — admin role grants the transition
  const systemActor = { id: claimed.id, role: 'admin' as const }

  // 3a. Transition: invoiced → paid
  const paidResult = await transitionTicket(admin, claimed.id, 'paid', systemActor, {
    stripe_invoice_id: params.stripeInvoiceId,
    amount_paid: params.amountPaidDollars,
  })

  if (!paidResult.success) return { success: false, error: paidResult.error }

  // 3b. Transition: paid → queued (auto-enqueue after payment)
  const queuedResult = await transitionTicket(admin, claimed.id, 'queued', systemActor)

  if (!queuedResult.success) return { success: false, error: queuedResult.error }

  // 4. 两次 transition 全部成功后才确认账本
  //    若先确认再 transition 失败，账本确认但工单状态仍在 invoiced，会导致不一致
  if (ledgerEntry && ledgerEntry.status !== 'confirmed') {
    await confirmLedgerEntry(admin, ledgerEntry.id)
  }

  // 5. 通知：付款已确认
  await notifyTicketEvent(admin, claimed.id, 'payment_confirmed', {
    amount_paid: params.amountPaidDollars,
  })

  triggerAlert('payment_confirmed', {
    ticketId: claimed.id,
    amountDollars: params.amountPaidDollars,
    stripeInvoiceId: params.stripeInvoiceId,
  }, { context: 'handlePayment' })

  // 用户行为追踪
  trackEvent(ANALYTICS_EVENTS.PAYMENT_SUCCEEDED, {
    ticketId: claimed.id,
    amount: params.amountPaidDollars,
    currency: params.currency,
  })

  // 6. 清理支付重试字段（支付成功后重置重试状态）
  await clearPaymentRetryFields(admin, claimed.id)

  return { success: true, ticketId: claimed.id }
}
