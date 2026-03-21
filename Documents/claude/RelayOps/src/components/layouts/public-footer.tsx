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
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0B1220] text-white shadow-[0_-24px_80px_-48px_rgba(11,18,32,0.78)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(20,184,166,0.12),transparent_24%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-15" />

      <div className="container relative py-20 md:py-24">
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-[1.15rem] bg-blue-600 shadow-[0_20px_50px_-24px_rgba(59,130,246,0.5)]">
                <svg width="20" height="20" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 4h4v4H2V4zm6 2h4v4H8V6z" fill="white" />
                </svg>
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-teal-300" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-display text-2xl font-bold tracking-[-0.05em]">RelayOps</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400">
                  Operational confidence
                </span>
              </span>
            </Link>

            <div className="max-w-sm space-y-3">
              <p className="text-base leading-7 text-zinc-300">
                White-label CRM data cleanup for US RevOps agencies.
              </p>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
                SOC 2 ready · White-label · 2-day SLA
              </p>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4 shadow-[0_20px_60px_-36px_rgba(59,130,246,0.22)] backdrop-blur-sm">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">
                  Delivery posture
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
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
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
