import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const signInWithOtp = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOtp: (...args: unknown[]) => signInWithOtp(...args),
    },
  }),
}))

import LoginPage from '@/app/(auth)/login/page'

describe('LoginPage', () => {
  beforeEach(() => {
    signInWithOtp.mockReset()
  })

  it('marks the email field as aria-required', () => {
    render(<LoginPage />)

    expect(screen.getByRole('textbox', { name: /email address/i })).toHaveAttribute(
      'aria-required',
      'true'
    )
  })

  it('links auth errors to the email input and announces them', async () => {
    const user = userEvent.setup()
    signInWithOtp.mockResolvedValue({
      error: {
        message: 'Unable to send magic link.',
      },
    })

    render(<LoginPage />)

    const emailInput = screen.getByRole('textbox', { name: /email address/i })
    await user.type(emailInput, 'jane@agency.com')
    await user.click(screen.getByRole('button', { name: /send magic link/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveAttribute('id', 'login-error')
    expect(alert).toHaveAttribute('aria-live', 'assertive')
    expect(emailInput).toHaveAttribute('aria-describedby', 'login-error')
  })
})
