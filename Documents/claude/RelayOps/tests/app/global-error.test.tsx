import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}))

import * as Sentry from '@sentry/nextjs'
import GlobalError from '@/app/global-error'

describe('GlobalError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reports error to Sentry on mount', () => {
    const error = new Error('layout crash')
    render(<GlobalError error={error} reset={() => {}} />)
    expect(Sentry.captureException).toHaveBeenCalledWith(error)
  })

  it('renders try again button', () => {
    const error = new Error('boom')
    const { getByText } = render(<GlobalError error={error} reset={() => {}} />)
    expect(getByText('Try again')).toBeDefined()
  })

  it('calls reset when button is clicked', async () => {
    const { userEvent } = await import('@testing-library/user-event')
    const error = new Error('boom')
    const reset = vi.fn()
    const { getByText } = render(<GlobalError error={error} reset={reset} />)
    await userEvent.setup().click(getByText('Try again'))
    expect(reset).toHaveBeenCalled()
  })
})
