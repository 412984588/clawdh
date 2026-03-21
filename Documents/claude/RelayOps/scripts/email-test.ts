/**
 * email-test.ts
 *
 * 通过 Resend API 发送 3 个核心邮件模板，验证：
 *   - subject、from 地址、HTML 内容是否正常
 *   - RESEND_API_KEY 是否有效
 *
 * 前置条件：
 *   - .env.local 中 RESEND_API_KEY 已填入真实 re_... key
 *   - EMAIL_FROM 已设置为 Resend 已验证的发件地址
 *     （或 Resend 免费测试时使用 onboarding@resend.dev）
 *
 * 运行：
 *   pnpm email:test your@email.com
 */

import { Resend } from 'resend'

// --- CLI arg ---------------------------------------------------------------

const TO = process.argv[2]
if (!TO || !TO.includes('@')) {
  console.error('Usage: pnpm email:test <your-email@example.com>')
  process.exit(1)
}

// --- 校验 env vars ---------------------------------------------------------

function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val || val.includes('...') || val.startsWith('re_...')) {
    console.error(`❌  ${key} is not configured. Set it in .env.local and retry.`)
    process.exit(1)
  }
  return val
}

const RESEND_API_KEY = requireEnv('RESEND_API_KEY')
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'RelayOps <onboarding@resend.dev>'

// --- Templates (inlined to avoid @/ path alias in standalone script) --------

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function wrap(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111">${body}</body></html>`
}

const templates = [
  {
    name: 'partner_access_approved',
    subject: 'Your RelayOps partner account has been approved',
    body: `<h2>Welcome to RelayOps, Alice!</h2><p>Your partner account has been approved. You can now submit tickets and manage your work through the portal.</p><p><a href="${APP_URL}/partner/tickets">Go to Partner Portal →</a></p>`,
    text: `Welcome to RelayOps, Alice!\n\nYour partner account has been approved.\nPortal: ${APP_URL}/partner/tickets`,
  },
  {
    name: 'invoice_sent',
    subject: 'Invoice ready: Deduplicate HubSpot records',
    body: `<h2>Hi Alice,</h2><p>Your invoice for <strong>Deduplicate HubSpot records</strong> is ready. Amount due: <strong>$250.00</strong>.</p><p><a href="https://invoice.stripe.com/i/test_preview_relayops">Pay Invoice →</a></p>`,
    text: `Hi Alice,\n\nYour invoice for "Deduplicate HubSpot records" is ready. Amount: $250.00\nPay here: https://invoice.stripe.com/i/test_preview_relayops`,
  },
  {
    name: 'payment_received',
    subject: 'Payment confirmed: Deduplicate HubSpot records',
    body: `<h2>Hi Alice,</h2><p>We've received your payment for <strong>Deduplicate HubSpot records</strong>. Work will begin shortly.</p><p><a href="${APP_URL}/partner/tickets/00000000-0000-0000-0000-000000000100">View Ticket →</a></p>`,
    text: `Hi Alice,\n\nPayment confirmed for "Deduplicate HubSpot records". Work begins shortly.\n${APP_URL}/partner/tickets/00000000-0000-0000-0000-000000000100`,
  },
]

// ---------------------------------------------------------------------------

const resend = new Resend(RESEND_API_KEY)

async function main() {
  console.log(`📧  Sending 3 test emails to: ${TO}`)
  console.log(`    From: ${EMAIL_FROM}\n`)

  let passed = 0
  let failed = 0

  for (const t of templates) {
    try {
      const { data, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to: TO,
        subject: t.subject,
        html: wrap(t.subject, t.body),
        text: t.text,
      })

      if (error) {
        console.error(`  FAIL  [${t.name}] Resend error: ${error.message}`)
        failed++
      } else {
        console.log(`  OK    [${t.name}] id=${data?.id}  subject="${t.subject}"`)
        passed++
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  FAIL  [${t.name}] ${msg}`)
      failed++
    }

    // Resend free tier: 2 req/s
    await new Promise((r) => setTimeout(r, 600))
  }

  console.log(`\n${passed === templates.length ? '✅' : '⚠️ '}  ${passed}/${templates.length} emails sent successfully.`)
  if (failed > 0) {
    console.log('    Check RESEND_API_KEY and EMAIL_FROM in .env.local.')
    process.exit(1)
  }
}

main().catch((err: unknown) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
