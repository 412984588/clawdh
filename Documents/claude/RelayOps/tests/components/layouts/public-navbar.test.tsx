import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// mock next-intl — 返回 key 本身作为翻译值
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => {
    // 模拟翻译：返回 key 最后一段作为可读值
    const parts = key.split('.')
    const last = parts[parts.length - 1]
    const map: Record<string, string> = {
      demo: 'Demo',
      caseStudies: 'Case Studies',
      howItWorks: 'How It Works',
      forPartners: 'For Partners',
      security: 'Security',
      requestAccess: 'Request Access',
      login: 'Log In',
      skipToContent: 'Skip to main content',
      switchLanguage: 'Switch language',
      zh: '中文',
      en: 'EN',
    }
    return map[last] ?? last
  },
}))

// mock i18n navigation — 使用普通 <a> 标签
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: ReactNode; [k: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
  usePathname: () => '/',
  useRouter: () => ({ replace: vi.fn() }),
}))

import { PublicNavbar } from '@/components/layouts/public-navbar'

describe('PublicNavbar', () => {
  it('renders a skip link that targets the main content landmark', () => {
    render(<PublicNavbar />)
    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveAttribute(
      'href',
      '#main-content'
    )
  })

  it('labels the primary navigation landmark', () => {
    render(<PublicNavbar />)
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument()
  })

  it('includes a pricing navigation link', () => {
    render(<PublicNavbar />)
    expect(screen.getByRole('link', { name: /pricing/i })).toHaveAttribute('href', '/pricing')
  })

  it('includes a demo navigation link', () => {
    render(<PublicNavbar />)
    expect(screen.getByRole('link', { name: /demo/i })).toHaveAttribute('href', '/demo')
  })

  it('includes a case studies navigation link', () => {
    render(<PublicNavbar />)
    expect(screen.getByRole('link', { name: /case studies/i })).toHaveAttribute('href', '/case-studies')
  })

  it('does not render a language switcher', () => {
    render(<PublicNavbar />)
    expect(screen.queryByRole('button', { name: /switch language/i })).not.toBeInTheDocument()
  })
})
