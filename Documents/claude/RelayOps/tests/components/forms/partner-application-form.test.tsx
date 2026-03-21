import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const submitPartnerApplication = vi.fn()

vi.mock('@/lib/actions/partner.actions', () => ({
  submitPartnerApplication: (...args: unknown[]) => submitPartnerApplication(...args),
}))

import { PartnerApplicationForm } from '@/components/forms/partner-application-form'

describe('PartnerApplicationForm', () => {
  beforeEach(() => {
    submitPartnerApplication.mockReset()
  })

  it('marks required fields as aria-required', () => {
    render(<PartnerApplicationForm />)

    expect(screen.getByLabelText(/first name/i)).toHaveAttribute('aria-required', 'true')
    expect(screen.getByLabelText(/last name/i)).toHaveAttribute('aria-required', 'true')
    expect(screen.getByLabelText(/work email/i)).toHaveAttribute('aria-required', 'true')
    expect(screen.getByLabelText(/company name/i)).toHaveAttribute('aria-required', 'true')
    expect(screen.getByLabelText(/country/i)).toHaveAttribute('aria-required', 'true')
    expect(
      screen.getByLabelText(/what kind of crm work do you handle/i)
    ).toHaveAttribute('aria-required', 'true')
    expect(screen.getByLabelText(/estimated datasets per month/i)).toHaveAttribute(
      'aria-required',
      'true'
    )
  })

  it('associates agreement validation errors with the checkbox via aria-describedby', async () => {
    const user = userEvent.setup()

    render(<PartnerApplicationForm />)

    await user.type(screen.getByLabelText(/first name/i), 'Jane')
    await user.type(screen.getByLabelText(/last name/i), 'Smith')
    await user.type(screen.getByLabelText(/work email/i), 'jane@agency.com')
    await user.type(screen.getByLabelText(/company name/i), 'Acme RevOps')
    await user.selectOptions(screen.getByLabelText(/country/i), 'United States')
    await user.type(
      screen.getByLabelText(/what kind of crm work do you handle/i),
      'We handle HubSpot cleanup and import prep for SaaS clients.'
    )

    const monthlyEstimate = screen.getByLabelText(/estimated datasets per month/i)
    await user.clear(monthlyEstimate)
    await user.type(monthlyEstimate, '12')
    await user.click(screen.getByRole('button', { name: /submit application/i }))

    const checkbox = screen.getByRole('checkbox', {
      name: /i understand that relayops workers operate under nda/i,
    })
    const error = await screen.findByText(/you must agree to the data handling terms/i)

    expect(error).toHaveAttribute('id', 'data_handling_agreement-error')
    expect(checkbox).toHaveAttribute('aria-required', 'true')
    expect(checkbox).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('data_handling_agreement-error')
    )
  })

  it('announces server errors with a live alert region', async () => {
    const user = userEvent.setup()
    submitPartnerApplication.mockResolvedValue({
      success: false,
      error: 'Submission failed. Please try again.',
    })

    render(<PartnerApplicationForm />)

    await user.type(screen.getByLabelText(/first name/i), 'Jane')
    await user.type(screen.getByLabelText(/last name/i), 'Smith')
    await user.type(screen.getByLabelText(/work email/i), 'jane@agency.com')
    await user.type(screen.getByLabelText(/company name/i), 'Acme RevOps')
    await user.selectOptions(screen.getByLabelText(/country/i), 'United States')
    await user.type(
      screen.getByLabelText(/what kind of crm work do you handle/i),
      'We handle HubSpot cleanup and import prep for SaaS clients.'
    )
    await user.clear(screen.getByLabelText(/estimated datasets per month/i))
    await user.type(screen.getByLabelText(/estimated datasets per month/i), '12')
    await user.click(
      screen.getByRole('checkbox', {
        name: /i understand that relayops workers operate under nda/i,
      })
    )
    await user.click(screen.getByRole('button', { name: /submit application/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/submission failed\. please try again\./i)
    expect(alert).toHaveAttribute('aria-live', 'assertive')
  })
})
