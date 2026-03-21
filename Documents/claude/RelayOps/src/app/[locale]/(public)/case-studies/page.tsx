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
    accent: 'from-blue-500/10 via-blue-400/5 to-transparent',
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
    accent: 'from-blue-400/10 via-blue-300/5 to-transparent',
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
    accent: 'from-slate-400/10 via-slate-300/5 to-transparent',
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
      <div className="bg-[#FAFAFA] text-slate-900">
        <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-24 border-b border-slate-200/50">
          <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06)_0%,transparent_70%)] pointer-events-none" />

          <div className="container relative max-w-4xl text-center">
            <FadeIn>
              <Badge className="rounded-full border border-slate-200/60 bg-white px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-widest text-slate-600 shadow-sm">
                Case Studies
              </Badge>
              <h1 className="font-display mt-10 text-[3.5rem] font-bold tracking-tighter text-balance text-slate-900 md:text-7xl lg:leading-[1]">
                Real results. <br className="hidden md:block"/> No ambiguity.
              </h1>
              <p className="mt-8 max-w-2xl mx-auto text-lg font-normal leading-relaxed text-slate-500 md:text-xl">
                Three representative placeholder stories, shaped to feel like real delivery
                scenarios across ecommerce, SaaS, and financial operations.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="container max-w-5xl">
            <StaggerList className="space-y-16">
              {caseStudies.map((study, index) => {
                const Icon = study.icon

                return (
                  <StaggerItem key={study.company}>
                    <Card
                      className={cn(
                        "overflow-hidden rounded-[32px] border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_24px_80px_-12px_rgb(0,0,0,0.08)]",
                        index % 2 !== 0 ? "lg:mr-8" : "lg:ml-8" // Asymmetrical staggering
                      )}
                    >
                      <div className="grid gap-0 lg:grid-cols-[1fr_1.1fr]">
                        <div className={`bg-gradient-to-br ${study.accent} p-10 md:p-14`}>
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm border border-slate-100">
                              <Icon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                                Case Study {index + 1}
                              </p>
                              <p className="mt-1 text-[13px] font-medium text-slate-600">{study.industry}</p>
                            </div>
                          </div>

                          <div className="mt-12 space-y-6">
                            <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                              {study.company}
                            </h2>
                            <p className="text-xl font-semibold text-blue-600">{study.outcome}</p>
                            <p className="text-[17px] font-normal leading-relaxed text-slate-600 italic">
                              {study.quote}
                            </p>
                          </div>
                        </div>

                        <div className="p-10 md:p-14 border-l border-slate-100 bg-white">
                          <CardHeader className="p-0 mb-8">
                            <CardTitle className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                              The Challenge
                            </CardTitle>
                            <CardDescription className="text-base font-medium leading-relaxed text-slate-900">
                              {study.problem}
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-10 p-0">
                            <div className="space-y-3">
                              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                The Solution
                              </p>
                              <p className="text-[15px] font-normal leading-relaxed text-slate-600">{study.solution}</p>
                            </div>

                            <div className="rounded-[20px] border border-slate-200/50 bg-slate-50 p-8">
                              <div className="mb-6 flex items-center gap-3">
                                <Database className="h-4 w-4 text-blue-600" />
                                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-900">
                                  Metrics snapshot
                                </p>
                              </div>

                              <div className="space-y-5">
                                {study.metrics.map((metric) => (
                                  <div key={metric.label} className="space-y-3">
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                      <span className="font-medium text-slate-500">{metric.label}</span>
                                      <span className="font-bold text-slate-900">{metric.value}</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/60">
                                      <div
                                        className="h-full rounded-full bg-blue-600"
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

        <section className="pb-24 md:pb-32">
          <div className="container max-w-5xl">
            <FadeIn className="rounded-[32px] bg-slate-900 px-10 py-16 text-center text-white shadow-[0_32px_64px_-16px_rgb(0,0,0,0.2)] md:px-16 md:py-24">
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-6">
                Next Steps
              </p>
              <h2 className="font-display max-w-3xl mx-auto text-4xl font-bold tracking-tight text-balance md:text-5xl">
                Turn placeholder stories into your next client win.
              </h2>
              <p className="mt-8 max-w-2xl mx-auto text-lg font-normal leading-relaxed text-slate-400">
                Bring us the messy brief, the migration deadline, or the compliance file backlog.
                We'll turn it into a clean delivery workflow your team can stand behind.
              </p>
              <div className="mt-12">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full bg-blue-600 px-10 text-[15px] font-medium text-white shadow-[0_8px_16px_rgb(59,130,246,0.2)] transition-transform hover:-translate-y-0.5 hover:bg-blue-700"
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
