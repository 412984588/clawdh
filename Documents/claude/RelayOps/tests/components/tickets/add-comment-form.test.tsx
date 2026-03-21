import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddCommentForm } from '@/components/tickets/add-comment-form'
import { addCommentAction } from '@/lib/actions/admin.actions'
import { addPartnerCommentAction } from '@/lib/actions/ticket.actions'
import { toast } from '@/hooks/use-toast'

vi.mock('@/lib/actions/admin.actions', () => ({ addCommentAction: vi.fn() }))
vi.mock('@/lib/actions/worker.actions', () => ({ addWorkerCommentAction: vi.fn() }))
vi.mock('@/lib/actions/ticket.actions', () => ({ addPartnerCommentAction: vi.fn() }))
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn(), useToast: vi.fn() }))

describe('AddCommentForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders textarea and submit button', () => {
    render(<AddCommentForm ticketId="t1" viewerRole="partner" />)
    expect(screen.getByPlaceholderText('Add a comment…')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /post comment/i })).toBeInTheDocument()
  })

  it('submit button is disabled when textarea is empty', () => {
    render(<AddCommentForm ticketId="t1" viewerRole="partner" />)
    expect(screen.getByRole('button', { name: /post comment/i })).toBeDisabled()
  })

  it('does not show visibility controls for partner comments', () => {
    render(<AddCommentForm ticketId="t1" viewerRole="partner" />)
    expect(screen.queryByText(/visible to/i)).not.toBeInTheDocument()
  })

  it('calls addPartnerCommentAction with correct args on partner submit', async () => {
    const user = userEvent.setup()
    vi.mocked(addPartnerCommentAction).mockResolvedValue({ success: true })
    vi.mocked(addCommentAction).mockResolvedValue({ success: true })
    render(<AddCommentForm ticketId="t1" viewerRole="partner" />)

    await user.type(screen.getByPlaceholderText('Add a comment…'), 'hello world')
    await user.click(screen.getByRole('button', { name: /post comment/i }))

    await waitFor(() =>
      expect(addPartnerCommentAction).toHaveBeenCalledWith({
        ticketId: 't1',
        body: 'hello world',
      })
    )
  })

  it('shows error message and destructive toast on failure', async () => {
    const user = userEvent.setup()
    vi.mocked(addPartnerCommentAction).mockResolvedValue({ success: false, error: 'Unauthorized' })
    vi.mocked(addCommentAction).mockResolvedValue({ success: false, error: 'Unauthorized' })
    render(<AddCommentForm ticketId="t1" viewerRole="partner" />)

    await user.type(screen.getByPlaceholderText('Add a comment…'), 'hi')
    await user.click(screen.getByRole('button', { name: /post comment/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unauthorized'))
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }))
  })

  it('clears textarea and shows success toast on success', async () => {
    const user = userEvent.setup()
    vi.mocked(addPartnerCommentAction).mockResolvedValue({ success: true })
    vi.mocked(addCommentAction).mockResolvedValue({ success: true })
    render(<AddCommentForm ticketId="t1" viewerRole="partner" />)

    const textarea = screen.getByPlaceholderText('Add a comment…')
    await user.type(textarea, 'hello')
    await user.click(screen.getByRole('button', { name: /post comment/i }))

    await waitFor(() => expect(textarea).toHaveValue(''))
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Comment posted' }))
  })

  it('shows visibility controls for admin comments', () => {
    render(<AddCommentForm ticketId="t1" viewerRole="admin" />)
    expect(screen.getByText(/visible to/i)).toBeInTheDocument()
  })

  it('calls addCommentAction for admin submit', async () => {
    const user = userEvent.setup()
    vi.mocked(addCommentAction).mockResolvedValue({ success: true })
    render(<AddCommentForm ticketId="t1" viewerRole="admin" />)

    await user.type(screen.getByPlaceholderText('Add a comment…'), 'admin note')
    await user.click(screen.getByRole('button', { name: /post comment/i }))

    await waitFor(() =>
      expect(addCommentAction).toHaveBeenCalledWith(
        expect.objectContaining({ ticketId: 't1', body: 'admin note' })
      )
    )
  })
})
