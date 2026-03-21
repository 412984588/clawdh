'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CircleDollarSign,
  Sparkles,
  X,
  ChevronDown,
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
import {
  MotionProvider,
  FadeIn,
  SlideUp,
  StaggerList,
  StaggerItem,
} from '@/components/ui/motion'
import { m, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

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
    <ul className="space-y-4">
      {features.map((feature) => (
        <li key={feature.label} className="flex items-start gap-3 text-[15px] font-normal leading-relaxed text-slate-600">
          {feature.included ? (
            <Check className="mt-1 h-4 w-4 flex-none text-slate-800" aria-hidden="true" />
          ) : (
            <X className="mt-1 h-4 w-4 flex-none text-slate-300" aria-hidden="true" />
          )}
          <span className={cn(!feature.included && "text-slate-400")}>{feature.label}</span>
        </li>
      ))}
    </ul>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <StaggerItem>
      <div 
        role="button"
        tabIndex={0}
        className={cn(
          "group rounded-[24px] border border-slate-200/60 bg-white p-8 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer hover:border-blue-500/30",
          isOpen && "border-blue-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        )}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-[17px] font-bold tracking-tight text-slate-900">
            {question}
          </h3>
          <ChevronDown className={cn("h-5 w-5 text-slate-400 transition-transform duration-300", isOpen && "rotate-180 text-blue-500")} />
        </div>
        <AnimatePresence>
          {isOpen && (
            <m.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="text-[15px] font-normal leading-relaxed text-slate-500">
                {answer}
              </p>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </StaggerItem>
  )
}

export default function PricingPage() {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null)

  return (
    <MotionProvider>
      <div className="bg-[#FAFAFA] text-slate-900 font-sans">
        <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-28">
          <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06)_0%,transparent_70%)] pointer-events-none" />

          <div className="container relative max-w-7xl text-center">
            <FadeIn className="mx-auto max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/50 px-3 py-1.5 shadow-[0_2px_8px_rgb(0,0,0,0.04)] backdrop-blur-md">
                <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-600">
                  Pricing Strategy
                </span>
              </div>
              <h1 className="font-display mt-8 mx-auto max-w-[15ch] text-[3.5rem] font-bold leading-[1.05] tracking-tighter text-slate-900 sm:text-5xl md:text-7xl lg:leading-[1]">
                Clear margins. Predictable delivery.
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-lg font-normal leading-relaxed text-slate-500 md:text-xl">
                RelayOps is positioned as a structured operating model, not generic task labor. The
                page shows how the offer scales from a small team entry point to enterprise support.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-20 md:py-32">
          <div className="container max-w-7xl">
            <StaggerList className="grid gap-6 lg:grid-cols-3 lg:items-end">
              {tiers.map((tier, index) => {
                const Icon = tier.icon
                const isHovered = hoveredTier === tier.name

                return (
                  <StaggerItem
                    key={tier.name}
                    className={cn(
                      "h-full w-full relative",
                      tier.featured ? "lg:pb-0" : "lg:pb-8" // Creates the asymmetrical height
                    )}
                  >
                    <div
                      onMouseEnter={() => setHoveredTier(tier.name)}
                      onMouseLeave={() => setHoveredTier(null)}
                      className={cn(
                        "flex h-full flex-col rounded-[32px] border transition-all duration-300 relative z-10",
                        tier.featured
                          ? 'border-slate-900 bg-slate-900 text-white shadow-[0_24px_80px_-12px_rgb(0,0,0,0.2)] hover:shadow-[0_32px_90px_-12px_rgb(0,0,0,0.3)] hover:-translate-y-1'
                          : 'border-slate-200/60 bg-white hover:shadow-[0_16px_40px_rgb(0,0,0,0.06)] hover:border-blue-500/30 hover:-translate-y-1',
                        isHovered && !tier.featured && 'ring-1 ring-blue-500/30 ring-offset-2 ring-offset-[#FAFAFA]'
                      )}
                    >
                      <div className="p-8 md:p-10 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <div
                            className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300",
                              tier.featured ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-900 shadow-[0_2px_8px_rgb(0,0,0,0.04)]',
                              isHovered && !tier.featured && 'bg-blue-50 text-blue-600'
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          {tier.featured ? (
                            <Badge className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-blue-600 border-none">
                              Recommended
                            </Badge>
                          ) : null}
                        </div>
                        <h3
                          className={cn(
                            "font-display mt-8 text-2xl font-bold tracking-tight",
                            tier.featured ? 'text-white' : 'text-slate-900'
                          )}
                        >
                          {tier.name}
                        </h3>
                        <p
                          className={cn(
                            "mt-4 text-[15px] font-normal leading-relaxed",
                            tier.featured ? 'text-slate-300' : 'text-slate-500'
                          )}
                        >
                          {tier.summary}
                        </p>
                        
                        <div className="mt-10 mb-10">
                          <p
                            className={cn(
                              "font-display text-[2.5rem] font-bold tracking-tighter leading-none transition-colors duration-300",
                              tier.featured ? 'text-white' : 'text-slate-900',
                              isHovered && !tier.featured && 'text-blue-600'
                            )}
                          >
                            {tier.price}
                          </p>
                          <p className={cn(
                            "mt-3 text-[13px] font-medium",
                            tier.featured ? 'text-slate-400' : 'text-slate-500'
                          )}>
                            {tier.billing}
                          </p>
                        </div>

                        <FeatureList features={tier.features} />
                      </div>
                      
                      <div className="p-8 md:p-10 pt-0 mt-auto">
                        <Button
                          asChild
                          size={tier.featured ? "lg" : "default"}
                          className={cn(
                            "w-full rounded-full transition-all duration-300 hover:-translate-y-1",
                            tier.featured
                              ? 'h-14 bg-white text-slate-900 hover:bg-slate-50 shadow-[0_8px_16px_rgb(255,255,255,0.1)] hover:shadow-[0_12px_24px_rgb(255,255,255,0.2)]'
                              : 'h-12 border-slate-200/80 bg-white text-slate-900 hover:bg-slate-50 shadow-[0_2px_8px_rgb(0,0,0,0.04)]',
                            isHovered && !tier.featured && 'border-blue-500/30 bg-blue-50/50 text-blue-700'
                          )}
                          variant={tier.featured ? "default" : "outline"}
                        >
                          <Link href="/request-access">
                            {tier.ctaLabel}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </StaggerItem>
                )
              })}
            </StaggerList>
          </div>
        </section>

        {/* COMPARISON SECTION */}
        <section className="py-24 md:py-32 bg-white border-y border-slate-100">
          <div className="container max-w-7xl">
            <FadeIn className="max-w-3xl">
              <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                How RelayOps stacks up.
              </h2>
            </FadeIn>

            <SlideUp className="mt-20 space-y-4 md:hidden">
              {comparisonRows.map((row) => (
                <div
                  key={row.dimension}
                  className="rounded-[24px] border border-slate-200/60 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-6">
                    {row.dimension}
                  </h3>
                  <div className="space-y-4">
                    <div className="rounded-[16px] bg-slate-50 p-5">
                      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-blue-600">
                        RelayOps
                      </p>
                      <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{row.relayops}</p>
                    </div>
                    <div className="rounded-[16px] border border-slate-200/60 bg-white p-5">
                      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">
                        Self-built team
                      </p>
                      <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{row.selfBuilt}</p>
                    </div>
                    <div className="rounded-[16px] border border-slate-200/60 bg-white p-5">
                      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">
                        Traditional outsourcing
                      </p>
                      <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{row.outsourcing}</p>
                    </div>
                  </div>
                </div>
              ))}
            </SlideUp>

            <SlideUp className="mt-20 hidden overflow-hidden rounded-[24px] border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 border-b-slate-200/60">
                    <TableHead className="w-48 py-6 px-8 font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">Dimension</TableHead>
                    <TableHead className="py-6 px-8 font-mono text-[10px] font-medium uppercase tracking-widest text-blue-600">RelayOps</TableHead>
                    <TableHead className="py-6 px-8 font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">Self-built team</TableHead>
                    <TableHead className="py-6 px-8 font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">Traditional outsourcing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonRows.map((row) => (
                    <TableRow key={row.dimension} className="border-b-slate-100 hover:bg-transparent">
                      <TableCell className="py-8 px-8 align-top text-base font-bold text-slate-900">{row.dimension}</TableCell>
                      <TableCell className="py-8 px-8 align-top text-[15px] leading-relaxed text-slate-900 font-medium">{row.relayops}</TableCell>
                      <TableCell className="py-8 px-8 align-top text-[15px] leading-relaxed text-slate-500">{row.selfBuilt}</TableCell>
                      <TableCell className="py-8 px-8 align-top text-[15px] leading-relaxed text-slate-500">{row.outsourcing}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SlideUp>
          </div>
        </section>

        {/* FAQS SECTION */}
        <section className="py-24 md:py-32">
          <div className="container max-w-3xl">
            <FadeIn>
              <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl mb-16 text-center">
                Frequently Asked Questions
              </h2>
            </FadeIn>

            <StaggerList className="space-y-6">
              {faqs.map((item) => (
                <FaqItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </StaggerList>
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="container max-w-5xl">
            <FadeIn className="rounded-[32px] bg-slate-900 p-12 text-center text-white shadow-[0_32px_64px_-16px_rgb(0,0,0,0.2)] md:p-20">
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Ready to frame the value?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-[17px] font-normal leading-relaxed text-slate-400">
                The pricing page establishes commercial positioning without locking in final numbers
                before the market story is ready.
              </p>
              <div className="mt-10">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full bg-blue-600 px-8 text-[15px] font-medium text-white shadow-[0_8px_16px_rgb(59,130,246,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_12px_24px_rgb(59,130,246,0.3)]"
                >
                  <Link href="/request-access">
                    Request Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </FadeIn>
          </div>
        </section>
      </div>
    </MotionProvider>
  )
}
