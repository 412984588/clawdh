import Link from 'next/link'

const footerLinks = {
  Product: [
    { label: 'Case Studies', href: '/case-studies' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'For Partners', href: '/for-partners' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Start a Pilot', href: '/pilot-sample' },
  ],
  Company: [
    { label: 'Security', href: '/security' },
    { label: 'Request Access', href: '/request-access' },
  ],
  Legal: [
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Refund Policy', href: '/refund-policy' },
  ],
}

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-zinc-950 text-white shadow-[0_-24px_80px_-48px_rgba(15,23,42,0.8)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_80%_35%,rgba(59,130,246,0.12),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />

      <div className="container relative py-20 md:py-24">
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_20px_50px_-24px_rgba(59,130,246,0.7)]">
                <svg width="20" height="20" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 4h4v4H2V4zm6 2h4v4H8V6z" fill="white" />
                </svg>
              </span>
              <span className="text-2xl font-black tracking-[-0.05em]">RelayOps</span>
            </Link>

            <div className="max-w-sm space-y-3">
              <p className="text-base leading-7 text-zinc-300">
                White-label CRM data cleanup for US RevOps agencies.
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">
                SOC 2 Ready · White-Label · 2-Day SLA
              </p>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 shadow-[0_20px_60px_-36px_rgba(59,130,246,0.4)] backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
                  Social Proof
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  Built for agencies that need fixed-scope delivery, white-label output, and a
                  turnaround they can confidently promise to clients.
                </p>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                {group}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex rounded-sm text-sm text-zinc-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} RelayOps. All rights reserved.</p>
          <p>Built for agencies. Delivered on time.</p>
        </div>
      </div>
    </footer>
  )
}
