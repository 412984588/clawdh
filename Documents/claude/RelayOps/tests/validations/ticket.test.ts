import { describe, it, expect } from 'vitest'
import { ticketCreateSchema, detectVagueness } from '@/lib/validations/ticket'

describe('ticketCreateSchema', () => {
  const validInput = {
    title: 'Clean duplicate company records in HubSpot export',
    category: 'data_cleanup_import_prep',
    problem_summary:
      'We have over 2,000 duplicate company records in our HubSpot export. Each duplicate has a different email domain causing import failures.',
    expected_output:
      'A cleaned CSV file with duplicate companies merged and a log of all changes made.',
    acceptance_criteria_json: [
      { id: 'c1', description: 'All duplicate companies are merged', required: true },
    ],
    out_of_scope_json: ['Contact deduplication'],
    sensitivity_level: 'standard',
  }

  it('accepts valid input', () => {
    const result = ticketCreateSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('rejects title that is too short', () => {
    const result = ticketCreateSchema.safeParse({ ...validInput, title: 'Hi' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title).toBeDefined()
    }
  })

  it('rejects problem_summary shorter than 50 chars', () => {
    const result = ticketCreateSchema.safeParse({ ...validInput, problem_summary: 'Too short.' })
    expect(result.success).toBe(false)
  })

  it('rejects expected_output shorter than 30 chars', () => {
    const result = ticketCreateSchema.safeParse({ ...validInput, expected_output: 'Short.' })
    expect(result.success).toBe(false)
  })

  it('rejects empty acceptance criteria', () => {
    const result = ticketCreateSchema.safeParse({
      ...validInput,
      acceptance_criteria_json: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid category', () => {
    const result = ticketCreateSchema.safeParse({ ...validInput, category: 'unknown_category' })
    expect(result.success).toBe(false)
  })

  it('coerces string row_count_estimate to number', () => {
    const result = ticketCreateSchema.safeParse({
      ...validInput,
      row_count_estimate: '5000',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.row_count_estimate).toBe(5000)
    }
  })

  it('rejects file_count_estimate above 50', () => {
    const result = ticketCreateSchema.safeParse({
      ...validInput,
      file_count_estimate: 51,
    })
    expect(result.success).toBe(false)
  })

  it('defaults sensitivity_level to standard', () => {
    const { sensitivity_level, ...withoutSensitivity } = validInput
    const result = ticketCreateSchema.safeParse(withoutSensitivity)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.sensitivity_level).toBe('standard')
    }
  })
})

describe('detectVagueness', () => {
  it('returns empty array for clear, specific text', () => {
    const text = 'Clean 2,500 duplicate company records in the HubSpot export CSV.'
    expect(detectVagueness(text)).toEqual([])
  })

  it('detects "cleanup everything" pattern', () => {
    const warnings = detectVagueness('Please cleanup everything in the database.')
    expect(warnings.length).toBeGreaterThan(0)
    expect(warnings[0]).toMatch(/specify which fields/i)
  })

  it('detects "all records" pattern', () => {
    const warnings = detectVagueness('Fix all records in the system.')
    expect(warnings.some((w) => /how many records/i.test(w))).toBe(true)
  })

  it('detects "etc." pattern', () => {
    const warnings = detectVagueness('Clean names, emails, phones, etc.')
    expect(warnings.some((w) => /list all items/i.test(w))).toBe(true)
  })

  it('detects "maybe" pattern', () => {
    const warnings = detectVagueness('Maybe normalize the phone fields.')
    expect(warnings.length).toBeGreaterThan(0)
  })

  it('detects "if possible" pattern', () => {
    const warnings = detectVagueness('Fix duplicates if possible.')
    expect(warnings.some((w) => /either it.s in scope/i.test(w))).toBe(true)
  })

  it('detects multiple vagueness patterns in the same text', () => {
    const text = 'Maybe cleanup everything if possible, all records, etc.'
    const warnings = detectVagueness(text)
    expect(warnings.length).toBeGreaterThan(2)
  })

  it('is case-insensitive', () => {
    expect(detectVagueness('MAYBE fix it.')).not.toEqual([])
    expect(detectVagueness('Cleanup Everything now.')).not.toEqual([])
  })
})
