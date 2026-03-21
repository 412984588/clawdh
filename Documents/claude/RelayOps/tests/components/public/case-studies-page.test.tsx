import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CaseStudiesPage from '../../../src/app/[locale]/(public)/case-studies/page'

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

describe('CaseStudiesPage', () => {
  it('renders three placeholder case studies with scenario-specific outcomes', () => {
    render(<CaseStudiesPage />)

    expect(screen.getByText(/case studies/i)).toBeInTheDocument()
    expect(screen.getByText(/Northstar Commerce/i)).toBeInTheDocument()
    expect(screen.getByText(/efficiency gain: 60%/i)).toBeInTheDocument()
    expect(screen.getByText(/Vertex Cloud Ops/i)).toBeInTheDocument()
    expect(screen.getByText(/zero downtime migration/i)).toBeInTheDocument()
    expect(screen.getByText(/Summit Ridge Capital/i)).toBeInTheDocument()
    expect(screen.getByText(/audit pass rate: 100%/i)).toBeInTheDocument()
  })

  it('shows metrics blocks and a request access cta', () => {
    render(<CaseStudiesPage />)

    expect(screen.getAllByText(/data volume/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/delivery time/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/satisfaction/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /request access/i })).toHaveAttribute(
      'href',
      '/request-access',
    )
  })
})
