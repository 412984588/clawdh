import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DisputeResolutionPanel } from '@/components/admin/dispute-resolution-panel'
import { resolveDisputeAction } from '@/lib/actions/admin.actions'
import { toast } from '@/hooks/use-toast'
import type { Dispute } from '@/lib/types/database'

vi.mock('@/lib/actions/admin.actions', () => ({
  resolveDisputeAction: vi.fn(),
  submitReviewAction: vi.fn(),
  addCommentAction: vi.fn(),
}))
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn(), useToast: vi.fn() }))

// Radix Select 在 jsdom 中不支持 pointer events — 用原生 select 替换
vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange, disabled }: { children: React.ReactNode; value: string; onValueChange: (v: string) => void; disabled?: boolean }) => (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
      aria-label="Resolution"
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder: string }) => <option value="">{placeholder}</option>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

const baseDispute: Dispute = {
  id: 'dispute-1',
  ticket_id: 'ticket-1',
  raised_by_user_id: 'user-1',
  raised_by_role: 'partner',
  reason: 'Work was not completed as specified.',
  status: 'open',
  resolution_summary: null,
  resolved_by_user_id: null,
  resolved_at: null,
  refund_ledger_entry_id: null,
  created_at: '2026-01-01T12:00:00Z',
  updated_at: '2026-01-01T12:00:00Z',
}

describe('DisputeResolutionPanel', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders resolution select, summary textarea, and resolve button', () => {
    render(<DisputeResolutionPanel dispute={baseDispute} ticketId="ticket-1" />)
    expect(screen.getByRole('combobox', { name: /resolution/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/resolution summary/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /resolve dispute/i })).toBeInTheDocument()
  })

  it('displays dispute reason', () => {
    render(<DisputeResolutionPanel dispute={baseDispute} ticketId="ticket-1" />)
    expect(screen.getByText('Work was not completed as specified.')).toBeInTheDocument()
  })

  it('calls resolveDisputeAction with correct args', async () => {
    const user = userEvent.setup()
    vi.mocked(resolveDisputeAction).mockResolvedValue({ success: true })
    render(<DisputeResolutionPanel dispute={baseDispute} ticketId="ticket-1" />)

    await user.selectOptions(screen.getByRole('combobox'), 'resolved_no_refund')
    await user.type(screen.getByLabelText(/resolution summary/i), 'Work meets requirements.')
    await user.click(screen.getByRole('button', { name: /resolve dispute/i }))

    await waitFor(() =>
      expect(resolveDisputeAction).toHaveBeenCalledWith(
        expect.objectContaining({
          disputeId: 'dispute-1',
          ticketId: 'ticket-1',
          resolutionSummary: 'Work meets requirements.',
          disputeStatus: 'resolved_no_refund',
        })
      )
    )
  })

  it('shows success card and toast on successful resolution', async () => {
    const user = userEvent.setup()
    vi.mocked(resolveDisputeAction).mockResolvedValue({ success: true })
    render(<DisputeResolutionPanel dispute={baseDispute} ticketId="ticket-1" />)

    await user.selectOptions(screen.getByRole('combobox'), 'resolved_no_refund')
    await user.type(screen.getByLabelText(/resolution summary/i), 'Resolved.')
    await user.click(screen.getByRole('button', { name: /resolve dispute/i }))

    await waitFor(() =>
      expect(screen.getByText(/dispute resolved successfully/i)).toBeInTheDocument()
    )
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Dispute resolved' }))
  })

  it('shows error text and destructive toast on failure', async () => {
    const user = userEvent.setup()
    vi.mocked(resolveDisputeAction).mockResolvedValue({
      success: false,
      error: 'Resolution failed.',
    })
    render(<DisputeResolutionPanel dispute={baseDispute} ticketId="ticket-1" />)

    await user.selectOptions(screen.getByRole('combobox'), 'resolved_no_refund')
    await user.type(screen.getByLabelText(/resolution summary/i), 'Done.')
    await user.click(screen.getByRole('button', { name: /resolve dispute/i }))

    await waitFor(() =>
      expect(screen.getByText('Resolution failed.')).toBeInTheDocument()
    )
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' }))
  })
})
