/**
 * stripe-pay-test.ts
 *
 * 测试 invoiced → paid → queued 状态机跳转。
 *
 * 支持两种模式：
 *   mock  — 直接向本地 webhook 端点 POST 伪造的 invoice.paid 事件，
 *            无需真实 Stripe key，无需 Stripe CLI
 *   live  — 通过 Stripe API 支付真实测试发票，
 *            需要 Stripe CLI `stripe listen` 将 webhook 转发到本地
 *
 * 前置条件：
 *   - 本地 Supabase 运行中（supabase start + db reset）
 *   - 本地 pnpm dev 在 http://localhost:3000 运行
 *   - DB 中存在至少一个 status='invoiced' 且 stripe_invoice_id 非空的票据
 *     （通过 admin UI 走完 scope-and-invoice 流程后得到）
 *
 * 运行：
 *   pnpm stripe:pay           # mock 模式（无需 Stripe key，推荐验证本地流程）
 *   pnpm stripe:pay --live    # live 模式（需要 STRIPE_SECRET_KEY + Stripe CLI）
 */

import { createClient } from '@supabase/supabase-js'

// --- CLI flags ---------------------------------------------------------------

const LIVE_MODE = process.argv.includes('--live')
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const WEBHOOK_URL = `${APP_URL}/api/webhooks/stripe`

// --- 校验 env vars -----------------------------------------------------------

function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val || val.includes('...')) {
    console.error(`❌  ${key} is not configured. Set it in .env.local and retry.`)
    process.exit(1)
  }
  return val
}

const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
const SUPABASE_SERVICE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

// --- 客户端 ------------------------------------------------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// --- 工具函数 ----------------------------------------------------------------

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/** 轮询等待票据进入目标状态，最多等待 waitMs 毫秒 */
async function waitForStatus(
  ticketId: string,
  targetStatus: string,
  waitMs = 5000,
  intervalMs = 500
): Promise<string> {
  const deadline = Date.now() + waitMs
  while (Date.now() < deadline) {
    const { data } = await supabase
      .from('tickets')
      .select('status')
      .eq('id', ticketId)
      .single()
    if (data?.status === targetStatus) return targetStatus
    await sleep(intervalMs)
  }
  // 返回最终实际状态
  const { data } = await supabase.from('tickets').select('status').eq('id', ticketId).single()
  return data?.status ?? 'unknown'
}

// --- 核心逻辑 ----------------------------------------------------------------

async function main() {
  console.log(`🔧  Stripe pay test (${LIVE_MODE ? 'live' : 'mock'} mode)\n`)

  // 1. 找到一个 invoiced 状态且有 stripe_invoice_id 的票据
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('id, title, stripe_invoice_id, invoice_url')
    .eq('status', 'invoiced')
    .not('stripe_invoice_id', 'is', null)
    .order('created_at', { ascending: true })
    .limit(1)

  if (error || !tickets?.length) {
    console.error('❌  No invoiced ticket found in the database.')
    console.error('    Make sure you have run the scope-and-invoice workflow first:')
    console.error('    1. Log in as admin → open a ticket → click "Review" → "Lock Scope"')
    console.error(
      LIVE_MODE
        ? '    2. Ensure INTEGRATION_MODE=live in .env.local and restart pnpm dev'
        : '    2. INTEGRATION_MODE=mock is fine for this test'
    )
    process.exit(1)
  }

  const ticket = tickets[0]
  const invoiceId = ticket.stripe_invoice_id as string
  console.log(`  Ticket:     ${ticket.id}`)
  console.log(`  Title:      ${ticket.title}`)
  console.log(`  Invoice ID: ${invoiceId}`)
  if (ticket.invoice_url) console.log(`  Invoice URL: ${ticket.invoice_url}`)
  console.log()

  if (LIVE_MODE) {
    // ── live 模式：通过 Stripe API 支付发票 ─────────────────────────────────
    const STRIPE_SECRET_KEY = requireEnv('STRIPE_SECRET_KEY')
    if (!STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      console.error('❌  STRIPE_SECRET_KEY must be a test key (sk_test_...).')
      process.exit(1)
    }

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })

    // 确认发票存在且未支付
    let invoice
    try {
      invoice = await stripe.invoices.retrieve(invoiceId)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`❌  Could not retrieve invoice ${invoiceId}: ${msg}`)
      console.error('    Make sure INTEGRATION_MODE=live when the invoice was created.')
      process.exit(1)
    }

    if (invoice.status === 'paid') {
      console.log('⚠️   Invoice is already paid in Stripe. Checking DB status...')
    } else if (invoice.status !== 'open') {
      console.error(`❌  Invoice status is '${invoice.status}', expected 'open'.`)
      process.exit(1)
    } else {
      console.log(`  Paying invoice ${invoiceId} via Stripe test mode...`)
      try {
        await stripe.invoices.pay(invoiceId)
        console.log('  OK    Invoice paid in Stripe.')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`❌  stripe.invoices.pay failed: ${msg}`)
        console.error('    Make sure Stripe CLI is running:')
        console.error(
          `    stripe listen --forward-to ${WEBHOOK_URL} --events invoice.paid`
        )
        process.exit(1)
      }
    }

    console.log()
    console.log('  Waiting for webhook to process (up to 5s)...')
    console.log(`  (Run: stripe listen --forward-to ${WEBHOOK_URL})`)
  } else {
    // ── mock 模式：直接 POST 伪造的 invoice.paid 到本地 webhook 端点 ────────
    const payload = JSON.stringify({
      type: 'invoice.paid',
      data: {
        object: {
          id: invoiceId,
          amount_paid: 25000, // 250.00 USD in cents（仅用于 ledger entry）
          currency: 'usd',
          customer: 'cus_mock_test',
        },
      },
    })

    console.log(`  POSTing mock invoice.paid event to ${WEBHOOK_URL}`)
    let res: Response
    try {
      res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`❌  Could not reach ${WEBHOOK_URL}: ${msg}`)
      console.error('    Make sure pnpm dev is running on localhost:3000.')
      process.exit(1)
    }

    if (!res.ok) {
      const body = await res.text()
      console.error(`❌  Webhook returned HTTP ${res.status}: ${body}`)
      console.error(
        '    Hint: Make sure INTEGRATION_MODE=mock (or unset) in .env.local.'
      )
      process.exit(1)
    }

    const json = (await res.json()) as Record<string, unknown>
    if (json.received !== true) {
      console.error('❌  Webhook responded but did not return { received: true }')
      process.exit(1)
    }
    console.log('  OK    Webhook accepted the event.')
  }

  // 2. 轮询确认状态已变为 queued
  const finalStatus = await waitForStatus(ticket.id, 'queued')

  console.log()
  if (finalStatus === 'queued') {
    console.log(`✅  Ticket ${ticket.id} transitioned: invoiced → paid → queued`)
    console.log('    The invoiced→paid→queued workflow is working correctly.')
  } else {
    console.error(`❌  Expected status 'queued' but got '${finalStatus}'`)
    console.error(`    Ticket ID: ${ticket.id}`)
    console.error('    Check the pnpm dev server logs for errors.')
    process.exit(1)
  }
}

main().catch((err: unknown) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
