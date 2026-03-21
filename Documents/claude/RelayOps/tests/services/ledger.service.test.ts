import { describe, it, expect } from 'vitest'
import {
  createLedgerEntry,
  confirmLedgerEntry,
  getLedgerEntriesForOrg,
  getAllLedgerEntries,
} from '@/lib/services/ledger.service'
import { createMockSupabase, ok, err, okWithCount } from '../helpers/mock-supabase'

const mockEntry = {
  id: 'ledger-1',
  ticket_id: 'ticket-1',
  organization_id: 'org-1',
  type: 'payment',
  amount: 299,
  currency: 'USD',
  status: 'pending',
}

const params = {
  ticketId: 'ticket-1',
  organizationId: 'org-1',
  type: 'invoice_payment' as const,
  amountDollars: 299,
}

describe('createLedgerEntry', () => {
  it('returns ledger entry on success', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(mockEntry))

    const result = await createLedgerEntry(supabase as any, params)
    expect(result.data?.id).toBe('ledger-1')
    expect(result.error).toBeNull()
  })

  it('returns error when insert fails', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('insert failed'))

    const result = await createLedgerEntry(supabase as any, params)
    expect(result.data).toBeNull()
    expect(result.error).toBe('insert failed')
  })

  it('rejects negative amount without hitting DB', async () => {
    const supabase = createMockSupabase()
    const result = await createLedgerEntry(supabase as any, { ...params, amountDollars: -50 })
    expect(result.data).toBeNull()
    expect(result.error).toBe('Amount must be positive')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('rejects zero amount without hitting DB', async () => {
    const supabase = createMockSupabase()
    const result = await createLedgerEntry(supabase as any, { ...params, amountDollars: 0 })
    expect(result.data).toBeNull()
    expect(result.error).toBe('Amount must be positive')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('rejects NaN amount without hitting DB', async () => {
    const supabase = createMockSupabase()
    const result = await createLedgerEntry(supabase as any, { ...params, amountDollars: NaN })
    expect(result.data).toBeNull()
    expect(result.error).toBe('Amount must be a finite number')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('rejects amount exceeding $100,000 without hitting DB', async () => {
    const supabase = createMockSupabase()
    const result = await createLedgerEntry(supabase as any, { ...params, amountDollars: 100_001 })
    expect(result.data).toBeNull()
    expect(result.error).toBe('Amount exceeds maximum ($100,000)')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('passes validation for amounts with floating point decimals', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(mockEntry))

    // 10.999 应通过校验（>0, <100K, finite），精度舍入后写入 DB
    const result = await createLedgerEntry(supabase as any, { ...params, amountDollars: 10.999 })
    expect(result.error).toBeNull()
    expect(supabase.from).toHaveBeenCalled()
  })
})

describe('confirmLedgerEntry', () => {
  it('returns no error on success', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(ok(null))

    const result = await confirmLedgerEntry(supabase as any, 'ledger-1')
    expect(result.error).toBeNull()
  })

  it('returns error message on failure', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('update error'))

    const result = await confirmLedgerEntry(supabase as any, 'ledger-1')
    expect(result.error).toBe('update error')
  })
})

describe('getLedgerEntriesForOrg', () => {
  it('returns entries for an organization with pagination', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(okWithCount([mockEntry], 1))

    const result = await getLedgerEntriesForOrg(supabase as any, 'org-1')
    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(1)
    expect(result.data[0].organization_id).toBe('org-1')
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(20)
    expect(result.totalPages).toBe(1)
  })

  it('returns empty array when none found', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(okWithCount(null, 0))

    const result = await getLedgerEntriesForOrg(supabase as any, 'org-empty')
    expect(result.data).toEqual([])
    expect(result.error).toBeNull()
    expect(result.total).toBe(0)
  })

  it('returns error when the organization query fails', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('ledger org query failed'))

    const result = await getLedgerEntriesForOrg(supabase as any, 'org-empty')
    expect(result.data).toEqual([])
    expect(result.error).toBe('ledger org query failed')
  })

  it('respects pagination params', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(okWithCount([mockEntry], 50))

    const result = await getLedgerEntriesForOrg(supabase as any, 'org-1', { page: 2, pageSize: 10 })
    expect(result.page).toBe(2)
    expect(result.pageSize).toBe(10)
    expect(result.totalPages).toBe(5)
  })
})

describe('getAllLedgerEntries', () => {
  it('returns all entries with pagination', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(okWithCount([mockEntry, { ...mockEntry, id: 'ledger-2' }], 2))

    const result = await getAllLedgerEntries(supabase as any)
    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(2)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(20)
  })

  it('returns empty array on null response', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(okWithCount(null, 0))

    const result = await getAllLedgerEntries(supabase as any)
    expect(result.data).toEqual([])
    expect(result.error).toBeNull()
  })

  it('returns error when the full ledger query fails', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(err('ledger query failed'))

    const result = await getAllLedgerEntries(supabase as any)
    expect(result.data).toEqual([])
    expect(result.error).toBe('ledger query failed')
  })

  it('supports type filter', async () => {
    const supabase = createMockSupabase()
    supabase.from.mockReturnValueOnce(okWithCount([mockEntry], 1))

    const result = await getAllLedgerEntries(supabase as any, {}, { type: 'invoice_payment' })
    expect(result.data).toHaveLength(1)
    expect(result.error).toBeNull()
  })
})
