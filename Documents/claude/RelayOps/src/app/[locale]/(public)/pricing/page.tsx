import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CircleDollarSign,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'

export const metadata = createPublicMetadata(publicPageDefinitions.pricing)

type Tier = {
  name: string
  price: string
  billing: string
  summary: string
  ctaLabel: string
  icon: typeof CircleDollarSign
  featured: boolean
  features: Array<{ label: string; included: boolean }>
}

// NOTE: Prices are indicative and subject to owner confirmation before launch
const tiers: Tier[] = [
  {
    name: 'Starter',
    price: '$499/mo',
    billing: '5 tickets/month, $99 per additional ticket',
    summary: 'For small teams that need a clean starting point and predictable delivery.',
    ctaLabel: 'Start Starter Plan',
    icon: CircleDollarSign,
    featured: false,
    features: [
      { label: 'Core cleanup workflows', included: true },
      { label: 'Standard turnaround (48h)', included: true },
      { label: 'Basic reporting visibility', included: true },
      { label: 'Email support', included: true },
      { label: 'Dedicated success lead', included: false },
      { label: 'Custom enterprise controls', included: false },
    ],
  },
  {
    name: 'Professional',
    price: '$1,499/mo',
    billing: '20 tickets/month, $75 per additional ticket',
    summary: 'For growing operators that want full workflow coverage with scalable capacity.',
    ctaLabel: 'Choose Professional',
    icon: Sparkles,
    featured: true,
    features: [
      { label: 'Everything in Starter', included: true },
      { label: 'Priority turnaround (36h)', included: true },
      { label: 'Advanced analytics dashboard', included: true },
      { label: 'Priority queueing', included: true },
      { label: 'Slack integration', included: true },
      { label: 'Dedicated success lead', included: false },
    ],
  },
  {
    name: 'Enterprise',
    price: 'Contact Sales',
    billing: 'Unlimited tickets + custom SLA',
    summary: 'For large accounts that need tailored support, governance, and commercial terms.',
    ctaLabel: 'Contact Enterprise Sales',
    icon: Building2,
    featured: false,
    features: [
      { label: 'Everything in Professional', included: true },
      { label: 'Unlimited tickets', included: true },
      { label: 'Custom SLA (24h or faster)', included: true },
      { label: 'Dedicated success manager', included: true },
      { label: 'Custom integrations', included: true },
      { label: 'Quarterly business reviews', included: true },
    ],
  },
]

const faqs = [
  {
    question: 'Why is the pricing shown as placeholder pricing?',
    answer:
      'The page is designed to explain package structure and positioning first. Commercial numbers can be updated later without changing the information architecture.',
  },
  {
    question: 'How does Professional pricing scale?',
    answer:
      'Professional is framed as usage-based so larger delivery volumes can expand without forcing a full enterprise engagement on day one.',
  },
  {
    question: 'When should a buyer move to Enterprise?',
    answer:
      'Enterprise is intended for teams that need tailored support, governance controls, or a negotiated operating model beyond standard packages.',
  },
  {
    question: 'Is there a long-term contract requirement?',
    answer:
      'The pricing page does not lock in commercial terms. Contract length and structure remain configurable when real pricing is introduced.',
  },
  {
    question: 'How quickly can a team start?',
    answer:
      'The positioning is built around fast onboarding, so buyers can understand the model and move directly into request-access conversations.',
  },
  {
    question: 'What does Enterprise support actually change?',
    answer:
      'Enterprise adds a higher-touch operating relationship with more tailored controls, support expectations, and delivery alignment.',
  },
] as const

const comparisonRows = [
  {
    dimension: 'Cost',
    relayops: 'Structured placeholder packages with clearer cost predictability.',
    selfBuilt: 'Higher fixed overhead from hiring, ramp time, and management.',
    outsourcing: 'Variable project pricing with less visibility before delivery.',
  },
  {
    dimension: 'Speed',
    relayops: 'Designed for repeatable intake-to-delivery flow.',
    selfBuilt: 'Depends on staffing availability and internal prioritization.',
    outsourcing: 'Can be delayed by vendor handoffs and changing project queues.',
  },
  {
    dimension: 'Quality',
    relayops: 'Workflow-driven delivery aligned to defined acceptance criteria.',
    selfBuilt: 'Can be strong, but consistency varies by team maturity.',
    outsourcing: 'Quality often depends on who is staffed to the project.',
  },
  {
    dimension: 'Traceability',
    relayops: 'Built around explicit workflow stages and visible delivery checkpoints.',
    selfBuilt: 'Often spread across internal tools and informal coordination.',
    outsourcing: 'Traceability is commonly fragmented across email and project updates.',
  },
] as const

function FeatureList({ features }: { features: Tier['features'] }) {
  return (
    <ul className="space-y-3">
      {features.map((feature) => (
        <li key={feature.label} className="flex items-start gap-3 text-sm leading-6 text-zinc-700">
          {feature.included ? (
            <Check className="mt-1 h-4 w-4 flex-none text-emerald-600" aria-hidden="true" />
          ) : (
            <X className="mt-1 h-4 w-4 flex-none text-zinc-400" aria-hidden="true" />
          )}
          <span>{feature.label}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PricingPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-zinc-950 py-20 text-white md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(245,158,11,0.16),transparent_26%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />

        <div className="container relative">
          <div className="max-w-4xl">
            <Badge className="rounded-full border border-blue-500/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-200 hover:bg-white/10">
              Pricing Strategy
            </Badge>
            <h1 className="mt-6 max-w-[11ch] text-[2.85rem] font-black leading-[0.93] tracking-[-0.07em] sm:mt-8 sm:max-w-4xl sm:text-5xl md:text-7xl lg:leading-[0.96]">
              Placeholder pricing built to explain positioning before final commercial terms.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300 sm:mt-6 sm:text-lg sm:leading-8 md:text-xl">
              RelayOps is positioned as a structured operating model, not generic task labor. The
              page shows how the offer scales from a small team entry point to enterprise support.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
              Pricing tiers
            </p>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.06em] text-zinc-950 text-balance sm:text-4xl md:text-5xl">
              Three ways to package the RelayOps operating model
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {tiers.map((tier) => {
              const Icon = tier.icon

              return (
                <Card
                  key={tier.name}
                  className={`rounded-[2rem] border-zinc-200 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.18)] ${
                    tier.featured
                      ? 'relative border-blue-500/40 bg-zinc-950 text-white shadow-[0_34px_90px_-40px_rgba(59,130,246,0.35)]'
                      : 'bg-white'
                  }`}
                >
                  <CardHeader className="p-8">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      {tier.featured ? (
                        <Badge className="rounded-full border border-blue-400/20 bg-blue-500/15 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-200">
                          Recommended
                        </Badge>
                      ) : null}
                    </div>
                    <CardTitle
                      className={`text-3xl font-black tracking-[-0.05em] ${
                        tier.featured ? 'text-white' : 'text-zinc-950'
                      }`}
                    >
                      {tier.name}
                    </CardTitle>
                    <CardDescription
                      className={`text-base leading-7 ${
                        tier.featured ? 'text-zinc-300' : 'text-zinc-600'
                      }`}
                    >
                      {tier.summary}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-8 p-8 pt-0">
                    <div className="space-y-2">
                      <p
                        className={`text-4xl font-black tracking-[-0.06em] ${
                          tier.featured ? 'text-white' : 'text-zinc-950'
                        }`}
                      >
                        {tier.price}
                      </p>
                      <p className={tier.featured ? 'text-sm text-zinc-400' : 'text-sm text-zinc-500'}>
                        {tier.billing}
                      </p>
                    </div>

                    <FeatureList features={tier.features} />

                    <Button
                      asChild
                      size="lg"
                      className={`w-full rounded-full ${
                        tier.featured
                          ? 'border border-blue-400/30 bg-blue-500 text-white hover:bg-blue-400'
                          : 'border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-100'
                      }`}
                    >
                      <Link href="/request-access">
                        {tier.ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-zinc-50 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
              Frequently Asked Questions
            </p>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.06em] text-zinc-950 text-balance sm:text-4xl md:text-5xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-2">
            {faqs.map((item) => (
              <Card
                key={item.question}
                className="rounded-[2rem] border-zinc-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.14)]"
              >
                <CardHeader className="p-7">
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="mt-1 h-5 w-5 flex-none text-blue-600" />
                    <div>
                      <CardTitle className="text-xl font-bold tracking-[-0.03em] text-zinc-950">
                        {item.question}
                      </CardTitle>
                      <CardDescription className="mt-4 text-base leading-7 text-zinc-600">
                        {item.answer}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
              Competitive positioning
            </p>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.06em] text-zinc-950 text-balance sm:text-4xl md:text-5xl">
              How RelayOps stacks up against the alternatives
            </h2>
          </div>

          <div className="mt-14 space-y-4 md:hidden">
            {comparisonRows.map((row) => (
              <Card
                key={row.dimension}
                className="rounded-[1.75rem] border-zinc-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.14)]"
              >
                <CardHeader className="px-5 pb-4 pt-5">
                  <CardTitle className="text-xl font-black tracking-[-0.04em] text-zinc-950">
                    {row.dimension}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-5 pb-5 pt-0">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                      RelayOps
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">{row.relayops}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                      Self-built team
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">{row.selfBuilt}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                      Traditional outsourcing
                    </p>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">{row.outsourcing}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-14 hidden overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.18)] md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50">
                  <TableHead className="w-40">Dimension</TableHead>
                  <TableHead>RelayOps</TableHead>
                  <TableHead>Self-built team</TableHead>
                  <TableHead>Traditional outsourcing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonRows.map((row) => (
                  <TableRow key={row.dimension}>
                    <TableCell className="font-semibold text-zinc-950">{row.dimension}</TableCell>
                    <TableCell className="text-zinc-700">{row.relayops}</TableCell>
                    <TableCell className="text-zinc-700">{row.selfBuilt}</TableCell>
                    <TableCell className="text-zinc-700">{row.outsourcing}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="container">
          <div className="rounded-[2rem] border border-zinc-200 bg-zinc-950 px-6 py-8 text-white shadow-[0_30px_90px_-48px_rgba(15,23,42,0.82)] sm:px-8 sm:py-10 md:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
              Ready to price the real version?
            </p>
            <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.06em] text-balance sm:text-4xl md:text-5xl">
              Use the placeholder model to frame value, then move the buyer into a real access conversation.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
              The pricing page establishes commercial positioning without locking in final numbers
              before the market story is ready.
            </p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="rounded-full border border-blue-500/30 bg-blue-600 px-7 text-white shadow-[0_24px_50px_-24px_rgba(59,130,246,0.6)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500"
              >
                <Link href="/request-access">
                  Request Access
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
