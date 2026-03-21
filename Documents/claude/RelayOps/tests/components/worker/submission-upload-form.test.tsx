import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubmissionUploadForm } from '@/components/worker/submission-upload-form'
import { submitWorkAction } from '@/lib/actions/worker.actions'
import { toast } from '@/hooks/use-toast'
import type { TicketAssignment } from '@/lib/types/database'

vi.mock('@/lib/actions/worker.actions', () => ({ submitWorkAction: vi.fn() }))
vi.mock('@/lib/actions/upload.actions', () => ({ uploadSubmissionFile: vi.fn() }))
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn(), useToast: vi.fn() }))

const baseAssignment: TicketAssignment = {
  id: 'assign-1',
  ticket_id: 'ticket-1',
  worker_id: 'worker-1',
  assigned_by: 'admin-1',
  assigned_at: '2026-01-01T12:00:00Z',
  status: 'in_progress',
}

describe('SubmissionUploadForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns null when assignment status is not in_progress', () => {
    const { container } = render(
      <SubmissionUploadForm
        ticketId="ticket-1"
        assignment={{ ...baseAssignment, status: 'completed' }}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders textarea, file upload zone, and submit button', () => {
    render(<SubmissionUploadForm ticketId="ticket-1" assignment={baseAssignment} />)
    expect(screen.getByLabelText(/delivery summary/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit work/i })).toBeInTheDocument()
    // 拖拽区域通过 role="button" 渲染
    expect(screen.getByText(/drag & drop/i)).toBeInTheDocument()
  })

  it('submit button is disabled when delivery summary is empty', () => {
    render(<SubmissionUploadForm ticketId="ticket-1" assignment={baseAssignment} />)
    expect(screen.getByRole('button', { name: /submit work/i })).toBeDisabled()
  })

  it('calls submitWorkAction with ticketId on submit', async () => {
    const user = userEvent.setup()
    vi.mocked(submitWorkAction).mockResolvedValue({ success: true })
    render(<SubmissionUploadForm ticketId="ticket-1" assignment={baseAssignment} />)

    await user.type(screen.getByLabelText(/delivery summary/i), 'Completed all tasks')
    await user.click(screen.getByRole('button', { name: /submit work/i }))

    await waitFor(() =>
      expect(submitWorkAction).toHaveBeenCalledWith(
        expect.objectContaining({ ticketId: 'ticket-1', deliverySummary: 'Completed all tasks' })
      )
    )
  })

  it('shows success card and toast on successful submission', async () => {
    const user = userEvent.setup()
    vi.mocked(submitWorkAction).mockResolvedValue({ success: true })
    render(<SubmissionUploadForm ticketId="ticket-1" assignment={baseAssignment} />)

    await user.type(screen.getByLabelText(/delivery summary/i), 'Done')
    await user.click(screen.getByRole('button', { name: /submit work/i }))

    await waitFor(() =>
      expect(screen.getByText(/work submitted successfully/i)).toBeInTheDocument()
    )
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Work submitted' }))
  })

  it('shows error text and destructive toast on failure', async () => {
    const user = userEvent.setup()
    vi.mocked(submitWorkAction).mockResolvedValue({
      success: false,
      error: 'Submission failed.',
    })
    render(<SubmissionUploadForm ticketId="ticket-1" assignment={baseAssignment} />)

    await user.type(screen.getByLabelText(/delivery summary/i), 'Done')
    await user.click(screen.getByRole('button', { name: /submit work/i }))

    await waitFor(() =>
      expect(screen.getByText('Submission failed.')).toBeInTheDocument()
    )
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }))
  })
})
