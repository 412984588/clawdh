import { z } from 'zod'

export const envSchema = z.object({
  // Integration mode
  INTEGRATION_MODE: z.enum(['live', 'mock']).default('mock'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Stripe (optional in mock mode)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  // Resend (optional in mock mode)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('RelayOps <noreply@relayops.com>'),

  // Analytics (optional in mock mode)
  MIXPANEL_TOKEN: z.string().optional(),

  // Cron
  CRON_SECRET: z.string().optional(),
  ADMIN_NOTIFICATION_EMAIL: z.string().email().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Parse and validate env vars
function parseEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('❌ 环境变量配置错误:', result.error.flatten())
    throw new Error('Invalid environment variables')
  }
  return result.data
}

export const env = parseEnv()

// 生产环境严禁 mock 模式（仅在 Vercel 生产部署时触发，构建期跳过）
// VERCEL_ENV=production 只有真实 Vercel Production 部署才有，pnpm build 不会设置
if (process.env.VERCEL_ENV === 'production' && env.INTEGRATION_MODE === 'mock') {
  throw new Error(
    'FATAL: INTEGRATION_MODE=mock is not allowed in production. ' +
    'Set INTEGRATION_MODE=live in your production environment.'
  )
}

export type Env = z.infer<typeof envSchema>
