import { describe, it, expect, vi } from 'vitest'
import { createEmailProvider } from '@/lib/integrations/email/provider'

describe('createEmailProvider (mock mode)', () => {
  it('returns a provider with a send method', async () => {
    const provider = await createEmailProvider()
    expect(typeof provider.send).toBe('function')
  })

  it('send() resolves without throwing in mock mode', async () => {
    const provider = await createEmailProvider()
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await expect(
      provider.send({ to: 'test@example.com', subject: 'Hello', html: '<p>Hi</p>', text: 'Hi' })
    ).resolves.toBeUndefined()
    consoleSpy.mockRestore()
  })

  it('send() logs to console in mock mode', async () => {
    const provider = await createEmailProvider()
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await provider.send({ to: 'user@example.com', subject: 'Subject', html: '<b>body</b>' })
    expect(consoleSpy).toHaveBeenCalledWith('[EMAIL MOCK]', expect.objectContaining({ to: 'user@example.com' }))
    consoleSpy.mockRestore()
  })
})
