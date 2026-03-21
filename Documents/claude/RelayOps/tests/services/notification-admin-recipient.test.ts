import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockSupabase, ok } from '../helpers/mock-supabase'

const send = vi.fn().mockResolvedValue(undefined)

vi.mock('@/lib/integrations/email/provider', () => ({
  createEmailProvider: () => ({ send }),
}))

vi.mock('@/lib/config/env', () => ({
  env: {
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    EMAIL_FROM: 'RelayOps <noreply@relayops.com>',
    ADMIN_NOTIFICATION_EMAIL: 'alerts@relayops.com',
  },
}))

import { notifyTicketEvent } from '@/lib/services/notification.service'

describe('notifyTicketEvent admin recipients', () => {
  beforeEach(() => {
    send.mockClear()
  })

  it('sends dispute alerts to ADMIN_NOTIFICATION_EMAIL when configured', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok({
      id: 'ticket-1',
      title: 'Fix the import',
      organization_id: 'org-1',
      organizations: {
        id: 'org-1',
        name: 'Acme Corp',
        users: [{ id: 'user-1', email: 'partner@acme.com' }],
      },
    }))

    await notifyTicketEvent(supabase as any, 'ticket-1', 'dispute_opened', {
      reason: 'Data mismatch',
    })

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'alerts@relayops.com' })
    )
  })
})
