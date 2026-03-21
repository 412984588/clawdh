import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AuthLayout from '@/app/(auth)/layout'

describe('AuthLayout', () => {
  it('renders a skip link and main landmark for keyboard users', () => {
    render(
      <AuthLayout>
        <div>Auth content</div>
      </AuthLayout>
    )

    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveAttribute(
      'href',
      '#main-content'
    )
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(screen.getByText('Auth content')).toBeInTheDocument()
  })
})
