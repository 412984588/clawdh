import type { SupabaseClient } from '@supabase/supabase-js'
import { createEmailProvider } from '@/lib/integrations/email/provider'
import * as templates from '@/lib/integrations/email/templates'
import { env } from '@/lib/config/env'
import { logger } from '@/lib/utils/logger'

// 通知分发入口 — 永远不会抛出异常，保护主流程
export async function notifyTicketEvent(
  supabase: SupabaseClient,
  ticketId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  try {
    await dispatchNotification(supabase, ticketId, eventType, payload)
  } catch (err) {
    logger.error('Failed to send notification', { context: 'notification', error: err, ticketId, eventType })
  }
}

// 内部分发函数，根据事件类型查询数据并发送邮件
async function dispatchNotification(
  supabase: SupabaseClient,
  ticketId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  const email = await createEmailProvider()

  // 获取工单基础信息 + 所属组织 + 组织成员邮箱
  const { data: ticket } = await supabase
    .from('tickets')
    .select('id, title, organization_id, organizations(id, name, users(id, email))')
    .eq('id', ticketId)
    .single()

  if (!ticket) return

  // Supabase join 返回数组，用 unknown 中转避免 TS 过度校验
  type OrgRow = { id: string; name: string; users: { id: string; email: string }[] }
  const rawOrg = ticket.organizations as unknown
  const org: OrgRow | null = Array.isArray(rawOrg) ? (rawOrg[0] as OrgRow) ?? null : (rawOrg as OrgRow | null)
  const partnerEmail = org?.users?.[0]?.email
  const partnerName = org?.name ?? 'Partner'
  const ticketUrl = `${env.NEXT_PUBLIC_APP_URL}/partner/tickets/${ticketId}`
  const ticketTitle = ticket.title as string

  switch (eventType) {
    case 'invoice_generated': {
      if (!partnerEmail) return
      const invoiceUrl = (payload.invoice_url as string | undefined) ?? ''
      const amount = (payload.amount as string | undefined) ?? ''
      const tpl = templates.invoiceSentEmail({ partnerName, ticketTitle, invoiceUrl, amount })
      await email.send({ to: partnerEmail, ...tpl })
      break
    }

    case 'payment_confirmed': {
      if (!partnerEmail) return
      const tpl = templates.paymentReceivedEmail({ partnerName, ticketTitle, ticketUrl })
      await email.send({ to: partnerEmail, ...tpl })
      break
    }

    case 'payment_failed': {
      if (!partnerEmail) return
      const tpl = templates.paymentFailedEmail({ partnerName, ticketTitle, ticketUrl })
      await email.send({ to: partnerEmail, ...tpl })
      break
    }

    case 'work_submitted': {
      if (!partnerEmail) return
      const tpl = templates.workSubmittedEmail({ partnerName, ticketTitle, ticketUrl })
      await email.send({ to: partnerEmail, ...tpl })
      break
    }

    case 'review_submitted': {
      // 通知分配到该工单的 worker
      // 路径：ticket_assignments → worker_profiles (via worker_id) → users (via user_id)
      const { data: assignment } = await supabase
        .from('ticket_assignments')
        .select('worker_id, worker_profiles(nickname, user_id, users(email))')
        .eq('ticket_id', ticketId)
        .maybeSingle()

      if (!assignment) return
      type WorkerProfileRow = { nickname: string; user_id: string; users: { email: string } | null }
      const rawWp = assignment.worker_profiles as unknown
      const wp: WorkerProfileRow | null = Array.isArray(rawWp)
        ? ((rawWp[0] as WorkerProfileRow) ?? null)
        : (rawWp as WorkerProfileRow | null)
      if (!wp?.users?.email) return

      // 按 decision 区分邮件模板：approved → 告知通过，否则 → 请求修改
      const decision = (payload.decision as string | undefined) ?? 'rejected'
      if (decision === 'approved') {
        const tpl = templates.reviewApprovedEmail({
          workerNickname: wp.nickname,
          ticketTitle,
        })
        await email.send({ to: wp.users.email, ...tpl })
      } else {
        const notes = (payload.notes as string | undefined) ?? ''
        const tpl = templates.revisionRequestedEmail({
          workerNickname: wp.nickname,
          ticketTitle,
          notes,
        })
        await email.send({ to: wp.users.email, ...tpl })
      }
      break
    }

    case 'dispute_opened': {
      // 通知管理员
      const adminEmail = env.ADMIN_NOTIFICATION_EMAIL ?? env.EMAIL_FROM
      if (!adminEmail) return
      const reason = (payload.reason as string | undefined) ?? ''
      const tpl = templates.disputeOpenedEmail({ adminEmail, ticketTitle, reason })
      await email.send({ to: adminEmail, ...tpl })
      break
    }

    case 'dispute_resolved': {
      if (!partnerEmail) return
      const tpl = templates.ticketCompletedEmail({ partnerName, ticketTitle })
      await email.send({ to: partnerEmail, ...tpl })
      break
    }

    case 'ticket_submitted': {
      if (!partnerEmail) return
      const tpl = templates.ticketSubmittedEmail({ partnerName, ticketTitle, ticketUrl })
      await email.send({ to: partnerEmail, ...tpl })
      break
    }

    case 'assignment_created': {
      // 通知管理员有新的工人分配
      const adminEmail = env.ADMIN_NOTIFICATION_EMAIL ?? env.EMAIL_FROM
      if (!adminEmail) return
      const workerNickname = (payload.worker_nickname as string | undefined) ?? 'Worker'
      const tpl = templates.workerAssignedEmail({ ticketTitle, workerNickname })
      await email.send({ to: adminEmail, ...tpl })
      break
    }

    default:
      // 未知事件类型 — 静默忽略
      break
  }
}
