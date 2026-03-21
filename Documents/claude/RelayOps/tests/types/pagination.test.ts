import { describe, it, expect } from 'vitest'
import { normalizePagination, buildPaginatedResult } from '@/lib/types/pagination'

describe('normalizePagination', () => {
  it('uses defaults when no params provided', () => {
    const result = normalizePagination()
    expect(result).toEqual({ page: 1, pageSize: 20, offset: 0 })
  })

  it('uses custom default page size', () => {
    const result = normalizePagination(undefined, 50)
    expect(result.pageSize).toBe(50)
  })

  it('calculates offset correctly', () => {
    const result = normalizePagination({ page: 3, pageSize: 10 })
    expect(result.offset).toBe(20)
  })

  it('clamps page to minimum 1 for page=0', () => {
    const result = normalizePagination({ page: 0 })
    expect(result.page).toBe(1)
    expect(result.offset).toBe(0)
  })

  it('clamps page to minimum 1 for negative page', () => {
    const result = normalizePagination({ page: -5 })
    expect(result.page).toBe(1)
  })

  it('clamps pageSize to minimum 1 for pageSize=0', () => {
    const result = normalizePagination({ pageSize: 0 })
    expect(result.pageSize).toBe(1)
  })

  it('clamps pageSize to minimum 1 for negative pageSize', () => {
    const result = normalizePagination({ pageSize: -10 })
    expect(result.pageSize).toBe(1)
  })

  it('clamps pageSize to maximum 100', () => {
    const result = normalizePagination({ pageSize: 500 })
    expect(result.pageSize).toBe(100)
  })

  it('floors fractional page numbers', () => {
    const result = normalizePagination({ page: 2.7 })
    expect(result.page).toBe(2)
  })
})

describe('buildPaginatedResult', () => {
  it('builds correct result with data', () => {
    const result = buildPaginatedResult(['a', 'b', 'c'], 25, 1, 10)
    expect(result).toEqual({
      data: ['a', 'b', 'c'],
      total: 25,
      page: 1,
      pageSize: 10,
      totalPages: 3,
    })
  })

  it('handles null total as 0', () => {
    const result = buildPaginatedResult([], null, 1, 20)
    expect(result.total).toBe(0)
    expect(result.totalPages).toBe(1)
  })

  it('returns at least 1 totalPages even for empty results', () => {
    const result = buildPaginatedResult([], 0, 1, 20)
    expect(result.totalPages).toBe(1)
  })

  it('calculates totalPages correctly for exact division', () => {
    const result = buildPaginatedResult([], 40, 1, 20)
    expect(result.totalPages).toBe(2)
  })

  it('rounds up totalPages for remainder', () => {
    const result = buildPaginatedResult([], 41, 1, 20)
    expect(result.totalPages).toBe(3)
  })

  it('returns empty data for page beyond range', () => {
    const result = buildPaginatedResult([], 10, 999, 20)
    expect(result.data).toEqual([])
    expect(result.total).toBe(10)
    expect(result.page).toBe(999)
  })
})
