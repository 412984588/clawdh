import { describe, it, expect } from 'vitest'
import { reviewSubmitSchema } from '@/lib/validations/review'

const validInput = {
  ticketId: '00000000-0000-0000-0000-000000000001',
  decision: 'approved' as const,
}

describe('reviewSubmitSchema', () => {
  it('accepts approved decision', () => {
    expect(() => reviewSubmitSchema.parse(validInput)).not.toThrow()
  })

  it('accepts revision_requested decision', () => {
    expect(() =>
      reviewSubmitSchema.parse({ ...validInput, decision: 'revision_requested' })
    ).not.toThrow()
  })

  it('rejects invalid decision value', () => {
    const result = reviewSubmitSchema.safeParse({ ...validInput, decision: 'rejected' })
    expect(result.success).toBe(false)
  })

  it('rejects non-UUID ticketId', () => {
    const result = reviewSubmitSchema.safeParse({ ...validInput, ticketId: 'bad-id' })
    expect(result.success).toBe(false)
  })

  it('defaults acceptanceFailures to empty array when omitted', () => {
    const result = reviewSubmitSchema.parse(validInput)
    expect(result.acceptanceFailures).toEqual([])
  })

  it('accepts acceptanceFailures as array of strings', () => {
    const result = reviewSubmitSchema.parse({
      ...validInput,
      decision: 'revision_requested',
      acceptanceFailures: ['missing unit tests', 'broken link'],
    })
    expect(result.acceptanceFailures).toHaveLength(2)
  })

  it('accepts optional notes within 2000 chars', () => {
    expect(() =>
      reviewSubmitSchema.parse({ ...validInput, notes: 'Looks good!' })
    ).not.toThrow()
  })

  it('rejects notes exceeding 2000 chars', () => {
    const result = reviewSubmitSchema.safeParse({ ...validInput, notes: 'n'.repeat(2001) })
    expect(result.success).toBe(false)
  })
})
