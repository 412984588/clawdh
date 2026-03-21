import { render, screen } from '@testing-library/react'
import { TicketStatusBadge } from '@/components/tickets/ticket-status-badge'

describe('TicketStatusBadge', () => {
  it('uses brand blue for review states', () => {
    render(<TicketStatusBadge status="submitted_for_review" />)

    const badge = screen.getByText('Submitted for Review')

    expect(badge.className).toContain('bg-blue-100')
    expect(badge.className).toContain('text-blue-700')
    expect(badge.className).not.toContain('indigo')
  })

  it('keeps semantic colors for success, warning, and destructive states', () => {
    const { rerender } = render(<TicketStatusBadge status="approved" />)
    expect(screen.getByText('Approved').className).toContain('green')

    rerender(<TicketStatusBadge status="queued" />)
    expect(screen.getByText('Queued').className).toContain('amber')

    rerender(<TicketStatusBadge status="disputed" />)
    expect(screen.getByText('Disputed').className).toContain('red')
  })
})
