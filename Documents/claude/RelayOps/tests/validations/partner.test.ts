import { describe, it, expect } from 'vitest'
import { partnerApplicationSchema } from '@/lib/validations/partner'

const validInput = {
  first_name: 'Alice',
  last_name: 'Smith',
  email: 'alice@example.com',
  company_name: 'Acme Corp',
  website: 'https://acme.com',
  country: 'US',
  service_focus: 'We help companies build software solutions.',
  monthly_ticket_estimate: 10,
  data_handling_agreement: true as const,
}

describe('partnerApplicationSchema', () => {
  it('accepts valid input', () => {
    expect(() => partnerApplicationSchema.parse(validInput)).not.toThrow()
  })

  it('accepts empty website (optional)', () => {
    expect(() =>
      partnerApplicationSchema.parse({ ...validInput, website: '' })
    ).not.toThrow()
  })

  it('rejects invalid email', () => {
    const result = partnerApplicationSchema.safeParse({ ...validInput, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects first_name shorter than 2 chars', () => {
    const result = partnerApplicationSchema.safeParse({ ...validInput, first_name: 'A' })
    expect(result.success).toBe(false)
  })

  it('rejects last_name shorter than 2 chars', () => {
    const result = partnerApplicationSchema.safeParse({ ...validInput, last_name: 'B' })
    expect(result.success).toBe(false)
  })

  it('rejects service_focus shorter than 10 chars', () => {
    const result = partnerApplicationSchema.safeParse({ ...validInput, service_focus: 'Short' })
    expect(result.success).toBe(false)
  })

  it('rejects monthly_ticket_estimate of 0', () => {
    const result = partnerApplicationSchema.safeParse({ ...validInput, monthly_ticket_estimate: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects monthly_ticket_estimate above 1000', () => {
    const result = partnerApplicationSchema.safeParse({ ...validInput, monthly_ticket_estimate: 1001 })
    expect(result.success).toBe(false)
  })

  it('rejects data_handling_agreement = false', () => {
    const result = partnerApplicationSchema.safeParse({ ...validInput, data_handling_agreement: false })
    expect(result.success).toBe(false)
  })

  it('coerces string monthly_ticket_estimate to number', () => {
    const result = partnerApplicationSchema.safeParse({ ...validInput, monthly_ticket_estimate: '5' })
    expect(result.success).toBe(true)
  })
})
