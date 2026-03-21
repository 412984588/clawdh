import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PublicNavbar } from '@/components/layouts/public-navbar'

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

describe('PublicNavbar', () => {
  it('includes a demo navigation link', () => {
    render(<PublicNavbar />)

    expect(screen.getByRole('link', { name: /demo/i })).toHaveAttribute('href', '/demo')
  })

  it('includes a case studies navigation link', () => {
    render(<PublicNavbar />)

    expect(screen.getByRole('link', { name: /case studies/i })).toHaveAttribute(
      'href',
      '/case-studies',
    )
  })
})
