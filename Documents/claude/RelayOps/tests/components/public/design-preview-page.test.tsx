import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DesignPreviewPage from '@/app/[locale]/(public)/design-preview/page'

vi.mock('next/font/google', () => ({
  Space_Grotesk: () => ({ className: 'font-space-grotesk' }),
  Manrope: () => ({ className: 'font-manrope' }),
  IBM_Plex_Mono: () => ({ className: 'font-ibm-plex-mono' }),
}))

describe('DesignPreviewPage', () => {
  it('renders the design system hero and palette sections', () => {
    render(<DesignPreviewPage />)

    expect(screen.getByRole('heading', { name: /relayops design system preview/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /typography specimens/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /color system/i })).toBeInTheDocument()
    expect(screen.getByText(/relay blue/i)).toBeInTheDocument()
    expect(screen.getAllByText(/signal teal/i).length).toBeGreaterThan(0)
  })

  it('renders representative UI mockups for marketing, dashboard, and settings', () => {
    render(<DesignPreviewPage />)

    expect(screen.getByRole('heading', { name: /marketing signal/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /dashboard chrome/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /settings confidence/i })).toBeInTheDocument()
  })
})
