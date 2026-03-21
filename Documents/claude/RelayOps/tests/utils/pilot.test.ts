import { describe, it, expect } from 'vitest'
import { checkPilotEligibility } from '@/lib/utils/pilot'
import { createMockSupabase, ok } from '../helpers/mock-supabase'

describe('checkPilotEligibility', () => {
  it('returns eligible when no existing pilot for org or domain', async () => {
    const supabase = createMockSupabase()
    // First call: org pilot check → null
    supabase.from.mockReturnValueOnce(ok(null))
    // Second call: domain users → empty array
    supabase.from.mockReturnValueOnce(ok([]))

    const result = await checkPilotEligibility(supabase as any, 'org-1', 'alice@newdomain.com')
    expect(result.eligible).toBe(true)
    expect(result.reason).toBeUndefined()
  })

  it('returns ineligible when org already has a pilot ticket', async () => {
    const supabase = createMockSupabase()
    // First call: org pilot check → found
    supabase.from.mockReturnValueOnce(ok({ id: 'ticket-999' }))

    const result = await checkPilotEligibility(supabase as any, 'org-1', 'alice@acme.com')
    expect(result.eligible).toBe(false)
    expect(result.reason).toMatch(/already used the pilot/)
  })

  it('returns ineligible when same email domain has a pilot in another org', async () => {
    const supabase = createMockSupabase()
    // First call: org pilot check → null (this org is clear)
    supabase.from.mockReturnValueOnce(ok(null))
    // Second call: domain users → returns users from other org
    supabase.from.mockReturnValueOnce(ok([{ organization_id: 'org-2' }]))
    // Third call: domain pilot tickets check → found
    supabase.from.mockReturnValueOnce(ok({ id: 'ticket-888' }))

    const result = await checkPilotEligibility(supabase as any, 'org-1', 'bob@acme.com')
    expect(result.eligible).toBe(false)
    expect(result.reason).toMatch(/email domain/)
  })

  it('remains eligible when domain users exist but none have pilot tickets', async () => {
    const supabase = createMockSupabase()
    // Org pilot check → null
    supabase.from.mockReturnValueOnce(ok(null))
    // Domain users → returns users from another org
    supabase.from.mockReturnValueOnce(ok([{ organization_id: 'org-3' }]))
    // Domain pilot check → null
    supabase.from.mockReturnValueOnce(ok(null))

    const result = await checkPilotEligibility(supabase as any, 'org-1', 'carol@shared.com')
    expect(result.eligible).toBe(true)
  })
})
