import { describe, it, expect } from 'vitest'
import {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  isAppError,
} from '@/lib/utils/errors'

describe('AppError', () => {
  it('creates error with correct properties', () => {
    const err = new AppError('test message', 'TEST_CODE', 400)
    expect(err.message).toBe('test message')
    expect(err.code).toBe('TEST_CODE')
    expect(err.statusCode).toBe(400)
    expect(err.name).toBe('AppError')
  })
})

describe('UnauthorizedError', () => {
  it('has correct statusCode', () => {
    const err = new UnauthorizedError()
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHORIZED')
  })
})

describe('ForbiddenError', () => {
  it('has correct statusCode', () => {
    const err = new ForbiddenError()
    expect(err.statusCode).toBe(403)
  })
})

describe('NotFoundError', () => {
  it('includes resource name in message', () => {
    const err = new NotFoundError('Ticket')
    expect(err.message).toBe('Ticket not found')
    expect(err.statusCode).toBe(404)
  })
})

describe('ValidationError', () => {
  it('has correct statusCode', () => {
    const err = new ValidationError('Invalid input')
    expect(err.statusCode).toBe(422)
  })
})

describe('isAppError', () => {
  it('returns true for AppError instances', () => {
    expect(isAppError(new AppError('x', 'X'))).toBe(true)
  })

  it('returns false for plain errors', () => {
    expect(isAppError(new Error('plain'))).toBe(false)
  })

  it('returns false for non-errors', () => {
    expect(isAppError('string')).toBe(false)
    expect(isAppError(null)).toBe(false)
  })
})
