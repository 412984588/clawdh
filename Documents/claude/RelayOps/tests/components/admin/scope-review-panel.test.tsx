import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScopeReviewPanel } from '@/components/admin/scope-review-panel'
import { scopeAndInvoiceTicket } from '@/lib/actions/billing.actions'
import { adminTransitionTicket } from '@/lib/actions/ticket.actions'
import { toast } from '@/hooks/use-toast'
import type { Ticket } from '@/lib/types/database'

vi.mock('@/lib/actions/billing.actions', () => ({ scopeAndInvoiceTicket: vi.fn() }))
vi.mock('@/lib/actions/ticket.actions', () => ({ adminTransitionTicket: vi.fn() }))
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn(), useToast: vi.fn() }))

const baseTicket: Ticket = {
  id: 'ticket-1',
  organization_id: 'org-1',
  category: 'data_cleanup_import_prep',
  title: 'Test Ticket',
  problem_summary: 'problem summary',
  expected_output: 'expected output',
  acceptance_criteria_json: [],
  out_of_scope_json: [],
  sensitivity_level: 'standard',
  status: 'needs_scope_review',
  sla_hours_business: 48,
  overdue_flag: false,
  created_by: 'user-1',
  created_at: '2026-01-01T12:00:00Z',
  updated_at: '2026-01-01T12:00:00Z',
}

describe('ScopeReviewPanel', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null when ticket status is not needs_scope_review', () => {
    const { container } = render(
      <ScopeReviewPanel ticket={{ ...baseTicket, status: 'queued' }} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders price input and action buttons', () => {
    render(<ScopeReviewPanel ticket={baseTicket} />)
    expect(screen.getByLabelText(/scoped price/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /lock scope/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel ticket/i })).toBeInTheDocument()
  })

  it('shows validation error for invalid price', async () => {
    const user = userEvent.setup()
    render(<ScopeReviewPanel ticket={baseTicket} />)

    // Click Lock Scope without entering a price
    await user.click(screen.getByRole('button', { name: /lock scope/i }))

    await waitFor(() =>
      expect(screen.getByText(/please enter a valid price/i)).toBeInTheDocument()
    )
  })

  it('calls scopeAndInvoiceTicket with correct args', async () => {
    const user = userEvent.setup()
    vi.mocked(scopeAndInvoiceTicket).mockResolvedValue({
      success: true,
      data: { invoiceUrl: 'https://stripe.com/invoice/123' },
    })
    render(<ScopeReviewPanel ticket={baseTicket} />)

    await user.type(screen.getByLabelText(/scoped price/i), '299')
    await user.click(screen.getByRole('button', { name: /lock scope/i }))

    await waitFor(() =>
      expect(scopeAndInvoiceTicket).toHaveBeenCalledWith(
        expect.objectContaining({ ticketId: 'ticket-1', priceDollars: 299 })
      )
    )
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Scope locked & invoice sent' }))
  })

  it('shows invoice URL after successful scope lock', async () => {
    const user = userEvent.setup()
    vi.mocked(scopeAndInvoiceTicket).mockResolvedValue({
      success: true,
      data: { invoiceUrl: 'https://stripe.com/invoice/123' },
    })
    render(<ScopeReviewPanel ticket={baseTicket} />)

    await user.type(screen.getByLabelText(/scoped price/i), '199')
    await user.click(screen.getByRole('button', { name: /lock scope/i }))

    await waitFor(() => expect(screen.getByText(/invoice sent/i)).toBeInTheDocument())
    expect(screen.getByRole('link', { name: /view invoice/i })).toBeInTheDocument()
  })

  it('calls adminTransitionTicket for close action', async () => {
    const user = userEvent.setup()
    const onTransitioned = vi.fn()
    vi.mocked(adminTransitionTicket).mockResolvedValue({ success: true })
    render(<ScopeReviewPanel ticket={baseTicket} onTransitioned={onTransitioned} />)

    await user.click(screen.getByRole('button', { name: /close/i }))

    await waitFor(() =>
      expect(adminTransitionTicket).toHaveBeenCalledWith(
        'ticket-1',
        'admin_closed_no_response',
        expect.any(Object)
      )
    )
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Ticket closed' }))
    expect(onTransitioned).toHaveBeenCalled()
  })

  it('shows destructive toast on scope lock failure', async () => {
    const user = userEvent.setup()
    vi.mocked(scopeAndInvoiceTicket).mockResolvedValue({
      success: false,
      error: 'Stripe error',
    })
    render(<ScopeReviewPanel ticket={baseTicket} />)

    await user.type(screen.getByLabelText(/scoped price/i), '199')
    await user.click(screen.getByRole('button', { name: /lock scope/i }))

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }))
    )
  })
})
