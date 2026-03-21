'use client'

import { useState } from 'react'
import { IBM_Plex_Mono, Manrope, Space_Grotesk } from 'next/font/google'

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
})

const bodyFont = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const monoFont = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
})

const palette = [
  {
    name: 'Relay Blue',
    hex: '#3B82F6',
    use: 'Primary action, active navigation, trust cues, focus moments',
  },
  {
    name: 'Signal Teal',
    hex: '#14B8A6',
    use: 'Automation proof, process completion, QA confidence',
  },
  {
    name: 'Control Ink',
    hex: '#0B1220',
    use: 'Dark rails, footer, dense proof blocks, enterprise authority',
  },
  {
    name: 'Steel Text',
    hex: '#526071',
    use: 'Secondary copy, table metadata, quiet labels',
  },
  {
    name: 'Mist Surface',
    hex: '#E8EEF7',
    use: 'Soft surfaces, section breaks, restrained emphasis',
  },
  {
    name: 'Paper White',
    hex: '#F8FAFC',
    use: 'Primary canvas, breathing room, contrast against dark rails',
  },
]

const typographyRoles = [
  {
    name: 'Display / Hero',
    font: 'Space Grotesk',
    specimen: 'Operational confidence for agencies that cannot miss a deadline.',
    className: `${displayFont.className} text-4xl font-bold tracking-[-0.06em] md:text-5xl`,
    detail: 'Compact, technical, and memorable without feeling like a dev-tool clone.',
  },
  {
    name: 'Body / UI',
    font: 'Manrope',
    specimen:
      'RelayOps turns messy CRM cleanup into a fixed-scope, white-label delivery motion your team can actually sell.',
    className: `${bodyFont.className} text-base font-medium leading-7 text-slate-700`,
    detail: 'Crisp enough for dashboards, warmer than default startup sans choices.',
  },
  {
    name: 'Data / Code',
    font: 'IBM Plex Mono',
    specimen: '635 TESTS  ·  SLA 48H  ·  QA PASS 99.2%  ·  JOB-2048',
    className: `${monoFont.className} text-sm font-medium uppercase tracking-[0.22em] text-slate-600`,
    detail: 'Makes metrics, timelines, and ticket IDs feel operational instead of decorative.',
  },
]

const referenceSites = [
  {
    name: 'Stripe',
    url: 'https://stripe.com/',
    insight: 'Uses atmospheric color and strong section framing to make trust feel commercial, not corporate.',
  },
  {
    name: 'Linear',
    url: 'https://linear.app/',
    insight: 'Wins with ruthless hierarchy, tight spacing, and a product-first notion of speed.',
  },
  {
    name: 'Vercel',
    url: 'https://vercel.com/home',
    insight: 'Builds authority through contrast, proof modules, and technical restraint.',
  },
]

const dashboardRows = [
  ['Northstar CRM dedupe', 'Queued', '48h', 'QA ready'],
  ['HubSpot migration cleanup', 'In review', '32h', 'Partner sign-off'],
  ['SFDC reparenting batch', 'Complete', '19h', 'Delivered'],
]

const settingsRows = [
  { label: 'White-label delivery emails', value: 'Enabled' },
  { label: 'Default turnaround promise', value: '2 business days' },
  { label: 'Escalation threshold', value: '6 hours before SLA' },
]

export default function DesignPreviewPage() {
  const [darkMode, setDarkMode] = useState(false)

  const surfaceClass = darkMode
    ? 'bg-[#08101d] text-slate-100'
    : 'bg-[#f8fafc] text-slate-950'
  const cardClass = darkMode
    ? 'border-white/10 bg-white/5 text-slate-100'
    : 'border-slate-200 bg-white text-slate-950'
  const mutedClass = darkMode ? 'text-slate-300' : 'text-slate-600'
  const subMutedClass = darkMode ? 'text-slate-400' : 'text-slate-500'

  return (
    <div className={`${bodyFont.className} min-h-screen ${surfaceClass}`}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(20,184,166,0.16),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:120px_120px] opacity-30" />

        <div className="container relative py-10 md:py-14">
          <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-8 md:flex-row md:items-center md:justify-between dark:border-white/10">
            <div className="space-y-3">
              <p className={`${monoFont.className} text-xs uppercase tracking-[0.28em] text-blue-500`}>
                RelayOps Design Consultation
              </p>
              <h1
                className={`${displayFont.className} max-w-4xl text-5xl font-bold tracking-[-0.08em] md:text-7xl md:leading-[0.94]`}
              >
                RelayOps Design System Preview
              </h1>
              <p className={`max-w-3xl text-lg leading-8 ${mutedClass}`}>
                A control-room identity for white-label data operations: precise, calm under
                pressure, and credible enough for agencies selling time-bound delivery.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDarkMode((current) => !current)}
              className={`inline-flex h-12 items-center justify-center rounded-full border px-5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                darkMode
                  ? 'border-white/15 bg-white/10 text-white'
                  : 'border-slate-200 bg-white text-slate-950 shadow-[0_20px_40px_-26px_rgba(15,23,42,0.25)]'
              }`}
            >
              {darkMode ? 'Switch to light preview' : 'Switch to dark preview'}
            </button>
          </div>

          <div className="grid gap-6 py-8 md:grid-cols-[1.4fr_0.9fr]">
            <section className={`rounded-[2rem] border p-7 shadow-[0_30px_80px_-56px_rgba(15,23,42,0.45)] ${cardClass}`}>
              <p className={`${monoFont.className} text-xs uppercase tracking-[0.26em] text-blue-500`}>
                Brand Personality
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-blue-500/20 bg-blue-500/8 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">
                    Precise
                  </p>
                  <p className={`mt-3 text-sm leading-6 ${mutedClass}`}>
                    Strong grid logic, monospace metadata, and no ornamental gradients leading the
                    brand.
                  </p>
                </div>
                <div className="rounded-3xl border border-teal-500/20 bg-teal-500/8 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-500">
                    Reliable
                  </p>
                  <p className={`mt-3 text-sm leading-6 ${mutedClass}`}>
                    Visual language should feel audit-ready and delivery-safe, not vague or
                    inspirational.
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-400/20 bg-slate-500/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Commercial
                  </p>
                  <p className={`mt-3 text-sm leading-6 ${mutedClass}`}>
                    Copy blocks, proofs, and CTAs speak like an ops partner that owns outcomes.
                  </p>
                </div>
              </div>
            </section>

            <section className={`rounded-[2rem] border p-7 ${cardClass}`}>
              <p className={`${monoFont.className} text-xs uppercase tracking-[0.26em] text-blue-500`}>
                Reference Signals
              </p>
              <div className="mt-5 space-y-4">
                {referenceSites.map((site) => (
                  <div key={site.name} className="rounded-3xl border border-slate-200/80 p-4 dark:border-white/10">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-base font-semibold">{site.name}</p>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-blue-500"
                      >
                        Visit
                      </a>
                    </div>
                    <p className={`mt-2 text-sm leading-6 ${mutedClass}`}>{site.insight}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="container space-y-8 pb-16">
        <section className={`rounded-[2rem] border p-7 ${cardClass}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={`${monoFont.className} text-xs uppercase tracking-[0.26em] text-blue-500`}>
                Typography
              </p>
              <h2 className={`${displayFont.className} mt-3 text-3xl font-bold tracking-[-0.06em]`}>
                Typography Specimens
              </h2>
            </div>
            <p className={`max-w-2xl text-sm leading-6 ${mutedClass}`}>
              The system should feel sharper than default SaaS UI, but never theatrical. Type does
              most of the branding work.
            </p>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {typographyRoles.map((role) => (
              <article
                key={role.name}
                className="rounded-[1.75rem] border border-slate-200/80 p-5 dark:border-white/10"
              >
                <p className={`${monoFont.className} text-[11px] uppercase tracking-[0.24em] text-blue-500`}>
                  {role.name}
                </p>
                <p className="mt-2 text-sm font-semibold">{role.font}</p>
                <div className="mt-5 min-h-32">
                  <p className={role.className}>{role.specimen}</p>
                </div>
                <p className={`mt-4 text-sm leading-6 ${mutedClass}`}>{role.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`rounded-[2rem] border p-7 ${cardClass}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className={`${monoFont.className} text-xs uppercase tracking-[0.26em] text-blue-500`}>
                Color
              </p>
              <h2 className={`${displayFont.className} mt-3 text-3xl font-bold tracking-[-0.06em]`}>
                Color System
              </h2>
            </div>
            <p className={`max-w-2xl text-sm leading-6 ${mutedClass}`}>
              Blue stays as the trust anchor, but teal and ink give RelayOps a more owned,
              operations-led voice than a generic monochrome SaaS stack.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {palette.map((color) => (
              <article
                key={color.name}
                className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 dark:border-white/10"
              >
                <div className="h-28" style={{ backgroundColor: color.hex }} />
                <div className="space-y-2 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-base font-semibold">{color.name}</p>
                    <p className={`${monoFont.className} text-xs uppercase tracking-[0.2em] ${subMutedClass}`}>
                      {color.hex}
                    </p>
                  </div>
                  <p className={`text-sm leading-6 ${mutedClass}`}>{color.use}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.75rem] border border-slate-200/80 p-5 dark:border-white/10">
              <p className={`${monoFont.className} text-[11px] uppercase tracking-[0.24em] text-blue-500`}>
                Component Samples
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-full bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_-20px_rgba(59,130,246,0.7)]">
                  Request Access
                </button>
                <button className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900">
                  Review Sample
                </button>
                <button className="rounded-full border border-teal-500/20 bg-teal-500/10 px-5 py-3 text-sm font-semibold text-teal-700">
                  QA Passed
                </button>
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold">Partner handoff complete</p>
                <p className={`mt-2 text-sm leading-6 ${mutedClass}`}>
                  The final delivery package is ready for agency branding and client presentation.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200/80 p-5 dark:border-white/10">
              <p className={`${monoFont.className} text-[11px] uppercase tracking-[0.24em] text-blue-500`}>
                Contrast Pairs
              </p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1.5rem] bg-[#0B1220] px-4 py-5 text-white">
                  Control Ink on dark rails for authority and scan speed
                </div>
                <div className="rounded-[1.5rem] bg-[#E8EEF7] px-4 py-5 text-slate-900">
                  Mist Surface for low-drama emphasis and section rhythm
                </div>
                <div className="rounded-[1.5rem] bg-[#14B8A6] px-4 py-5 text-white">
                  Signal Teal only where proof or automation deserves emphasis
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className={`rounded-[2rem] border p-7 ${cardClass}`}>
            <p className={`${monoFont.className} text-xs uppercase tracking-[0.26em] text-blue-500`}>
              Mockup 01
            </p>
            <h2 className={`${displayFont.className} mt-3 text-3xl font-bold tracking-[-0.06em]`}>
              Marketing Signal
            </h2>
            <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_64px_-44px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[#0f172a]">
              <p className={`${monoFont.className} text-[11px] uppercase tracking-[0.24em] text-blue-500`}>
                White-label CRM cleanup for agencies
              </p>
              <p className={`${displayFont.className} mt-4 text-3xl font-bold tracking-[-0.05em]`}>
                Sell the turnaround. RelayOps handles the production floor.
              </p>
              <p className={`mt-4 text-sm leading-6 ${mutedClass}`}>
                Fixed-scope operations delivery, audit-ready outputs, and a client-safe process your
                team can promise with confidence.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600">
                  2-day SLA
                </span>
                <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-600">
                  QA sign-off
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  White-label delivery
                </span>
              </div>
            </div>
          </section>

          <section className={`rounded-[2rem] border p-7 ${cardClass}`}>
            <p className={`${monoFont.className} text-xs uppercase tracking-[0.26em] text-blue-500`}>
              Mockup 02
            </p>
            <h2 className={`${displayFont.className} mt-3 text-3xl font-bold tracking-[-0.06em]`}>
              Dashboard Chrome
            </h2>
            <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-[#0B1220] bg-[#0B1220] text-white">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold">RelayOps Control</p>
                  <p className="text-xs text-slate-400">Partner delivery queue</p>
                </div>
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                  12 active jobs
                </span>
              </div>
              <div className="space-y-3 p-5">
                {dashboardRows.map(([job, status, eta, handoff]) => (
                  <div key={job} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{job}</p>
                      <span className="rounded-full bg-teal-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-200">
                        {status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-300">
                      <div>
                        <p className="text-slate-500">ETA</p>
                        <p className="mt-1 font-semibold text-white">{eta}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Next step</p>
                        <p className="mt-1 font-semibold text-white">{handoff}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={`rounded-[2rem] border p-7 ${cardClass}`}>
            <p className={`${monoFont.className} text-xs uppercase tracking-[0.26em] text-blue-500`}>
              Mockup 03
            </p>
            <h2 className={`${displayFont.className} mt-3 text-3xl font-bold tracking-[-0.06em]`}>
              Settings Confidence
            </h2>
            <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0f172a]">
              <p className="text-sm font-semibold">Agency delivery defaults</p>
              <div className="mt-5 space-y-4">
                {settingsRows.map((row) => (
                  <div key={row.label} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                    <p className={`text-xs uppercase tracking-[0.22em] ${subMutedClass}`}>{row.label}</p>
                    <p className="mt-2 text-sm font-semibold">{row.value}</p>
                  </div>
                ))}
              </div>
              <button className="mt-5 w-full rounded-full bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_-20px_rgba(59,130,246,0.7)]">
                Save operating defaults
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
