import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/layouts/public-navbar', () => ({
  PublicNavbar: () => <div data-testid="public-navbar" />,
}))

vi.mock('@/components/layouts/public-footer', () => ({
  PublicFooter: () => <div data-testid="public-footer" />,
}))

import PublicLayout from '@/app/[locale]/(public)/layout'

describe('PublicLayout', () => {
  it('renders a main landmark with the skip link target id', () => {
    render(
      <PublicLayout>
        <div>Public content</div>
      </PublicLayout>
    )

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(screen.getByText('Public content')).toBeInTheDocument()
  })
})
