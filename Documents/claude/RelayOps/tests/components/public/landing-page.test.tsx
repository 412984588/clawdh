import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LandingPage from '@/app/[locale]/(public)/page'

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

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('LandingPage', () => {
  it('renders hero trust signals with a Request Access CTA', () => {
    render(<LandingPage />)

    expect(screen.getByText(/635 tests/i)).toBeInTheDocument()
    expect(screen.getByText(/SOC2-ready/i)).toBeInTheDocument()
    expect(screen.getByText(/operational confidence for revops agencies/i)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /request access/i }).length).toBeGreaterThan(0)
  })

  it('renders the hero delivery board proof module', () => {
    render(<LandingPage />)

    expect(screen.getByText(/live delivery board/i)).toBeInTheDocument()
    expect(screen.getByText(/scope response/i)).toBeInTheDocument()
    expect(screen.getByText(/handoff quality/i)).toBeInTheDocument()
  })

  it('renders the partner-to-delivery workflow', () => {
    render(<LandingPage />)

    expect(screen.getByText('Partner Intake')).toBeInTheDocument()
    expect(screen.getByText('Admin Scope Lock')).toBeInTheDocument()
    expect(screen.getByText('Worker QA')).toBeInTheDocument()
    expect(screen.getByText('Delivery Ready')).toBeInTheDocument()
  })

  it('renders social proof metrics and a testimonial placeholder', () => {
    render(<LandingPage />)

    expect(screen.getByText('Tickets Processed')).toBeInTheDocument()
    expect(screen.getByText('Average Delivery Time')).toBeInTheDocument()
    expect(screen.getByText('Partner Satisfaction')).toBeInTheDocument()
    expect(screen.getByText(/what partners say/i)).toBeInTheDocument()
  })
})
