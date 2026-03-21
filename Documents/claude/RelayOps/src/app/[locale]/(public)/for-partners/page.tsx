import Link from 'next/link'
import {
  ArrowRight,
  Clock,
  FileCheck,
  Shield,
  Tag,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MotionProvider,
  FadeIn,
  SlideUp,
  StaggerList,
  StaggerItem,
} from '@/components/ui/motion'
import {
  buildPartnerServiceJsonLd,
  createPublicMetadata,
  publicPageDefinitions,
} from '@/lib/seo'
import { cn } from '@/lib/utils/cn'

export const metadata = createPublicMetadata(publicPageDefinitions.forPartners)

const BENEFITS = [
  {
    icon: Clock,
    title: '2-Day SLA',
    description:
      'Standard jobs turn in 2 business days from payment. Predictable turnaround means you can promise clients a delivery date and keep it.',
    accent: 'border-t-blue-500',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
  },
  {
    icon: Tag,
    title: 'Resell at Any Margin',
    description:
      'Our pricing is your floor. Charge clients $500–$1,000 for a $149 pilot job, or $2,000–$5,000 for a $499 standard job. You own the relationship and the margin.',
    accent: 'border-t-slate-400',
    iconBg: 'bg-slate-400/10',
    iconColor: 'text-slate-600',
  },
  {
    icon: Shield,
    title: 'ISO-Grade Data Handling',
    description:
      'Your data is never used to train AI models. Files are stored encrypted with signed URLs and deleted automatically on a fixed retention schedule. A DPA is available on request for enterprise clients.',
    accent: 'border-t-teal-500',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-600',
  },
  {
    icon: Users,
    title: 'Dedicated Partner Portal',
    description:
      'Submit briefs, track job status, download deliverables, and manage your account — all in one place. No email threads, no spreadsheet tracking.',
    accent: 'border-t-blue-400',
    iconBg: 'bg-blue-400/10',
    iconColor: 'text-blue-500',
  },
  {
    icon: TrendingUp,
    title: 'Scale Without Headcount',
    description:
      'Add data prep capacity without hiring. Submit 1 job or 20 jobs a month — the same process, the same SLA, no staffing overhead on your end.',
    accent: 'border-t-slate-500',
    iconBg: 'bg-slate-500/10',
    iconColor: 'text-slate-600',
  },
  {
    icon: FileCheck,
    title: 'Fixed Scope, Fixed Price',
    description:
      'Every job is scoped before invoicing. You see exactly what will be delivered and what it costs before you pay. No scope creep, no surprise overages.',
    accent: 'border-t-teal-500',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-600',
  },
]

const PRICING = [
  {
    tier: 'Pilot',
    price: '$149',
    unit: 'flat',
    highlight: false,
    features: [
      'Up to 500 rows, 1 file',
      '2 business day turnaround',
      'Preview-format deliverable',
      'One per organization',
      'No revisions',
    ],
    cta: 'Start with a Pilot',
    href: '/pilot-sample',
  },
  {
    tier: 'Standard',
    price: '$499',
    unit: 'from',
    highlight: true,
    features: [
      '501–5,000 rows, up to 3 files',
      '2 business day turnaround',
      '1 revision included',
      'Dedup, normalize, map',
      'Full white-label deliverable',
    ],
    cta: 'Apply for Access',
    href: '/request-access',
  },
  {
    tier: 'Complex',
    price: '$1,499',
    unit: 'from',
    highlight: false,
    features: [
      '5,001–25,000 rows, up to 10 files',
      '3–4 business day turnaround',
      '1 revision included',
      'Multi-object, multi-source',
      'Advanced multi-system from $2,499',
    ],
    cta: 'Apply for Access',
    href: '/request-access',
  },
  {
    tier: 'Custom',
    price: 'Quoted',
    unit: '',
    highlight: false,
    features: [
      '25,000+ rows or ongoing',
      'Projects from $2,500',
      'Monthly retainers from $3,000',
      'Volume pricing available',
      'Dedicated account handling',
    ],
    cta: 'Apply for Access',
    href: '/request-access',
  },
]

const GOOD_FIT = [
  {
    type: 'HubSpot Implementation Agencies',
    description:
      "You set up HubSpot for mid-market B2B clients. Import prep is a fixed part of every engagement — you'd rather delegate it than have an analyst spend 3 days cleaning spreadsheets.",
  },
  {
    type: 'RevOps Consultants',
    description:
      'You advise on CRM strategy but get pulled into one-off data cleanup requests. RelayOps lets you fulfil those requests without pulling your consultants off higher-value work.',
  },
  {
    type: 'Data Migration Specialists',
    description:
      'You move clients between CRM platforms. The pre-migration data quality work is the boring-but-critical part. Delegate the cleaning, keep the strategy.',
  },
  {
    type: 'Marketing Ops Agencies',
    description:
      'Your clients send you contacts exports that need normalization before they can be used. You do the strategy; we prep the list.',
  },
]

export default function ForPartnersPage() {
  return (
    <MotionProvider>
      <div className="flex flex-col bg-[#f8fafc]">
        <section className="relative overflow-hidden bg-[#0B1220] py-20 text-white md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(20,184,166,0.14),transparent_24%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />

          <div className="container relative">
            <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
              <FadeIn>
                <Badge className="rounded-full border border-blue-500/20 bg-white/10 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-200 hover:bg-white/10">
                  Partner Program
                </Badge>
                <h1 className="font-display mt-8 text-5xl font-bold tracking-[-0.08em] text-balance text-white md:text-7xl lg:leading-[0.94]">
                  White-Label CRM Cleanup for RevOps Agencies
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
                  Offer 2-day CRM import prep to your clients without hiring operators. RelayOps
                  handles the cleaning. You handle the relationship.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full border border-blue-500/30 bg-blue-600 px-7 text-white shadow-[0_24px_50px_-24px_rgba(59,130,246,0.52)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500"
                  >
                    <Link href="/request-access">
                      Apply for Partner Access
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full border border-white/15 bg-white/5 px-7 text-white shadow-[0_18px_40px_-24px_rgba(24,24,27,0.8)] transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10 hover:shadow-[0_28px_44px_-22px_rgba(24,24,27,0.95)]"
                  >
                    <Link href="/how-it-works">See How It Works</Link>
                  </Button>
                </div>
              </FadeIn>

              <SlideUp transition={{ delay: 0.15 }}>
                <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-[0_40px_90px_-45px_rgba(59,130,246,0.35)] backdrop-blur-xl">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      '2-Day SLA',
                      'Resell at Any Margin',
                      'Dedicated Partner Portal',
                      'Fixed Scope, Fixed Price',
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-3xl border border-white/10 bg-[#0B1220]/55 px-5 py-5 text-sm font-medium text-zinc-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">
                      Transparent pricing tiers
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Pilot</p>
                        <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-white">$149</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Standard</p>
                        <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-white">$499</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Custom</p>
                        <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-white">Quoted</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SlideUp>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 md:py-28">
          <div className="container">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
                What you get as a partner
              </p>
              <h2 className="font-display mt-5 text-4xl font-bold tracking-[-0.06em] text-balance text-zinc-950 md:text-5xl">
                What you get as a partner
              </h2>
            </FadeIn>
            <StaggerList className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {BENEFITS.map((item) => {
                const Icon = item.icon
                return (
                  <StaggerItem
                    key={item.title}
                    className={cn(
                      `rounded-[2rem] border border-zinc-200 border-t-4 ${item.accent} bg-white px-6 py-7 text-zinc-950 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.16)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_30px_70px_-36px_rgba(59,130,246,0.18)]`
                    )}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg}`}>
                      <Icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <h3 className="font-display mt-6 text-2xl font-bold tracking-[-0.04em]">{item.title}</h3>
                    <p className="mt-3 text-base leading-7 text-zinc-600">{item.description}</p>
                  </StaggerItem>
                )
              })}
            </StaggerList>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0B1220] py-20 text-white md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_38%),radial-gradient(circle_at_82%_18%,rgba(20,184,166,0.12),transparent_24%)]" />
          <div className="container relative">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
                Pricing
              </p>
              <h2 className="font-display mt-5 text-4xl font-bold tracking-[-0.06em] text-balance text-white md:text-5xl">
                Transparent pricing tiers
              </h2>
              <p className="mt-5 text-lg leading-8 text-zinc-300">
                These are your costs. Charge your clients whatever makes sense for your business.
              </p>
            </FadeIn>

            <StaggerList className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {PRICING.map((plan) => (
                <StaggerItem
                  key={plan.tier}
                  className={cn(
                    "rounded-[2rem] border p-6 transition-all duration-300 ease-out hover:-translate-y-1",
                    plan.highlight
                      ? 'border-blue-500/40 bg-gradient-to-b from-blue-500/16 via-[#101827] to-[#0B1220] shadow-[0_30px_90px_-44px_rgba(59,130,246,0.5)] hover:shadow-[0_36px_110px_-38px_rgba(59,130,246,0.6)]'
                      : 'border-white/10 bg-white/5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.82)] hover:bg-white/10 hover:shadow-[0_28px_70px_-34px_rgba(59,130,246,0.22)]'
                  )}
                >
                  {plan.highlight ? (
                    <Badge className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-200 hover:bg-blue-500/10">
                      Most common
                    </Badge>
                  ) : null}
                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400">
                      {plan.tier}
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                      {plan.unit ? (
                        <span className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                          {plan.unit}
                        </span>
                      ) : null}
                      <span className="text-5xl font-black tracking-[-0.06em] text-white">
                        {plan.price}
                      </span>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-zinc-300">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    size="lg"
                    className={cn(
                      "mt-8 w-full rounded-full transition-all duration-300",
                      plan.highlight
                        ? 'border border-blue-500/30 bg-blue-600 text-white shadow-[0_24px_50px_-24px_rgba(59,130,246,0.52)] hover:bg-blue-700'
                        : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                    )}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        </section>

        <section className="bg-white py-20 md:py-28">
          <div className="container">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
                Good fit
              </p>
              <h2 className="font-display mt-5 text-4xl font-bold tracking-[-0.06em] text-zinc-950 text-balance md:text-5xl">
                Who makes a great partner
              </h2>
              <p className="mt-5 text-lg leading-8 text-zinc-600">
                RelayOps is designed for agencies that handle CRM data regularly and want
                reliable fulfillment without adding headcount.
              </p>
            </FadeIn>
            <StaggerList className="mt-14 grid gap-5 md:grid-cols-2">
              {GOOD_FIT.map((item) => (
                <StaggerItem
                  key={item.type}
                  className="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.18)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_30px_70px_-36px_rgba(59,130,246,0.18)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                    {item.type}
                  </p>
                  <p className="mt-4 text-base leading-7 text-zinc-600">{item.description}</p>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0B1220] py-20 text-white md:py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_36%),radial-gradient(circle_at_82%_18%,rgba(20,184,166,0.12),transparent_24%)]" />
          <div className="container relative text-center">
            <FadeIn className="mx-auto max-w-3xl">
              <h2 className="font-display text-4xl font-bold tracking-[-0.06em] text-balance md:text-5xl">
                Apply for Partner Access
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
                White-label CRM data cleanup fulfillment for RevOps agencies. Apply for partner access.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full border border-blue-500/30 bg-blue-600 px-7 text-white shadow-[0_24px_50px_-24px_rgba(59,130,246,0.52)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500"
                >
                  <Link href="/request-access">
                    Apply for Partner Access
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="rounded-full border border-white/15 bg-white/5 px-7 text-white transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10"
                >
                  <Link href="/pilot-sample">Start with a Pilot</Link>
                </Button>
              </div>
            </FadeIn>
          </div>
        </section>

        <script
          id="relayops-service-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPartnerServiceJsonLd()) }}
        />
      </div>
    </MotionProvider>
  )
}
