import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssignmentActionButtons } from '@/components/worker/assignment-action-buttons'
import { acknowledgeAssignmentAction } from '@/lib/actions/worker.actions'
import { toast } from '@/hooks/use-toast'
import type { TicketAssignment } from '@/lib/types/database'

vi.mock('@/lib/actions/worker.actions', () => ({
  acknowledgeAssignmentAction: vi.fn(),
  startWorkAction: vi.fn(),
}))
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn(), useToast: vi.fn() }))

const baseAssignment: TicketAssignment = {
  id: 'assign-1',
  ticket_id: 'ticket-1',
  worker_id: 'worker-1',
  assigned_by: 'admin-1',
  assigned_at: '2026-01-01T12:00:00Z',
  status: 'pending',
}

describe('AssignmentActionButtons', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows Acknowledge button when status is pending', () => {
    render(<AssignmentActionButtons ticketId="t1" assignment={baseAssignment} />)
    expect(screen.getByRole('button', { name: /acknowledge/i })).toBeInTheDocument()
  })

  it('shows Start Work button when status is acknowledged', () => {
    render(
      <AssignmentActionButtons
        ticketId="t1"
        assignment={{ ...baseAssignment, status: 'acknowledged' }}
      />
    )
    expect(screen.getByRole('button', { name: /start work/i })).toBeInTheDocument()
  })

  it('shows in-progress text when status is in_progress', () => {
    render(
      <AssignmentActionButtons
        ticketId="t1"
        assignment={{ ...baseAssignment, status: 'in_progress' }}
      />
    )
    expect(screen.getByText(/work in progress/i)).toBeInTheDocument()
  })

  it('calls acknowledgeAssignmentAction on acknowledge click', async () => {
    const user = userEvent.setup()
    vi.mocked(acknowledgeAssignmentAction).mockResolvedValue({ success: true })
    render(<AssignmentActionButtons ticketId="t1" assignment={baseAssignment} />)

    await user.click(screen.getByRole('button', { name: /acknowledge/i }))

    await waitFor(() =>
      expect(acknowledgeAssignmentAction).toHaveBeenCalledWith({ assignmentId: 'assign-1' })
    )
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Assignment acknowledged' }))
  })

  it('shows error message on acknowledge failure', async () => {
    const user = userEvent.setup()
    vi.mocked(acknowledgeAssignmentAction).mockResolvedValue({
      success: false,
      error: 'Not found',
    })
    render(<AssignmentActionButtons ticketId="t1" assignment={baseAssignment} />)

    await user.click(screen.getByRole('button', { name: /acknowledge/i }))

    await waitFor(() => expect(screen.getByText('Not found')).toBeInTheDocument())
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }))
  })
})
