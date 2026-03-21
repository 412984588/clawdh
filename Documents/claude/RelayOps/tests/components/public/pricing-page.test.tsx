import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PricingPage from '../../../src/app/[locale]/(public)/pricing/page'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('PricingPage', () => {
  it('renders three pricing tiers with placeholder pricing and ctas', () => {
    render(<PricingPage />)

    expect(screen.getByRole('heading', { name: /^starter$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^professional$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /^enterprise$/i })).toBeInTheDocument()
    expect(screen.getByText(/\$499\/mo/)).toBeInTheDocument()
    expect(screen.getByText(/Contact Sales/)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /request access/i }).length).toBeGreaterThan(0)
  })

  it('shows faq content, comparison table, and bottom cta', () => {
    render(<PricingPage />)

    expect(screen.getByRole('heading', { name: /frequently asked questions/i })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /how relayops stacks up against the alternatives/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getAllByText(/self-built team/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/traditional outsourcing/i).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /request access/i })[0]).toHaveAttribute(
      'href',
      '/request-access'
    )
  })
})
