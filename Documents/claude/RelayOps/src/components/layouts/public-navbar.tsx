'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export function PublicNavbar() {
  const t = useTranslations('common.nav')
  const [scrolled, setScrolled] = useState(false)

  const navLinks = [
    { href: '/pricing' as const, label: 'Pricing' },
    { href: '/demo' as const, label: t('demo') },
    { href: '/case-studies' as const, label: t('caseStudies') },
    { href: '/how-it-works' as const, label: t('howItWorks') },
    { href: '/for-partners' as const, label: t('forPartners') },
    { href: '/security' as const, label: t('security') },
  ]

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
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-zinc-950 focus:px-4 focus:py-2 focus:text-white"
      >
        {t('skipToContent')}
      </a>
      <header
        className={`animate-slide-down sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'border-slate-200/80 bg-[rgba(248,250,252,0.88)] shadow-[0_20px_50px_-34px_rgba(15,23,42,0.22)] backdrop-blur-md'
            : 'border-slate-200/60 bg-[rgba(248,250,252,0.76)] backdrop-blur-md'
        }`}
      >
        <nav aria-label="Primary" className="container flex h-20 items-center justify-between gap-6">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_24px_48px_-28px_rgba(59,130,246,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[1.1rem] bg-[#0B1220] shadow-[0_18px_34px_-22px_rgba(11,18,32,0.6)]">
              <svg width="20" height="20" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 4h4v4H2V4zm6 2h4v4H8V6z" fill="white" />
              </svg>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-teal-400" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold tracking-[-0.05em] text-slate-950 transition-colors group-hover:text-blue-600">
                RelayOps
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Agency Delivery OS
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative inline-flex min-h-[44px] items-center rounded-md text-sm font-semibold tracking-[-0.01em] text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
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
              className="min-h-[44px] rounded-full px-4 text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition-colors duration-300"
            >
              <Link href="/login">{t('login')}</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="min-h-[44px] rounded-full border border-blue-600/30 bg-blue-600 px-5 text-white shadow-[0_18px_34px_-18px_rgba(59,130,246,0.52)] transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_12px_24px_rgb(59,130,246,0.3)]"
            >
              <Link href="/request-access">
                {t('requestAccess')}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </nav>
      </header>
    </>
  )
}
