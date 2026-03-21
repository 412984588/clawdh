import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { createEmailProvider } from '@/lib/integrations/email/provider'
import * as templates from '@/lib/integrations/email/templates'
import { env } from '@/lib/config/env'
import { timingSafeCompare } from '@/lib/utils/crypto'
import { logger } from '@/lib/utils/logger'

// Vercel Cron: 每 4 小时执行一次
// 1. submitted_for_review 等待 24h / 72h → 向合作方发送审核提醒
// 2. invoiced 满 5 天未付款（距到期还有 2 天）→ 发送到期提醒（幂等）
// 3. in_progress 且距 due_at < 24h → 向 admin 发送 SLA 告警（幂等）

const REVIEW_REMINDER_24H_MS = 24 * 60 * 60 * 1000
const REVIEW_REMINDER_48H_MS = 48 * 60 * 60 * 1000
const REVIEW_REMINDER_72H_MS = 72 * 60 * 60 * 1000
const REVIEW_REMINDER_96H_MS = 96 * 60 * 60 * 1000
const INVOICE_OVERDUE_THRESHOLD_MS = 5 * 24 * 60 * 60 * 1000
const SLA_WARNING_WINDOW_MS = 24 * 60 * 60 * 1000

type TicketWithOrg = {
  id: string
  title: string
  organization_id: string
  // Supabase 关联查询返回数组
  organizations: {
    name: string
    users: { email: string }[]
  }[] | null
}

type SlaTicket = {
  id: string
  title: string
  due_at: string
}

function jsonWithStatus(
  results: { reminders_sent: number; errors: string[] }
) {
  if (results.errors.length > 0) {
    return NextResponse.json(results, {
      status: results.reminders_sent > 0 ? 207 : 500,
    })
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
  const results = { reminders_sent: 0, errors: [] as string[] }

  // ── 1. 24h 审核提醒：等待审核 24-48 小时 ──────────────────────────────
  // 使用 Date.now() 确保时间戳始终基于 UTC，避免 now 变量在长流程中产生漂移
  const h24 = new Date(Date.now() - REVIEW_REMINDER_24H_MS).toISOString()
  const h48 = new Date(Date.now() - REVIEW_REMINDER_48H_MS).toISOString()

  const { data: remind24, error: remind24Error } = await supabase
    .from('tickets')
    .select('id, title, organization_id, organizations(name, users(email))')
    .eq('status', 'submitted_for_review')
    .lt('updated_at', h24)
    .gte('updated_at', h48)

  if (remind24Error) {
    logger.error('Failed to query 24h review reminders', {
      context: 'send-reminders',
      error: remind24Error.message,
    })
    results.errors.push(remind24Error.message)
    return jsonWithStatus(results)
  }

  for (const raw of (remind24 ?? []) as unknown as TicketWithOrg[]) {
    try {
      const org = Array.isArray(raw.organizations) ? raw.organizations[0] : raw.organizations
      const partnerEmail = org?.users?.[0]?.email
      if (!partnerEmail) continue
      const tpl = templates.reviewReminder24hEmail({
        partnerName: org?.name ?? 'Partner',
        ticketTitle: raw.title,
        ticketUrl: `${env.NEXT_PUBLIC_APP_URL}/partner/tickets/${raw.id}`,
      })
      await email.send({ to: partnerEmail, ...tpl })
      results.reminders_sent++
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error('Failed to send 24h review reminder', {
        context: 'send-reminders',
        ticketId: raw.id,
        error,
      })
      results.errors.push(`24h reminder ${raw.id}: ${message}`)
    }
  }

  // ── 2. 72h 审核提醒：等待审核 72-96 小时 ──────────────────────────────
  const h72 = new Date(Date.now() - REVIEW_REMINDER_72H_MS).toISOString()
  const h96 = new Date(Date.now() - REVIEW_REMINDER_96H_MS).toISOString()

  const { data: remind72, error: remind72Error } = await supabase
    .from('tickets')
    .select('id, title, organization_id, organizations(name, users(email))')
    .eq('status', 'submitted_for_review')
    .lt('updated_at', h72)
    .gte('updated_at', h96)

  if (remind72Error) {
    logger.error('Failed to query 72h review reminders', {
      context: 'send-reminders',
      error: remind72Error.message,
    })
    results.errors.push(remind72Error.message)
    return jsonWithStatus(results)
  }

  for (const raw of (remind72 ?? []) as unknown as TicketWithOrg[]) {
    try {
      const org = Array.isArray(raw.organizations) ? raw.organizations[0] : raw.organizations
      const partnerEmail = org?.users?.[0]?.email
      if (!partnerEmail) continue
      const tpl = templates.reviewReminder72hEmail({
        partnerName: org?.name ?? 'Partner',
        ticketTitle: raw.title,
        ticketUrl: `${env.NEXT_PUBLIC_APP_URL}/partner/tickets/${raw.id}`,
      })
      await email.send({ to: partnerEmail, ...tpl })
      results.reminders_sent++
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error('Failed to send 72h review reminder', {
        context: 'send-reminders',
        ticketId: raw.id,
        error,
      })
      results.errors.push(`72h reminder ${raw.id}: ${message}`)
    }
  }

  // ── 3. 发票到期提醒：invoiced 状态满 5 天（剩余 2 天到期）────────────
  // 使用 ticket_events 记录已发送状态，实现幂等
  const d5ago = new Date(Date.now() - INVOICE_OVERDUE_THRESHOLD_MS).toISOString()

  const { data: invoicedRemind, error: invoicedRemindError } = await supabase
    .from('tickets')
    .select('id, title, organization_id, organizations(name, users(email))')
    .eq('status', 'invoiced')
    .lt('updated_at', d5ago)

  if (invoicedRemindError) {
    logger.error('Failed to query invoice reminders', {
      context: 'send-reminders',
      error: invoicedRemindError.message,
    })
    results.errors.push(invoicedRemindError.message)
    return jsonWithStatus(results)
  }

  for (const raw of (invoicedRemind ?? []) as unknown as TicketWithOrg[]) {
    try {
      // 检查是否已发送过到期提醒（幂等保证）
      const { data: existing, error: existingError } = await supabase
        .from('ticket_events')
        .select('id')
        .eq('ticket_id', raw.id)
        .eq('event_type', 'invoice_expiry_reminder')
        .maybeSingle()

      if (existingError) {
        throw new Error(existingError.message)
      }

      if (existing) continue

      const org = Array.isArray(raw.organizations) ? raw.organizations[0] : raw.organizations
      const partnerEmail = org?.users?.[0]?.email
      if (!partnerEmail) continue

      const tpl = templates.invoiceExpiryReminderEmail({
        partnerName: org?.name ?? 'Partner',
        ticketTitle: raw.title,
        ticketUrl: `${env.NEXT_PUBLIC_APP_URL}/partner/tickets/${raw.id}`,
        daysRemaining: 2,
      })
      await email.send({ to: partnerEmail, ...tpl })

      // 写入发送记录，防止重复发送
      const { error: insertError } = await supabase.from('ticket_events').insert({
        ticket_id: raw.id,
        actor_role: 'admin',
        event_type: 'invoice_expiry_reminder',
        payload_json: { days_remaining: 2 },
      })

      if (insertError) {
        throw new Error(insertError.message)
      }

      results.reminders_sent++
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error('Failed to process invoice reminder', {
        context: 'send-reminders',
        ticketId: raw.id,
        error,
      })
      results.errors.push(`invoice reminder ${raw.id}: ${message}`)
    }
  }

  // ── 4. SLA 到期提醒：in_progress 且距 due_at < 24h ───────────────────
  // 使用 Date.now() 统一基准，避免与上方查询时间不一致
  const in24h = new Date(Date.now() + SLA_WARNING_WINDOW_MS).toISOString()
  const nowIso = new Date(Date.now()).toISOString()

  const { data: slaRemind, error: slaRemindError } = await supabase
    .from('tickets')
    .select('id, title, due_at')
    .eq('status', 'in_progress')
    .eq('overdue_flag', false)
    .gte('due_at', nowIso)
    .lt('due_at', in24h)

  if (slaRemindError) {
    logger.error('Failed to query SLA reminders', {
      context: 'send-reminders',
      error: slaRemindError.message,
    })
    results.errors.push(slaRemindError.message)
    return jsonWithStatus(results)
  }

  for (const ticket of (slaRemind ?? []) as unknown as SlaTicket[]) {
    try {
      // 检查是否已发送（幂等保证）
      const { data: existing, error: existingError } = await supabase
        .from('ticket_events')
        .select('id')
        .eq('ticket_id', ticket.id)
        .eq('event_type', 'sla_deadline_reminder')
        .maybeSingle()

      if (existingError) {
        throw new Error(existingError.message)
      }

      if (existing) continue

      const hoursRemaining = Math.ceil(
        (new Date(ticket.due_at).getTime() - Date.now()) / 3_600_000
      )
      const ticketUrl = `${env.NEXT_PUBLIC_APP_URL}/admin/tickets/${ticket.id}`
      // ADMIN_NOTIFICATION_EMAIL 未配置时跳过发送，避免将警报误发到错误地址
      const adminEmail = env.ADMIN_NOTIFICATION_EMAIL
      if (!adminEmail) {
        logger.warn('ADMIN_NOTIFICATION_EMAIL not configured, skipping SLA alert', { context: 'send-reminders' })
        continue
      }

      const tpl = templates.slaDeadlineReminderEmail({
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        ticketUrl,
        hoursRemaining,
      })
      await email.send({ to: adminEmail, ...tpl })

      // 写入发送记录，防止重复发送
      const { error: insertError } = await supabase.from('ticket_events').insert({
        ticket_id: ticket.id,
        actor_role: 'admin',
        event_type: 'sla_deadline_reminder',
        payload_json: { hours_remaining: hoursRemaining },
      })

      if (insertError) {
        throw new Error(insertError.message)
      }

      results.reminders_sent++
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error('Failed to process SLA reminder', {
        context: 'send-reminders',
        ticketId: ticket.id,
        error,
      })
      results.errors.push(`sla reminder ${ticket.id}: ${message}`)
    }
  }

  // serverless 环境确保 Sentry 事件发送完毕
  await Sentry.flush(2000)
  return jsonWithStatus(results)
}
