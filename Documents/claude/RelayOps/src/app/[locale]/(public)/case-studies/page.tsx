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
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'

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
      '"RelayOps turned our weekly reporting nightmare into a smooth, repeatable workflow. What used to take 3 days now happens overnight."',
    icon: ShoppingBag,
    accent: 'from-amber-500/20 via-amber-400/10 to-transparent',
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
      '"We migrated 780K customer records without a single hour of downtime. RelayOps handled the complexity so our team could focus on the business."',
    icon: Sparkles,
    accent: 'from-sky-500/20 via-sky-400/10 to-transparent',
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
      '"Our auditors were impressed by the data quality and documentation. RelayOps delivered audit-ready results that exceeded our compliance requirements."',
    icon: ShieldCheck,
    accent: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
    metrics: [
      { label: 'Data Volume', value: '125K records', width: '58%' },
      { label: 'Delivery Time', value: '24 hours', width: '62%' },
      { label: 'Satisfaction', value: '100%', width: '100%' },
    ],
  },
] as const

export default function CaseStudiesPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-zinc-950 py-16 text-white sm:py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.22),transparent_30%),radial-gradient(circle_at_78%_20%,rgba(59,130,246,0.18),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />

        <div className="container relative">
          <div className="max-w-4xl">
            <Badge className="rounded-full border border-amber-500/20 bg-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200 hover:bg-white/10 sm:px-4 sm:text-[11px] sm:tracking-[0.28em]">
              Placeholder Case Studies
            </Badge>
            <h1 className="mt-6 max-w-[10ch] text-[2.8rem] font-black leading-[0.93] tracking-[-0.08em] text-balance sm:mt-8 sm:max-w-4xl sm:text-5xl md:text-7xl lg:leading-[0.96]">
              Social proof for data work that has to land cleanly the first time.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300 sm:mt-6 sm:text-lg sm:leading-8 md:text-xl">
              Three representative placeholder stories, shaped to feel like real delivery
              scenarios across ecommerce, SaaS, and financial operations.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 md:py-24">
        <div className="container space-y-6 sm:space-y-8">
          {caseStudies.map((study, index) => {
            const Icon = study.icon

            return (
              <Card
                key={study.company}
                className="overflow-hidden rounded-[2rem] border-zinc-200 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.18)]"
              >
                <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className={`bg-gradient-to-br ${study.accent} p-6 sm:p-8 md:p-10`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-[0_16px_34px_-20px_rgba(24,24,27,0.75)] sm:h-12 sm:w-12">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                          Placeholder case study {index + 1}
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-zinc-600">{study.industry}</p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
                      <h2 className="text-2xl font-black tracking-[-0.05em] text-zinc-950 sm:text-3xl md:text-4xl">
                        {study.company}
                      </h2>
                      <p className="text-base font-semibold text-zinc-800 sm:text-lg">
                        {study.outcome}
                      </p>
                      <p className="text-[15px] leading-7 text-zinc-700 sm:text-base">
                        {study.quote}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 md:p-10">
                    <CardHeader className="p-0">
                      <CardTitle className="text-lg font-bold tracking-[-0.04em] text-zinc-950 sm:text-xl">
                        Problem
                      </CardTitle>
                      <CardDescription className="text-[15px] leading-7 text-zinc-600 sm:text-base">
                        {study.problem}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="mt-6 space-y-6 p-0 sm:mt-8 sm:space-y-8">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
                          Solution
                        </p>
                        <p className="text-[15px] leading-7 text-zinc-700 sm:text-base">
                          {study.solution}
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
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
                                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-300"
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
            )
          })}
        </div>
      </section>

      <section className="pb-16 sm:pb-20 md:pb-28">
        <div className="container">
          <div className="rounded-[2rem] border border-zinc-200 bg-zinc-950 px-6 py-8 text-white shadow-[0_30px_90px_-48px_rgba(15,23,42,0.82)] sm:px-8 sm:py-10 md:px-12">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              Ready to create the real version?
            </p>
            <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.06em] text-balance sm:text-4xl md:text-5xl">
              Turn these placeholder stories into your next delivered client win.
            </h2>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-zinc-300 sm:text-base">
              Bring us the messy brief, the migration deadline, or the compliance file backlog.
              We&apos;ll turn it into a clean delivery workflow your team can stand behind.
            </p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="w-full rounded-full border border-blue-600/40 bg-blue-600 px-7 text-white shadow-[0_24px_50px_-24px_rgba(59,130,246,0.6)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 sm:w-auto"
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
