import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MotionProvider } from '@/components/ui/motion'
import { TicketStatusBadge } from '@/components/tickets/ticket-status-badge'

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

describe('TicketStatusBadge', () => {
  it('uses brand blue for review states', () => {
    mockMatchMedia(true)
    render(
      <MotionProvider>
        <TicketStatusBadge status="submitted_for_review" />
      </MotionProvider>
    )

    const badge = screen.getByText('Submitted for Review')

    expect(badge.className).toContain('bg-blue-100')
    expect(badge.className).toContain('text-blue-700')
    expect(badge.className).not.toContain('indigo')
  })

  it('keeps semantic colors for success, warning, and destructive states', () => {
    mockMatchMedia(true)
    const { rerender } = render(
      <MotionProvider>
        <TicketStatusBadge status="approved" />
      </MotionProvider>
    )
    expect(screen.getByText('Approved').className).toContain('green')

    rerender(
      <MotionProvider>
        <TicketStatusBadge status="queued" />
      </MotionProvider>
    )
    expect(screen.getByText('Queued').className).toContain('amber')

    rerender(
      <MotionProvider>
        <TicketStatusBadge status="disputed" />
      </MotionProvider>
    )
    expect(screen.getByText('Disputed').className).toContain('red')
  })

  it('renders a keyed motion wrapper for animated status changes', () => {
    mockMatchMedia(true)
    const { rerender } = render(
      <MotionProvider>
        <TicketStatusBadge status="queued" />
      </MotionProvider>
    )

    expect(screen.getByTestId('ticket-status-badge-motion')).toHaveAttribute('data-status', 'queued')

    rerender(
      <MotionProvider>
        <TicketStatusBadge status="approved" />
      </MotionProvider>
    )

    expect(screen.getByTestId('ticket-status-badge-motion')).toHaveAttribute('data-status', 'approved')
  })
})
