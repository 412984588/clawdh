import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createServerClient } from '@/lib/supabase/server'
import { signOutAction } from '@/lib/actions/auth.actions'

vi.mock('@/lib/supabase/server', () => ({ createServerClient: vi.fn() }))

describe('auth.actions', () => {
  const signOut = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    signOut.mockResolvedValue({ error: null })
    vi.mocked(createServerClient).mockResolvedValue({
      auth: { signOut },
    } as any)
  })

  it('returns success when Supabase signOut succeeds', async () => {
    const result = await signOutAction()

    expect(result).toEqual({ success: true })
    expect(signOut).toHaveBeenCalledTimes(1)
  })

  it('returns an error result when Supabase signOut fails', async () => {
    signOut.mockResolvedValueOnce({ error: { message: 'signout failed' } })

    const result = await signOutAction()

    expect(result).toEqual({ success: false, error: 'Failed to sign out' })
  })
})
