import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewVerdictForm } from '@/components/admin/review-verdict-form'
import { submitReviewAction } from '@/lib/actions/admin.actions'
import { toast } from '@/hooks/use-toast'
import type { Ticket } from '@/lib/types/database'

vi.mock('@/lib/actions/admin.actions', () => ({ submitReviewAction: vi.fn() }))
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn(), useToast: vi.fn() }))

const baseTicket: Ticket = {
  id: 'ticket-1',
  organization_id: 'org-1',
  category: 'data_cleanup_import_prep',
  title: 'Test Ticket',
  problem_summary: 'problem summary',
  expected_output: 'expected output',
  acceptance_criteria_json: [{ id: 'c1', description: 'Criterion 1', required: true }],
  out_of_scope_json: [],
  sensitivity_level: 'standard',
  status: 'submitted_for_review',
  sla_hours_business: 48,
  overdue_flag: false,
  created_by: 'user-1',
  created_at: '2026-01-01T12:00:00Z',
  updated_at: '2026-01-01T12:00:00Z',
}

describe('ReviewVerdictForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null when ticket status is not submitted_for_review', () => {
    const { container } = render(
      <ReviewVerdictForm ticket={{ ...baseTicket, status: 'approved' }} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders verdict selection buttons', () => {
    render(<ReviewVerdictForm ticket={baseTicket} />)
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /request revision/i })).toBeInTheDocument()
  })

  it('shows failed criteria checkboxes when revision is selected', async () => {
    const user = userEvent.setup()
    render(<ReviewVerdictForm ticket={baseTicket} />)

    await user.click(screen.getByRole('button', { name: /request revision/i }))

    expect(screen.getByText('Criterion 1')).toBeInTheDocument()
  })

  it('calls submitReviewAction with approved decision', async () => {
    const user = userEvent.setup()
    vi.mocked(submitReviewAction).mockResolvedValue({ success: true })
    render(<ReviewVerdictForm ticket={baseTicket} />)

    await user.click(screen.getByRole('button', { name: /approve/i }))
    await user.click(screen.getByRole('button', { name: /submit review/i }))

    await waitFor(() =>
      expect(submitReviewAction).toHaveBeenCalledWith(
        expect.objectContaining({ ticketId: 'ticket-1', decision: 'approved' })
      )
    )
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Review submitted' }))
  })

  it('shows success card after successful submission', async () => {
    const user = userEvent.setup()
    vi.mocked(submitReviewAction).mockResolvedValue({ success: true })
    render(<ReviewVerdictForm ticket={baseTicket} />)

    await user.click(screen.getByRole('button', { name: /approve/i }))
    await user.click(screen.getByRole('button', { name: /submit review/i }))

    await waitFor(() =>
      expect(screen.getByText(/review submitted successfully/i)).toBeInTheDocument()
    )
  })

  it('shows error and destructive toast on failure', async () => {
    const user = userEvent.setup()
    vi.mocked(submitReviewAction).mockResolvedValue({
      success: false,
      error: 'Review failed',
    })
    render(<ReviewVerdictForm ticket={baseTicket} />)

    await user.click(screen.getByRole('button', { name: /approve/i }))
    await user.click(screen.getByRole('button', { name: /submit review/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Review failed'))
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }))
  })
})
