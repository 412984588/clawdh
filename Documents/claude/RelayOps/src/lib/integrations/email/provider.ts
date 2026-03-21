export interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailProvider {
  send(payload: EmailPayload): Promise<void>
}

import { env } from '@/lib/config/env'

// 工厂函数：开发/测试环境返回 Mock，生产环境返回 Resend
export async function createEmailProvider(): Promise<EmailProvider> {
  if (env.INTEGRATION_MODE === 'mock') {
    return new ConsoleEmailProvider()
  }
  // 动态 ESM import，避免在 mock 模式下引入 Resend
  const { ResendEmailProvider } = await import('./resend')
  return new ResendEmailProvider()
}

class ConsoleEmailProvider implements EmailProvider {
  async send(payload: EmailPayload): Promise<void> {
    const separator = '\n' + '='.repeat(80) + '\n'
    console.warn('[EMAIL MOCK]', {
      to: payload.to,
      subject: payload.subject,
      preview: (payload.text ?? payload.html).slice(0, 100),
    })
    console.warn(`${separator}[EMAIL HTML - ${payload.to}]${separator}${payload.html}${separator}[END EMAIL]${separator}`)
  }
}
