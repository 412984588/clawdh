'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '/demo', label: 'Demo' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/for-partners', label: 'For Partners' },
  { href: '/security', label: 'Security' },
]

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
      >
        跳至主要内容
      </a>
      <header
        className={`animate-slide-down sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'border-zinc-200/70 bg-white/80 shadow-[0_18px_48px_-28px_rgba(24,24,27,0.45)] backdrop-blur-sm'
            : 'border-zinc-200/40 bg-white/72 backdrop-blur-sm'
        }`}
      >
        <nav className="container flex h-20 items-center justify-between gap-6">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-full border border-zinc-200/70 bg-white/80 px-3 py-2 shadow-[0_16px_40px_-28px_rgba(59,130,246,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_24px_44px_-24px_rgba(59,130,246,0.3)]"
          >
            <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 shadow-[0_14px_30px_-18px_rgba(59,130,246,0.6)]">
              <svg width="20" height="20" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 4h4v4H2V4zm6 2h4v4H8V6z" fill="white" />
              </svg>
            </span>
            <span className="text-lg font-black tracking-[-0.04em] text-zinc-950 transition-colors group-hover:text-blue-600">
              RelayOps
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative inline-flex min-h-[44px] items-center text-sm font-semibold tracking-[-0.01em] text-zinc-600 transition-colors hover:text-zinc-950"
              >
                {link.label}
                <span className="absolute inset-x-0 bottom-1.5 h-px origin-left scale-x-0 bg-blue-500 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="min-h-[44px] rounded-full px-4 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="min-h-[44px] rounded-full border border-blue-500/40 bg-blue-500 px-5 text-white shadow-sm shadow-[0_18px_38px_-20px_rgba(59,130,246,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-400 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.18),0_22px_44px_-18px_rgba(59,130,246,0.72)]"
            >
              <Link href="/request-access">
                Request Access
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>
    </>
  )
}
