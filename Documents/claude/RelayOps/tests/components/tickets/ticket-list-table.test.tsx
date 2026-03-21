import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MotionProvider } from '@/components/ui/motion'
import { TicketListTable } from '@/components/tickets/ticket-list-table'
import type { Ticket } from '@/lib/types/database'

// next/link は jsdom では <a> として扱う
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 'ticket-1',
  organization_id: 'org-1',
  category: 'data_cleanup_import_prep',
  title: 'Cleanup HubSpot contacts',
  problem_summary: 'problem',
  expected_output: 'output',
  acceptance_criteria_json: [],
  out_of_scope_json: [],
  sensitivity_level: 'standard',
  status: 'queued',
  sla_hours_business: 48,
  overdue_flag: false,
  created_by: 'user-1',
  created_at: '2026-01-01T12:00:00Z',
  updated_at: '2026-01-01T12:00:00Z',
  ...overrides,
})

describe('TicketListTable', () => {
  it('shows empty message when tickets array is empty', () => {
    render(
      <MotionProvider>
        <TicketListTable
          tickets={[]}
          basePath="/admin/tickets"
          emptyMessage="No tickets yet."
        />
      </MotionProvider>
    )
    expect(screen.getByText('No tickets yet.')).toBeInTheDocument()
  })

  it('renders default empty message when none provided', () => {
    render(
      <MotionProvider>
        <TicketListTable tickets={[]} basePath="/admin/tickets" />
      </MotionProvider>
    )
    expect(screen.getByText('No tickets found.')).toBeInTheDocument()
  })

  it('renders the correct number of rows', () => {
    const tickets = [
      makeTicket({ id: 't1', title: 'Ticket One' }),
      makeTicket({ id: 't2', title: 'Ticket Two' }),
      makeTicket({ id: 't3', title: 'Ticket Three' }),
    ]
    render(
      <MotionProvider>
        <TicketListTable tickets={tickets} basePath="/admin/tickets" />
      </MotionProvider>
    )

    expect(screen.getByText('Ticket One')).toBeInTheDocument()
    expect(screen.getByText('Ticket Two')).toBeInTheDocument()
    expect(screen.getByText('Ticket Three')).toBeInTheDocument()
  })

  it('renders title links with correct href', () => {
    const ticket = makeTicket({ id: 'abc-123', title: 'My Ticket' })
    render(
      <MotionProvider>
        <TicketListTable tickets={[ticket]} basePath="/admin/tickets" />
      </MotionProvider>
    )

    const links = screen.getAllByRole('link', { name: /my ticket/i })
    expect(links[0]).toHaveAttribute('href', '/admin/tickets/abc-123')
  })

  it('renders with partner basePath', () => {
    const ticket = makeTicket({ id: 'xyz-456', title: 'Partner Ticket' })
    render(
      <MotionProvider>
        <TicketListTable tickets={[ticket]} basePath="/partner/tickets" />
      </MotionProvider>
    )

    const links = screen.getAllByRole('link', { name: /partner ticket/i })
    expect(links[0]).toHaveAttribute('href', '/partner/tickets/xyz-456')
  })

  it('renders status badge for each ticket', () => {
    const ticket = makeTicket({ status: 'queued' })
    render(
      <MotionProvider>
        <TicketListTable tickets={[ticket]} basePath="/admin/tickets" />
      </MotionProvider>
    )

    // TicketStatusBadge renders the status text
    expect(screen.getByText(/queued/i)).toBeInTheDocument()
  })

  it('wraps table rows in stagger motion items', () => {
    const tickets = [
      makeTicket({ id: 't1', title: 'Ticket One' }),
      makeTicket({ id: 't2', title: 'Ticket Two' }),
    ]

    const { container } = render(
      <MotionProvider>
        <TicketListTable tickets={tickets} basePath="/admin/tickets" />
      </MotionProvider>
    )

    const motionRows = container.querySelectorAll('tr[data-motion="stagger-item"]')
    expect(motionRows).toHaveLength(2)
  })
})
