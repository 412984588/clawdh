import Link from 'next/link'
import { ArrowRight, Database, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  MotionProvider,
  FadeIn,
  SlideUp,
  StaggerList,
  StaggerItem,
} from '@/components/ui/motion'
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'
import { cn } from '@/lib/utils/cn'

export const metadata = createPublicMetadata(publicPageDefinitions.caseStudies)

const caseStudies = [
  {
    company: 'Northstar Commerce',
    industry: 'Ecommerce operations',
    problem:
      'An omnichannel retailer had duplicate customer records, SKU mismatches, and fragmented order exports slowing every weekly reporting cycle.',
    solution:
      'RelayOps standardized source files, merged duplicate records, and rebuilt the import set into a clean operating dataset for the client team.',
    outcome: 'Efficiency gain: 60%',
    quote:
      '"This placeholder case study mirrors the kind of cleanup project that turns a reporting bottleneck into a repeatable weekly workflow."',
    icon: ShoppingBag,
    accent: 'from-blue-500/14 via-blue-400/8 to-transparent',
    metrics: [
      { label: 'Data Volume', value: '4.2M rows', width: '84%' },
      { label: 'Delivery Time', value: '36 hours', width: '72%' },
      { label: 'Satisfaction', value: '98%', width: '98%' },
    ],
  },
  {
    company: 'Vertex Cloud Ops',
    industry: 'B2B SaaS',
    problem:
      'A SaaS team needed to migrate account, billing, and product usage history into a new CRM without interrupting revenue workflows.',
    solution:
      'RelayOps sequenced the migration files, normalized field mappings, and staged validation passes so operations could swap systems without losing continuity.',
    outcome: 'Zero downtime migration',
    quote:
      '"This placeholder scenario represents a clean handoff between legacy exports and a live SaaS revenue stack with no operational pause."',
    icon: Sparkles,
    accent: 'from-teal-500/16 via-blue-400/8 to-transparent',
    metrics: [
      { label: 'Data Volume', value: '780K records', width: '68%' },
      { label: 'Delivery Time', value: '48 hours', width: '76%' },
      { label: 'Satisfaction', value: '99%', width: '99%' },
    ],
  },
  {
    company: 'Summit Ridge Capital',
    industry: 'Financial services',
    problem:
      'A finance firm had to reconcile legacy client files, standardize compliance fields, and produce an audit-ready dataset under a fixed deadline.',
    solution:
      'RelayOps reorganized source records, enforced consistent compliance formatting, and delivered documentation-ready output aligned to the review checklist.',
    outcome: 'Audit pass rate: 100%',
    quote:
      '"This placeholder engagement reflects the kind of high-trust data restructuring work required before an external audit or regulator review."',
    icon: ShieldCheck,
    accent: 'from-slate-400/16 via-teal-400/8 to-transparent',
    metrics: [
      { label: 'Data Volume', value: '125K records', width: '58%' },
      { label: 'Delivery Time', value: '24 hours', width: '62%' },
      { label: 'Satisfaction', value: '100%', width: '100%' },
    ],
  },
] as const

export default function CaseStudiesPage() {
  return (
    <MotionProvider>
      <div className="bg-[#f8fafc]">
        <section className="relative overflow-hidden border-b border-slate-200 bg-[#f8fafc] py-20 md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_78%_20%,rgba(20,184,166,0.12),transparent_24%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.11)_1px,transparent_1px)] bg-[size:120px_120px] opacity-25" />

          <div className="container relative">
            <FadeIn className="max-w-4xl">
              <Badge className="rounded-full border border-blue-200 bg-white px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-700 hover:bg-white">
                Placeholder Case Studies
              </Badge>
              <h1 className="font-display mt-8 text-5xl font-bold tracking-[-0.08em] text-balance text-slate-950 md:text-7xl lg:leading-[0.94]">
                Social proof for data work that has to land cleanly the first time.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
                Three representative placeholder stories, shaped to feel like real delivery
                scenarios across ecommerce, SaaS, and financial operations.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container">
            <StaggerList className="space-y-8">
              {caseStudies.map((study, index) => {
                const Icon = study.icon

                return (
                  <StaggerItem key={study.company}>
                    <Card
                      className="overflow-hidden rounded-[2rem] border-zinc-200 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.18)] transition-all duration-300 hover:border-blue-200"
                    >
                      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                        <div className={`bg-gradient-to-br ${study.accent} p-8 md:p-10`}>
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-[0_16px_34px_-20px_rgba(24,24,27,0.75)]">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                                Placeholder case study {index + 1}
                              </p>
                              <p className="mt-2 text-sm font-medium text-zinc-600">{study.industry}</p>
                            </div>
                          </div>

                          <div className="mt-8 space-y-4">
                            <h2 className="font-display text-3xl font-bold tracking-[-0.05em] text-zinc-950 md:text-4xl">
                              {study.company}
                            </h2>
                            <p className="text-lg font-semibold text-zinc-800">{study.outcome}</p>
                            <p className="text-base leading-7 text-zinc-700">{study.quote}</p>
                          </div>
                        </div>

                        <div className="p-8 md:p-10">
                          <CardHeader className="p-0">
                            <CardTitle className="text-xl font-bold tracking-[-0.04em] text-zinc-950">
                              Problem
                            </CardTitle>
                            <CardDescription className="text-base leading-7 text-zinc-600">
                              {study.problem}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="mt-8 space-y-8 p-0">
                            <div className="space-y-3">
                              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
                                Solution
                              </p>
                              <p className="text-base leading-7 text-zinc-700">{study.solution}</p>
                            </div>

                            <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5">
                              <div className="mb-4 flex items-center gap-2">
                                <Database className="h-4 w-4 text-zinc-500" />
                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-600">
                                  Metrics snapshot
                                </p>
                              </div>

                              <div className="space-y-4">
                                {study.metrics.map((metric) => (
                                  <div key={metric.label} className="space-y-2">
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                      <span className="font-medium text-zinc-600">{metric.label}</span>
                                      <span className="font-semibold text-zinc-950">{metric.value}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                                      <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400"
                                        style={{ width: metric.width }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </div>
                    </Card>
                  </StaggerItem>
                )
              })}
            </StaggerList>
          </div>
        </section>

        <section className="pb-20 md:pb-28">
          <div className="container">
            <FadeIn className="rounded-[2rem] border border-[#0B1220] bg-[#0B1220] px-8 py-10 text-white shadow-[0_30px_90px_-48px_rgba(11,18,32,0.82)] md:px-12">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-teal-200">
                Ready to create the real version?
              </p>
              <h2 className="font-display mt-5 max-w-3xl text-4xl font-bold tracking-[-0.06em] text-balance md:text-5xl">
                Turn these placeholder stories into your next delivered client win.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
                Bring us the messy brief, the migration deadline, or the compliance file backlog.
                We&apos;ll turn it into a clean delivery workflow your team can stand behind.
              </p>
              <div className="mt-8">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full border border-blue-500/30 bg-blue-600 px-7 text-white shadow-[0_24px_50px_-24px_rgba(59,130,246,0.52)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500"
                >
                  <Link href="/request-access">
                    Request Access
                    <ArrowRight className="h-4 w-4" />
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
