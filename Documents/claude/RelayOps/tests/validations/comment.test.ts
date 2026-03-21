import { describe, it, expect } from 'vitest'
import { addCommentSchema } from '@/lib/validations/comment'

const validInput = {
  ticketId: '00000000-0000-0000-0000-000000000001',
  body: 'This is a valid comment.',
  visibility: 'partner_admin' as const,
}

describe('addCommentSchema', () => {
  it('accepts valid input', () => {
    expect(() => addCommentSchema.parse(validInput)).not.toThrow()
  })

  it('rejects empty body', () => {
    const result = addCommentSchema.safeParse({ ...validInput, body: '' })
    expect(result.success).toBe(false)
  })

  it('rejects body exceeding 5000 chars', () => {
    const result = addCommentSchema.safeParse({ ...validInput, body: 'x'.repeat(5001) })
    expect(result.success).toBe(false)
  })

  it('accepts all valid visibility values', () => {
    for (const v of ['partner_admin', 'worker_admin', 'internal_only'] as const) {
      expect(() => addCommentSchema.parse({ ...validInput, visibility: v })).not.toThrow()
    }
  })

  it('rejects invalid visibility value', () => {
    const result = addCommentSchema.safeParse({ ...validInput, visibility: 'public' })
    expect(result.success).toBe(false)
  })

  it('rejects non-UUID ticketId', () => {
    const result = addCommentSchema.safeParse({ ...validInput, ticketId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})
