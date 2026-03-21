import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AcceptanceCriteriaChecklist } from '@/components/tickets/acceptance-criteria-checklist'
import type { AcceptanceCriterion } from '@/lib/types/database'

const criteria: AcceptanceCriterion[] = [
  { id: 'c1', description: 'Data is cleaned', required: true },
  { id: 'c2', description: 'Report is generated', required: false },
  { id: 'c3', description: 'Files are uploaded', required: true },
]

describe('AcceptanceCriteriaChecklist', () => {
  it('renders all criteria descriptions', () => {
    render(<AcceptanceCriteriaChecklist criteria={criteria} />)
    expect(screen.getByText('Data is cleaned')).toBeInTheDocument()
    expect(screen.getByText('Report is generated')).toBeInTheDocument()
    expect(screen.getByText('Files are uploaded')).toBeInTheDocument()
  })

  it('shows "No acceptance criteria" message when list is empty', () => {
    render(<AcceptanceCriteriaChecklist criteria={[]} />)
    expect(screen.getByText(/no acceptance criteria/i)).toBeInTheDocument()
  })

  it('marks required criteria with *required label', () => {
    render(<AcceptanceCriteriaChecklist criteria={criteria} />)
    const requiredLabels = screen.getAllByText('*required')
    // criteria 中有 2 个 required:true
    expect(requiredLabels).toHaveLength(2)
  })

  it('calls onToggle with criterion id when checkbox is clicked in interactive mode', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <AcceptanceCriteriaChecklist
        criteria={criteria}
        readOnly={false}
        checkedIds={[]}
        onToggle={onToggle}
      />
    )

    // 点击第一个 checkbox
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    expect(onToggle).toHaveBeenCalledWith('c1')
  })

  it('renders checkboxes as disabled in readOnly mode', () => {
    render(<AcceptanceCriteriaChecklist criteria={criteria} readOnly={true} />)
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((cb) => expect(cb).toBeDisabled())
  })
})
