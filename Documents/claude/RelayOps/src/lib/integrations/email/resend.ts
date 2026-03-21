import { Resend } from 'resend'
import { env } from '@/lib/config/env'
import type { EmailProvider, EmailPayload } from './provider'

export class ResendEmailProvider implements EmailProvider {
  private client: Resend

  constructor() {
    if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set')
    this.client = new Resend(env.RESEND_API_KEY)
  }

  async send(payload: EmailPayload): Promise<void> {
    const { error } = await this.client.emails.send({
      from: env.EMAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    })
    if (error) throw new Error(`Resend error: ${error.message}`)
  }
}
