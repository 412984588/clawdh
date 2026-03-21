import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { SYSTEM_ACTOR, transitionTicket } from '@/lib/state-machine/engine'
import { createEmailProvider } from '@/lib/integrations/email/provider'
import * as templates from '@/lib/integrations/email/templates'
import { env } from '@/lib/config/env'
import { timingSafeCompare } from '@/lib/utils/crypto'
import { ALL_TERMINAL_STATUSES } from '@/lib/constants/ticket-statuses'

// Vercel Cron: 每小时执行一次
// 1. invoiced 超过 7 天未付款 → expired（通过状态机引擎）+ 邮件通知
// 2. 已过 due_at 且非终态的工单 → overdue_flag = true
// 3. submitted / needs_scope_review 超过 14 天无响应 → admin_closed_no_response + 邮件通知

// 无响应关闭阈值（天）
const NO_RESPONSE_DAYS = 14

function jsonWithStatus(
  results: { errors: string[] } & Record<string, number | string[]>
) {
  if (results.errors.length > 0) {
    const hasSuccesses = Object.entries(results)
      .filter(([key]) => key !== 'errors')
      .some(([, value]) => typeof value === 'number' && value > 0)

    return NextResponse.json(results, { status: hasSuccesses ? 207 : 500 })
  }

  return NextResponse.json(results)
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  if (!env.CRON_SECRET || !timingSafeCompare(secret, env.CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const email = await createEmailProvider()
  const results = { expired: 0, overdue: 0, admin_closed: 0, emails_sent: 0, errors: [] as string[] }

  // 1. invoiced 工单超过 7 天未付款 → 通过引擎转移至 expired + 邮件通知
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: invoicedTickets, error: invoicedTicketsError } = await supabase
    .from('tickets')
    .select('id, title, organizations(name, users(email))')
    .eq('status', 'invoiced')
    .lt('updated_at', sevenDaysAgo)

  if (invoicedTicketsError) {
    results.errors.push(invoicedTicketsError.message)
    return jsonWithStatus(results)
  }

  for (const ticket of invoicedTickets ?? []) {
    try {
      const result = await transitionTicket(
        supabase,
        ticket.id,
        'expired',
        SYSTEM_ACTOR,
        { reason: 'invoice_unpaid_timeout' }
      )
      if (result.success) {
        results.expired++
        // 向合作方发送发票过期通知
        try {
          const org = Array.isArray(ticket.organizations)
            ? ticket.organizations[0]
            : ticket.organizations
          const partnerEmail = org?.users?.[0]?.email
          if (partnerEmail) {
            const tpl = templates.invoiceExpiredEmail({
              partnerName: org?.name ?? 'Partner',
              ticketTitle: ticket.title,
            })
            await email.send({ to: partnerEmail, ...tpl })
            results.emails_sent++
          }
        } catch (emailErr) {
          // 邮件发送失败不影响主流程，但上报 Sentry
          Sentry.captureException(emailErr, { extra: { ticketId: ticket.id, phase: 'expire-email' } })
        }
      } else {
        results.errors.push(`expire ${ticket.id}: ${result.error}`)
      }
    } catch (e) {
      Sentry.captureException(e, { extra: { ticketId: ticket.id, phase: 'expire-transition' } })
      results.errors.push(String(e))
    }
  }

  // 2. 标记已超时（过了 due_at）且非终态的工单；select() 触发返回受影响行
  const { data: overdueRows, error: overdueError } = await supabase
    .from('tickets')
    .update({ overdue_flag: true })
    .not('status', 'in', `(${ALL_TERMINAL_STATUSES.join(',')})`)
    .lt('due_at', new Date().toISOString())
    .eq('overdue_flag', false)
    .select('id')

  if (overdueError) {
    results.errors.push(overdueError.message)
  } else {
    results.overdue = overdueRows?.length ?? 0
  }

  // 3. submitted / needs_scope_review 超过 14 天无响应 → admin_closed_no_response
  const noResponseCutoff = new Date(
    Date.now() - NO_RESPONSE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString()

  const { data: staleTickets, error: staleTicketsError } = await supabase
    .from('tickets')
    .select('id, title, organizations(name, users(email))')
    .in('status', ['submitted', 'needs_scope_review'])
    .lt('updated_at', noResponseCutoff)

  if (staleTicketsError) {
    results.errors.push(staleTicketsError.message)
    return jsonWithStatus(results)
  }

  for (const ticket of staleTickets ?? []) {
    try {
      const result = await transitionTicket(
        supabase,
        ticket.id,
        'admin_closed_no_response',
        SYSTEM_ACTOR,
        { reason: 'no_admin_response_14_days' }
      )
      if (result.success) {
        results.admin_closed++
        // 向合作方发送无响应关闭通知
        try {
          const org = Array.isArray(ticket.organizations)
            ? ticket.organizations[0]
            : ticket.organizations
          const partnerEmail = org?.users?.[0]?.email
          if (partnerEmail) {
            const tpl = templates.adminClosedNoResponseEmail({
              partnerName: org?.name ?? 'Partner',
              ticketTitle: ticket.title,
            })
            await email.send({ to: partnerEmail, ...tpl })
            results.emails_sent++
          }
        } catch (emailErr) {
          // 邮件发送失败不影响主流程，但上报 Sentry
          Sentry.captureException(emailErr, { extra: { ticketId: ticket.id, phase: 'admin-close-email' } })
        }
      } else {
        results.errors.push(`admin_close ${ticket.id}: ${result.error}`)
      }
    } catch (e) {
      Sentry.captureException(e, { extra: { ticketId: ticket.id, phase: 'admin-close-transition' } })
      results.errors.push(String(e))
    }
  }

  // serverless 环境确保 Sentry 事件发送完毕
  await Sentry.flush(2000)
  return jsonWithStatus(results)
}
