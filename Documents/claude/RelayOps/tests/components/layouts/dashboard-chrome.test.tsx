import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { DashboardChrome } from '@/components/layouts/dashboard-chrome'

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  pathname: '/admin',
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    [key: string]: unknown
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({
    push: navigation.push,
    refresh: navigation.refresh,
  }),
}))

vi.mock('@/lib/actions/auth.actions', () => ({
  signOutAction: vi.fn(async () => ({ success: true })),
}))

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

describe('DashboardChrome', () => {
  it('toggles the sidebar between expanded and collapsed states', async () => {
    mockMatchMedia(true)
    const user = userEvent.setup()

    render(
      <DashboardChrome role="admin" email="ops@relayops.com">
        <div>Dashboard body</div>
      </DashboardChrome>
    )

    const sidebar = screen.getByTestId('dashboard-sidebar')
    const toggle = screen.getByRole('button', { name: /collapse sidebar/i })

    expect(sidebar).toHaveAttribute('data-collapsed', 'false')
    expect(screen.getByText('Overview')).toBeInTheDocument()

    await user.click(toggle)

    expect(sidebar).toHaveAttribute('data-collapsed', 'true')
    expect(screen.queryByText('Overview')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /expand sidebar/i }))

    expect(sidebar).toHaveAttribute('data-collapsed', 'false')
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })
})
