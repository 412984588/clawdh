/**
 * stripe-setup.ts
 *
 * 为 Supabase 本地 DB 中每个没有 stripe_customer_id 的组织创建 Stripe test customer，
 * 然后把 customer.id 写回 organizations 表。
 *
 * 前置条件：
 *   - .env.local 中 STRIPE_SECRET_KEY 已填入真实 sk_test_... key
 *   - 本地 Supabase 运行中（supabase start + db reset）
 *
 * 运行：
 *   pnpm stripe:setup
 */

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// --- 校验 env vars ---------------------------------------------------------

function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val || val.includes('...')) {
    console.error(`❌  ${key} is not configured. Set it in .env.local and retry.`)
    process.exit(1)
  }
  return val
}

const STRIPE_SECRET_KEY = requireEnv('STRIPE_SECRET_KEY')
const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
const SUPABASE_SERVICE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

if (!STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  console.error('❌  STRIPE_SECRET_KEY must be a test key (sk_test_...).')
  process.exit(1)
}

// --- 客户端 ----------------------------------------------------------------

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ---------------------------------------------------------------------------

async function main() {
  console.log('🔧  Stripe setup — registering test customers for all orgs\n')

  const { data: orgs, error } = await supabase
    .from('organizations')
    .select('id, name, stripe_customer_id')
    .order('created_at', { ascending: true })

  if (error || !orgs?.length) {
    console.error('❌  Could not fetch organizations:', error?.message ?? 'empty result')
    console.error('    Make sure Supabase is running and db has been reset.')
    process.exit(1)
  }

  for (const org of orgs) {
    if (org.stripe_customer_id) {
      console.log(`  SKIP  ${org.name} — already has customer ${org.stripe_customer_id}`)
      continue
    }

    const customer = await stripe.customers.create({
      name: org.name,
      email: `billing@${org.name.toLowerCase().replace(/\s+/g, '-')}.example.com`,
      metadata: { relayops_org_id: org.id },
    })

    const { error: updateError } = await supabase
      .from('organizations')
      .update({ stripe_customer_id: customer.id })
      .eq('id', org.id)

    if (updateError) {
      console.error(`  ERROR ${org.name}:`, updateError.message)
    } else {
      console.log(`  OK    ${org.name} → Stripe customer: ${customer.id}`)
    }
  }

  console.log('\n✅  Done. You can now set INTEGRATION_MODE=live and test real invoices.')
  console.log('    Restart pnpm dev after changing INTEGRATION_MODE.\n')
}

main().catch((err: unknown) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
