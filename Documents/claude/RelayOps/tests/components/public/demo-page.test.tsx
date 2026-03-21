import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DemoPage from '../../../src/app/[locale]/(public)/demo/page'

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

describe('DemoPage', () => {
  it('renders the four-step product demo flow', () => {
    render(<DemoPage />)

    expect(screen.getByText(/interactive product demo/i)).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /partner submits ticket/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /admin scopes and prices/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /worker executes the job/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /partner reviews delivery/i })).toBeInTheDocument()
  })

  it('shows role labels, mock dashboard content, and request access cta', () => {
    render(<DemoPage />)

    expect(screen.getAllByText(/^partner$/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/^admin$/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/^worker$/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/mock dashboard preview/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /request access/i })).toHaveAttribute(
      'href',
      '/request-access',
    )
  })
})
