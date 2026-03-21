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
  },
  {
    icon: Tag,
    title: 'Resell at Any Margin',
    description:
      'Our pricing is your floor. Charge clients $500–$1,000 for a $149 pilot job, or $2,000–$5,000 for a $499 standard job. You own the relationship and the margin.',
  },
  {
    icon: Shield,
    title: 'ISO-Grade Handling',
    description:
      'Your data is never used to train AI models. Files are stored encrypted with signed URLs and deleted automatically on a fixed retention schedule.',
  },
  {
    icon: Users,
    title: 'Dedicated Portal',
    description:
      'Submit briefs, track job status, download deliverables, and manage your account — all in one place. No email threads, no spreadsheet tracking.',
  },
  {
    icon: TrendingUp,
    title: 'Scale Without Headcount',
    description:
      'Add data prep capacity without hiring. Submit 1 job or 20 jobs a month — the same process, the same SLA, no staffing overhead on your end.',
  },
  {
    icon: FileCheck,
    title: 'Fixed Scope, Fixed Price',
    description:
      'Every job is scoped before invoicing. You see exactly what will be delivered and what it costs before you pay. No scope creep, no surprise overages.',
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
      <div className="flex flex-col bg-[#FAFAFA] font-sans text-slate-900">
        <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-32 bg-slate-900 text-white">
          <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />

          <div className="container relative max-w-7xl">
            <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
              <FadeIn>
                <Badge className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-widest text-blue-200">
                  Partner Program
                </Badge>
                <h1 className="font-display mt-8 text-[3.5rem] font-bold tracking-tighter text-balance md:text-7xl lg:leading-[1.05]">
                  White-Label CRM Cleanup.
                </h1>
                <p className="mt-8 max-w-2xl text-lg font-normal leading-relaxed text-slate-400 md:text-xl">
                  Offer 2-day CRM import prep to your clients without hiring operators. RelayOps
                  handles the cleaning. You handle the relationship.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="h-14 rounded-full bg-blue-600 px-8 text-[15px] font-medium text-white shadow-[0_8px_16px_rgb(59,130,246,0.2)] transition-transform hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    <Link href="/request-access">
                      Apply for Partner Access
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-14 rounded-full border-slate-700 bg-slate-800 px-8 text-[15px] font-medium text-white transition-transform hover:-translate-y-0.5 hover:bg-slate-700"
                  >
                    <Link href="/how-it-works">See How It Works</Link>
                  </Button>
                </div>
              </FadeIn>

              <SlideUp transition={{ delay: 0.15 }}>
                <div className="rounded-[32px] border border-slate-800 bg-slate-800/50 p-10 shadow-[0_24px_80px_-12px_rgb(0,0,0,0.5)] backdrop-blur-xl">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      '2-Day SLA',
                      'Resell at Any Margin',
                      'Dedicated Portal',
                      'Fixed Price',
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[20px] bg-slate-900/80 px-6 py-5 text-[14px] font-medium text-slate-300 border border-slate-800"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-[24px] border border-blue-500/20 bg-blue-500/5 p-8">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-blue-300 mb-6">
                      Pricing Overview
                    </p>
                    <div className="grid gap-6 sm:grid-cols-3">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Pilot</p>
                        <p className="mt-2 font-display text-3xl font-bold tracking-tighter text-white">$149</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Standard</p>
                        <p className="mt-2 font-display text-3xl font-bold tracking-tighter text-white">$499</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Custom</p>
                        <p className="mt-2 font-display text-3xl font-bold tracking-tighter text-white">Quoted</p>
                      </div>
                    </div>
                  </div>
                </div>
              </SlideUp>
            </div>
          </div>
        </section>

        <section className="bg-white py-24 md:py-32">
          <div className="container max-w-7xl">
            <FadeIn className="mx-auto max-w-3xl text-center mb-20">
              <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                What you get as a partner
              </h2>
            </FadeIn>
            
            <StaggerList className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {BENEFITS.map((item, index) => {
                const Icon = item.icon
                return (
                  <StaggerItem
                    key={item.title}
                    className={cn(
                      "rounded-[24px] border border-slate-200/60 bg-[#FAFAFA] p-8 transition-colors hover:bg-slate-50",
                      index === 0 ? "xl:col-span-2" : ""
                    )}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-900 shadow-[0_2px_8px_rgb(0,0,0,0.04)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display mt-8 text-2xl font-bold tracking-tight text-slate-900">{item.title}</h3>
                    <p className="mt-4 text-[15px] font-normal leading-relaxed text-slate-500">{item.description}</p>
                  </StaggerItem>
                )
              })}
            </StaggerList>
          </div>
        </section>

        <section className="py-24 md:py-32 border-y border-slate-100">
          <div className="container max-w-7xl">
            <FadeIn className="mx-auto max-w-3xl text-center mb-20">
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-blue-600 mb-4">
                Pricing
              </p>
              <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Transparent pricing tiers
              </h2>
              <p className="mt-6 text-lg font-normal leading-relaxed text-slate-500">
                These are your costs. Charge your clients whatever makes sense for your business.
              </p>
            </FadeIn>

            <StaggerList className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 lg:items-end">
              {PRICING.map((plan, index) => (
                <StaggerItem
                  key={plan.tier}
                  className={cn(
                    "flex flex-col h-full rounded-[32px] border p-8 transition-all duration-300",
                    plan.highlight
                      ? 'border-slate-900 bg-slate-900 text-white shadow-[0_24px_80px_-12px_rgb(0,0,0,0.2)]'
                      : 'border-slate-200/60 bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
                    plan.highlight ? "lg:pb-12" : "lg:pb-8"
                  )}
                >
                  <div className="flex-1">
                    {plan.highlight ? (
                      <Badge className="mb-6 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white border-none">
                        Most common
                      </Badge>
                    ) : null}
                    <div className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">
                      {plan.tier}
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                      {plan.unit ? (
                        <span className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          {plan.unit}
                        </span>
                      ) : null}
                      <span className={cn("font-display text-[2.5rem] font-bold tracking-tighter leading-none", plan.highlight ? "text-white" : "text-slate-900")}>
                        {plan.price}
                      </span>
                    </div>
                    <ul className="mt-10 space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className={cn("flex items-start gap-3 text-[14px] font-medium leading-relaxed", plan.highlight ? "text-slate-300" : "text-slate-600")}>
                          <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", plan.highlight ? "bg-blue-500" : "bg-slate-300")} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    asChild
                    size={plan.highlight ? "lg" : "default"}
                    className={cn(
                      "mt-10 w-full rounded-full transition-transform hover:-translate-y-0.5",
                      plan.highlight
                        ? 'h-14 bg-white text-slate-900 shadow-[0_8px_16px_rgb(255,255,255,0.1)] hover:bg-slate-50'
                        : 'h-12 border-slate-200/80 bg-white text-slate-900 shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:bg-slate-50'
                    )}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        </section>

        <section className="bg-white py-24 md:py-32">
          <div className="container max-w-5xl">
            <FadeIn className="mx-auto max-w-2xl text-center mb-20">
              <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Who makes a great partner?
              </h2>
              <p className="mt-6 text-lg font-normal leading-relaxed text-slate-500">
                RelayOps is designed for agencies that handle CRM data regularly and want
                reliable fulfillment without adding headcount.
              </p>
            </FadeIn>
            <StaggerList className="grid gap-6 md:grid-cols-2">
              {GOOD_FIT.map((item) => (
                <StaggerItem
                  key={item.type}
                  className="rounded-[24px] border border-slate-200/60 bg-[#FAFAFA] p-8 transition-colors hover:bg-slate-50"
                >
                  <h3 className="font-display text-xl font-bold tracking-tight text-slate-900">
                    {item.type}
                  </h3>
                  <p className="mt-4 text-[15px] font-normal leading-relaxed text-slate-600">{item.description}</p>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        </section>

        <section className="pb-24 md:pb-32">
          <div className="container max-w-5xl">
            <FadeIn className="rounded-[32px] bg-slate-900 px-10 py-16 text-center text-white shadow-[0_32px_64px_-16px_rgb(0,0,0,0.2)] md:px-16 md:py-24">
              <h2 className="font-display max-w-3xl mx-auto text-4xl font-bold tracking-tight text-balance md:text-5xl">
                Apply for Partner Access
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-[17px] font-normal leading-relaxed text-slate-400">
                White-label CRM data cleanup fulfillment for RevOps agencies. Apply for partner access.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full bg-blue-600 px-8 text-[15px] font-medium text-white shadow-[0_8px_16px_rgb(59,130,246,0.2)] transition-transform hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  <Link href="/request-access">
                    Apply for Partner Access
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-14 rounded-full border-slate-700 bg-slate-800 px-8 text-[15px] font-medium text-white transition-transform hover:-translate-y-0.5 hover:bg-slate-700"
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
