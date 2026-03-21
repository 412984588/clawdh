import Link from 'next/link'
import Script from 'next/script'
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
  buildPartnerServiceJsonLd,
  createPublicMetadata,
  publicPageDefinitions,
} from '@/lib/seo'

export const metadata = createPublicMetadata(publicPageDefinitions.forPartners)

const BENEFITS = [
  {
    icon: Clock,
    title: '2-Day SLA',
    description:
      'Standard jobs turn in 2 business days from payment. Predictable turnaround means you can promise clients a delivery date and keep it.',
    accent: 'border-t-amber-500',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-300',
  },
  {
    icon: Tag,
    title: 'Resell at Any Margin',
    description:
      'Our pricing is your floor. Charge clients $500–$1,000 for a $149 pilot job, or $2,000–$5,000 for a $499 standard job. You own the relationship and the margin.',
    accent: 'border-t-amber-600',
    iconBg: 'bg-amber-600/10',
    iconColor: 'text-amber-200',
  },
  {
    icon: Shield,
    title: 'ISO-Grade Data Handling',
    description:
      'Your data is never used to train AI models. Files are stored encrypted with signed URLs and deleted automatically on a fixed retention schedule. A DPA is available on request for enterprise clients.',
    accent: 'border-t-emerald-500',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-300',
  },
  {
    icon: Users,
    title: 'Dedicated Partner Portal',
    description:
      'Submit briefs, track job status, download deliverables, and manage your account — all in one place. No email threads, no spreadsheet tracking.',
    accent: 'border-t-sky-500',
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-300',
  },
  {
    icon: TrendingUp,
    title: 'Scale Without Headcount',
    description:
      'Add data prep capacity without hiring. Submit 1 job or 20 jobs a month — the same process, the same SLA, no staffing overhead on your end.',
    accent: 'border-t-fuchsia-500',
    iconBg: 'bg-fuchsia-500/10',
    iconColor: 'text-fuchsia-300',
  },
  {
    icon: FileCheck,
    title: 'Fixed Scope, Fixed Price',
    description:
      'Every job is scoped before invoicing. You see exactly what will be delivered and what it costs before you pay. No scope creep, no surprise overages.',
    accent: 'border-t-amber-500',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-300',
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
    <div className="flex flex-col bg-white">
      <section className="relative overflow-hidden bg-zinc-950 py-16 text-white sm:py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.28),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(180,83,9,0.16),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />

        <div className="container relative">
          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
            <div
              data-reveal
              className="translate-y-0 opacity-100 transition-all duration-700 ease-out lg:translate-y-6 lg:opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <Badge className="rounded-full border border-amber-500/20 bg-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200 hover:bg-white/10 sm:px-4 sm:text-[11px] sm:tracking-[0.28em]">
                Partner Program
              </Badge>
              <h1 className="mt-6 max-w-[10ch] text-[2.75rem] font-black leading-[0.93] tracking-[-0.08em] text-balance text-white sm:mt-8 sm:max-w-4xl sm:text-5xl md:text-7xl lg:leading-[0.96]">
                White-Label CRM Cleanup for RevOps Agencies
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:mt-6 sm:text-lg sm:leading-8 md:text-xl">
                Offer 2-day CRM import prep to your clients without hiring operators. RelayOps
                handles the cleaning. You handle the relationship.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full border border-blue-600/40 bg-blue-600 px-7 text-white shadow-[0_24px_44px_-20px_rgba(37,99,235,0.72)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-[0_34px_55px_-18px_rgba(37,99,235,0.82)] sm:w-auto"
                >
                  <Link href="/request-access">
                    Apply for Partner Access
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-full border border-white/15 bg-white/5 px-7 text-white shadow-[0_18px_40px_-24px_rgba(24,24,27,0.8)] transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10 hover:shadow-[0_28px_44px_-22px_rgba(24,24,27,0.95)] sm:w-auto"
                >
                  <Link href="/how-it-works">See How It Works</Link>
                </Button>
              </div>
            </div>

            <div
              data-reveal
              className="translate-y-0 opacity-100 transition-all delay-150 duration-700 ease-out lg:translate-y-6 lg:opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-[0_40px_90px_-45px_rgba(180,83,9,0.5)] backdrop-blur-xl sm:p-8">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    '2-Day SLA',
                    'Resell at Any Margin',
                    'Dedicated Partner Portal',
                    'Fixed Scope, Fixed Price',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-3xl border border-white/10 bg-zinc-950/55 px-4 py-4 text-xs font-medium text-zinc-200 sm:px-5 sm:py-5 sm:text-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 sm:mt-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                    Transparent pricing tiers
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Pilot</p>
                      <p className="mt-2 text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">$149</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Standard</p>
                      <p className="mt-2 text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">$499</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Custom</p>
                      <p className="mt-2 text-2xl font-black tracking-[-0.05em] text-white sm:text-3xl">Quoted</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20 md:py-28">
        <div className="container">
          <div
            data-reveal
            className="mx-auto max-w-2xl translate-y-0 text-center opacity-100 transition-all duration-700 ease-out lg:translate-y-6 lg:opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
              What you get as a partner
            </p>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.06em] text-balance text-zinc-950 sm:text-4xl md:text-5xl">
              What you get as a partner
            </h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {BENEFITS.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  data-reveal
                  className={`rounded-[2rem] border border-zinc-200 border-t-4 ${item.accent} bg-zinc-950 px-6 py-6 text-white translate-y-0 opacity-100 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.5)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-zinc-700 hover:shadow-[0_30px_70px_-36px_rgba(180,83,9,0.3)] lg:translate-y-6 lg:opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 sm:py-7`}
                  style={{ transitionDelay: `${index * 90}ms` }}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg}`}>
                    <Icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-[-0.04em] sm:mt-6 sm:text-2xl">{item.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-zinc-300 sm:text-base">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-zinc-950 py-16 text-white sm:py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(180,83,9,0.22),transparent_38%)]" />
        <div className="container relative">
          <div
            data-reveal
            className="mx-auto max-w-2xl translate-y-0 text-center opacity-100 transition-all duration-700 ease-out lg:translate-y-6 lg:opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              Pricing
            </p>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.06em] text-balance text-white sm:text-4xl md:text-5xl">
              Transparent pricing tiers
            </h2>
            <p className="mt-5 text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8">
              These are your costs. Charge your clients whatever makes sense for your business.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PRICING.map((plan, index) => (
              <div
                key={plan.tier}
                data-reveal
                className={`rounded-[2rem] border p-5 translate-y-0 opacity-100 transition-all duration-300 ease-out lg:translate-y-6 lg:opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 sm:p-6 ${
                  plan.highlight
                    ? 'border-blue-500/40 bg-gradient-to-b from-blue-700/18 via-zinc-900 to-zinc-950 shadow-[0_30px_90px_-44px_rgba(59,130,246,0.42)] hover:-translate-y-1 hover:shadow-[0_36px_110px_-38px_rgba(59,130,246,0.52)]'
                    : 'border-white/10 bg-white/5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.82)] hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_28px_70px_-34px_rgba(180,83,9,0.25)]'
                }`}
                style={{ transitionDelay: `${index * 90}ms` }}
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
                    <span className="text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl">
                      {plan.price}
                    </span>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-zinc-300">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  size="lg"
                  className={`mt-8 w-full rounded-full ${
                    plan.highlight
                      ? 'border border-blue-600/40 bg-blue-600 text-white shadow-[0_24px_44px_-20px_rgba(37,99,235,0.72)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-[0_34px_55px_-18px_rgba(37,99,235,0.82)]'
                      : 'border border-white/10 bg-white/5 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white/10'
                  }`}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20 md:py-28">
        <div className="container">
          <div
            data-reveal
            className="mx-auto max-w-2xl translate-y-0 text-center opacity-100 transition-all duration-700 ease-out lg:translate-y-6 lg:opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
              Good fit
            </p>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.06em] text-zinc-950 text-balance sm:text-4xl md:text-5xl">
              Who makes a great partner
            </h2>
            <p className="mt-5 text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8">
              RelayOps is designed for agencies that handle CRM data regularly and want
              reliable fulfillment without adding headcount.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {GOOD_FIT.map((item, index) => (
              <div
                key={item.type}
                data-reveal
                className="rounded-[2rem] border border-zinc-200 bg-white p-6 translate-y-0 opacity-100 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.18)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_30px_70px_-36px_rgba(180,83,9,0.18)] lg:translate-y-6 lg:opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 sm:p-7"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                  {item.type}
                </p>
                <p className="mt-4 text-[15px] leading-7 text-zinc-600 sm:text-base">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-zinc-950 py-16 text-white sm:py-20 md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(180,83,9,0.22),transparent_36%)]" />
        <div className="container relative text-center">
          <div
            data-reveal
            className="mx-auto max-w-3xl translate-y-0 opacity-100 transition-all duration-700 ease-out lg:translate-y-6 lg:opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <h2 className="text-3xl font-black tracking-[-0.06em] text-balance sm:text-4xl md:text-5xl">
              Apply for Partner Access
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8">
              White-label CRM data cleanup fulfillment for RevOps agencies. Apply for partner access.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full rounded-full border border-blue-600/40 bg-blue-600 px-7 text-white shadow-[0_24px_44px_-20px_rgba(37,99,235,0.72)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-[0_34px_55px_-18px_rgba(37,99,235,0.82)] sm:w-auto"
              >
                <Link href="/request-access">
                  Apply for Partner Access
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="w-full rounded-full border border-white/15 bg-white/5 px-7 text-white transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10 sm:w-auto"
              >
                <Link href="/pilot-sample">Start with a Pilot</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Script id="relayops-service-schema" type="application/ld+json">
        {JSON.stringify(buildPartnerServiceJsonLd())}
      </Script>

      <Script id="relayops-partners-motion" strategy="afterInteractive">{`
        (() => {
          const revealTargets = document.querySelectorAll('[data-reveal]:not([data-reveal-ready])');
          revealTargets.forEach((element) => {
            element.setAttribute('data-reveal-ready', 'true');
          });

          const show = (element) => {
            element.classList.add('opacity-100', 'translate-y-0');
            element.classList.remove('opacity-0', 'translate-y-6');
          };

          if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  show(entry.target);
                  revealObserver.unobserve(entry.target);
                }
              });
            }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

            revealTargets.forEach((element) => revealObserver.observe(element));
          } else {
            revealTargets.forEach(show);
          }
        })();
      `}</Script>
    </div>
  )
}
