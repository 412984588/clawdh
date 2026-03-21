import { describe, it, expect } from 'vitest'
import { detectVagueness } from '@/lib/validations/ticket'

describe('detectVagueness', () => {
  it('detects "clean everything" as vague', () => {
    const messages = detectVagueness('Please clean everything in the database.')
    expect(messages.length).toBeGreaterThan(0)
    expect(messages.some((m) => /specify which fields/i.test(m))).toBe(true)
  })

  it('detects "cleanup everything" variant as vague', () => {
    const messages = detectVagueness('We need to cleanup everything before the import.')
    expect(messages.length).toBeGreaterThan(0)
  })

  it('detects "fix all issues" pattern via "all records" match', () => {
    const messages = detectVagueness('Please fix all records in the system.')
    expect(messages.length).toBeGreaterThan(0)
    expect(messages.some((m) => /how many records/i.test(m))).toBe(true)
  })

  it('detects "make it look better" as vague', () => {
    const messages = detectVagueness('We want to make it look better for the demo.')
    expect(messages.length).toBeGreaterThan(0)
    expect(messages.some((m) => /describe the exact output/i.test(m))).toBe(true)
  })

  it('does not flag specific, well-defined descriptions', () => {
    const messages = detectVagueness(
      'Remove duplicate email addresses from the contacts table where company_id = 123. ' +
      'The output should be a CSV with unique emails, keeping the most recently updated record.'
    )
    expect(messages).toHaveLength(0)
  })

  it('returns matched warning messages (not empty array) for vague text', () => {
    const messages = detectVagueness('Just fix it somehow.')
    expect(Array.isArray(messages)).toBe(true)
    expect(messages.length).toBeGreaterThan(0)
  })

  it('detects "not sure" pattern', () => {
    const messages = detectVagueness("We're not sure what format is needed.")
    expect(messages.some((m) => /clarify before submitting/i.test(m))).toBe(true)
  })

  it('detects "maybe" pattern', () => {
    const messages = detectVagueness('Maybe normalize the phone fields.')
    expect(messages.length).toBeGreaterThan(0)
  })

  it('detects "etc." pattern', () => {
    const messages = detectVagueness('Clean names, emails, phones, etc.')
    expect(messages.some((m) => /list all items/i.test(m))).toBe(true)
  })

  it('detects "if possible" pattern', () => {
    const messages = detectVagueness('Fix duplicates if possible.')
    expect(messages.some((m) => /either it.s in scope/i.test(m))).toBe(true)
  })

  it('detects "and more" pattern', () => {
    const messages = detectVagueness('Normalize company names, addresses, and more.')
    expect(messages.some((m) => /enumerate all items/i.test(m))).toBe(true)
  })

  it('detects multiple vagueness patterns in the same text', () => {
    const messages = detectVagueness(
      'Maybe cleanup everything if possible, all records, etc.'
    )
    expect(messages.length).toBeGreaterThan(2)
  })

  it('is case-insensitive for pattern matching', () => {
    expect(detectVagueness('MAYBE fix it.')).not.toEqual([])
    expect(detectVagueness('Cleanup Everything now.')).not.toEqual([])
  })

  it('returns empty array for text with no vagueness patterns', () => {
    const messages = detectVagueness(
      'Merge 2,500 duplicate company records using email as the canonical key. ' +
      'Produce a single output CSV and a separate change log.'
    )
    expect(messages).toEqual([])
  })
})
