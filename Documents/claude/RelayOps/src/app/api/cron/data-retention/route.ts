import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { createAdminClient } from '@/lib/supabase/admin'
import { env } from '@/lib/config/env'
import { timingSafeCompare } from '@/lib/utils/crypto'
import { ALL_TERMINAL_STATUSES } from '@/lib/constants/ticket-statuses'
import { logger } from '@/lib/utils/logger'
import { triggerAlert } from '@/lib/utils/alerts'

// Vercel Cron: 每天凌晨 2 点执行
// 按保留规则删除过期附件记录
// 生产环境还应同时调用 storage.remove() 删除实际文件

interface RetentionRule {
  days: number
  statuses?: string[]
  tier?: string
}

const RETENTION_RULES: RetentionRule[] = [
  { statuses: ['expired', 'cancelled'], days: 7 },
  { tier: 'pilot', statuses: ALL_TERMINAL_STATUSES, days: 14 },
  { statuses: ['completed', 'rejected', 'disputed'], days: 30 },
  { statuses: ['resolved'], days: 90 },
]

function jsonWithStatus(results: { deleted: number; errors: string[] }) {
  if (results.errors.length > 0) {
    return NextResponse.json(results, {
      status: results.deleted > 0 ? 207 : 500,
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
  const now = Date.now()
  const results = { deleted: 0, errors: [] as string[] }

  for (const rule of RETENTION_RULES) {
    const cutoff = new Date(now - rule.days * 24 * 3600 * 1000).toISOString()

    // 查询符合规则的工单 ID
    let ticketQuery = supabase.from('tickets').select('id')

    if (rule.statuses && rule.statuses.length > 0) {
      ticketQuery = ticketQuery.in('status', rule.statuses)
    }
    if (rule.tier) {
      ticketQuery = ticketQuery.eq('pricing_tier', rule.tier)
    }

    const { data: tickets, error: ticketsError } = await ticketQuery
    if (ticketsError) {
      logger.error('Failed to query tickets for retention', {
        context: 'data-retention',
        error: ticketsError.message,
        rule,
      })
      results.errors.push(ticketsError.message)
      return jsonWithStatus(results)
    }

    if (!tickets?.length) continue

    const ticketIds = tickets.map((t: { id: string }) => t.id)

    // 查询要删除的附件记录（先获取 storage_path 用于文件删除）
    const { data: toDelete, error: attachmentsError } = await supabase
      .from('attachments')
      .select('id, storage_path')
      .in('ticket_id', ticketIds)
      .lt('created_at', cutoff)

    if (attachmentsError) {
      logger.error('Failed to query attachments for retention', {
        context: 'data-retention',
        error: attachmentsError.message,
        rule,
      })
      results.errors.push(attachmentsError.message)
      continue
    }

    if (!toDelete?.length) continue

    // 先删数据库记录（孤儿 DB 记录不安全；孤儿 Storage 文件安全）
    const attachmentIds = toDelete.map((a: { id: string }) => a.id)
    const { error: deleteError } = await supabase.from('attachments').delete().in('id', attachmentIds)

    if (deleteError) {
      logger.error('Failed to delete attachment rows during retention', {
        context: 'data-retention',
        error: deleteError.message,
        attachmentIds,
      })
      results.errors.push(deleteError.message)
      continue
    }

    // 再删 Storage 实际文件
    const storagePaths = toDelete.map((a: { id: string; storage_path: string }) => a.storage_path)
    results.deleted += toDelete.length

    const { error: storageError } = await supabase.storage.from('ticket-files').remove(storagePaths)
    if (storageError) {
      logger.error('Failed to delete attachment files from storage', {
        context: 'data-retention',
        error: storageError.message,
        storagePaths,
      })
      results.errors.push(storageError.message)
    }
  }

  // 结构化日志：cron 执行结果摘要
  if (results.errors.length > 0) {
    triggerAlert('cron_partial_failure', { cronJob: 'data-retention', ...results }, { context: 'cron-data-retention' })
  } else {
    triggerAlert('cron_completed', { cronJob: 'data-retention', ...results }, { context: 'cron-data-retention' })
  }

  // serverless 环境确保 Sentry 事件发送完毕
  await Sentry.flush(2000)
  return jsonWithStatus(results)
}
