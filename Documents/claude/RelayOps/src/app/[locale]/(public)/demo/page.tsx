import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Coins,
  FileStack,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wrench,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MotionProvider,
  FadeIn,
  SlideUp,
  StaggerList,
  StaggerItem,
} from '@/components/ui/motion'
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'
import { cn } from '@/lib/utils/cn'

export const metadata = createPublicMetadata(publicPageDefinitions.demo)

type DemoStep = {
  value: string
  title: string
  role: 'Partner' | 'Admin' | 'Worker'
  icon: typeof ClipboardList
  summary: string
  outcome: string
  accent: string
  detailTitle: string
  detailBody: string
  bullets: string[]
  preview: {
    eyebrow: string
    title: string
    subtitle: string
    stats: Array<{ label: string; value: string }>
    panels: Array<{ label: string; value: string }>
  }
}

const demoSteps: DemoStep[] = [
  {
    value: 'partner-intake',
    title: 'Partner Submits Ticket',
    role: 'Partner',
    icon: ClipboardList,
    summary:
      'A partner captures the brief, data source, acceptance criteria, and expected delivery in a single structured intake.',
    outcome: 'The request becomes a scoping-ready job instead of an email thread.',
    accent: 'from-blue-500/14 via-teal-400/8 to-transparent',
    detailTitle: 'Structured intake replaces messy back-and-forth',
    detailBody:
      'The partner flow turns an unclear cleanup request into a scoped ticket with context, files, and approval criteria already attached.',
    bullets: [
      'Partner answers the intake checklist and uploads source context.',
      'The request is normalized into one job record with visible next steps.',
      'Admin receives a clean brief instead of reconstructing intent manually.',
    ],
    preview: {
      eyebrow: 'Mock Dashboard Preview',
      title: 'Partner intake workspace',
      subtitle: 'Step-by-step brief capture with attached acceptance criteria.',
      stats: [
        { label: 'Status', value: 'Submitted' },
        { label: 'Scope', value: '3 source files' },
        { label: 'Target SLA', value: '2 business days' },
      ],
      panels: [
        { label: 'Problem summary', value: 'Duplicate CRM contacts and mismatched lifecycle stages.' },
        { label: 'Acceptance', value: 'Import-ready CSV, mapped fields, and issue notes.' },
        { label: 'Attachments', value: 'hubspot.csv, lifecycle-map.xlsx, notes.txt' },
      ],
    },
  },
  {
    value: 'admin-pricing',
    title: 'Admin Scopes and Prices',
    role: 'Admin',
    icon: Coins,
    summary:
      'Ops reviews the brief, locks scope, applies pricing, and moves the job into a predictable delivery lane.',
    outcome: 'Pricing, SLA, and scope are explicit before execution starts.',
    accent: 'from-slate-400/18 via-blue-400/8 to-transparent',
    detailTitle: 'The admin view converts requests into executable work',
    detailBody:
      'Admins validate fit, identify the right pricing tier, and turn the intake into a delivery package with commercial clarity.',
    bullets: [
      'Review completeness and confirm the request is within the supported workflow.',
      'Lock the scope, price the work, and communicate the exact turnaround.',
      'Queue the job with a stable handoff package for the worker.',
    ],
    preview: {
      eyebrow: 'Mock Dashboard Preview',
      title: 'Admin pricing board',
      subtitle: 'Scoping controls, pricing decision, and queued execution summary.',
      stats: [
        { label: 'Tier', value: 'Standard' },
        { label: 'Quoted', value: '$499' },
        { label: 'Queue slot', value: 'Next available' },
      ],
      panels: [
        { label: 'Scope review', value: 'Validated source quality and counted rows across 3 exports.' },
        { label: 'Commercial terms', value: 'One revision included, delivery by Tuesday 5 PM.' },
        { label: 'Worker handoff', value: 'Normalization rules and field mapping attached.' },
      ],
    },
  },
  {
    value: 'worker-fulfillment',
    title: 'Worker Executes the Job',
    role: 'Worker',
    icon: Wrench,
    summary:
      'The assigned operator works from a clear brief, processes the dataset, and records output against the agreed acceptance criteria.',
    outcome: 'Execution happens against the same spec the partner approved.',
    accent: 'from-teal-500/16 via-blue-400/8 to-transparent',
    detailTitle: 'Execution is guided by a fixed delivery contract',
    detailBody:
      'Workers see what to clean, how to structure the output, and what proof is needed before the job can move to review.',
    bullets: [
      'Use the scoped brief, mapped fields, and issue notes as the execution baseline.',
      'Track progress against delivery checkpoints rather than ad hoc interpretation.',
      'Prepare the cleaned output and a concise delivery summary for approval.',
    ],
    preview: {
      eyebrow: 'Mock Dashboard Preview',
      title: 'Worker delivery console',
      subtitle: 'Queued tasks, validation notes, and deliverable packaging in one view.',
      stats: [
        { label: 'Progress', value: '78%' },
        { label: 'Rows cleaned', value: '42,318' },
        { label: 'Exceptions', value: '14 flagged' },
      ],
      panels: [
        { label: 'Current task', value: 'Normalize phone, lifecycle, and owner values across exports.' },
        { label: 'Quality notes', value: '14 rows flagged for missing company domain.' },
        { label: 'Deliverable set', value: 'cleaned-master.csv + mapping-notes.md' },
      ],
    },
  },
  {
    value: 'partner-approval',
    title: 'Partner Reviews Delivery',
    role: 'Partner',
    icon: BadgeCheck,
    summary:
      'The partner reviews the delivered package, validates the outcome, and closes the job or requests a revision with context.',
    outcome: 'Acceptance is auditable and tied to the original delivery criteria.',
    accent: 'from-slate-300/18 via-teal-400/8 to-transparent',
    detailTitle: 'Delivery review closes the loop with visible proof',
    detailBody:
      'The final handoff makes it easy to compare the delivered output against the approved scope and decide whether to accept or revise.',
    bullets: [
      'Partner reviews the cleaned file, summary notes, and flagged exceptions.',
      'Approval moves the job to completed with a clean handoff record.',
      'If needed, revision feedback is specific and attached to the same workflow.',
    ],
    preview: {
      eyebrow: 'Mock Dashboard Preview',
      title: 'Partner acceptance screen',
      subtitle: 'Delivery package, review checklist, and approval action in context.',
      stats: [
        { label: 'Delivery status', value: 'Submitted for review' },
        { label: 'Artifacts', value: '2 files' },
        { label: 'Decision window', value: '24 hours' },
      ],
      panels: [
        { label: 'Delivery summary', value: 'Deduped contacts, normalized fields, and exception log attached.' },
        { label: 'Review checklist', value: 'Schema verified, row count matched, acceptance criteria satisfied.' },
        { label: 'Decision', value: 'Approve delivery or return targeted revision notes.' },
      ],
    },
  },
]

const roleStyles = {
  Partner: 'border-blue-200 bg-blue-50 text-blue-700',
  Admin: 'border-slate-300 bg-slate-100 text-slate-700',
  Worker: 'border-teal-200 bg-teal-50 text-teal-700',
} as const

const roleIcons = {
  Partner: UserRound,
  Admin: ShieldCheck,
  Worker: Sparkles,
} as const

function MockDashboardPreview({ step }: { step: DemoStep }) {
  return (
    <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-4 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.24)]">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
            {step.preview.eyebrow}
          </p>
          <p className="mt-2 text-lg font-bold tracking-[-0.03em] text-zinc-950">
            {step.preview.title}
          </p>
          <p className="mt-1 text-sm text-zinc-600">{step.preview.subtitle}</p>
        </div>
        <div className="hidden rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-right md:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Flow Stage
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-950">{step.title}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {step.preview.stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              {stat.label}
            </p>
            <p className="mt-2 text-sm font-bold text-zinc-950">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {step.preview.panels.map((panel) => (
          <div
            key={panel.label}
            className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-zinc-50 to-white px-4 py-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              {panel.label}
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-zinc-200">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-500 to-teal-400" />
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-700">{panel.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DemoPage() {
  return (
    <MotionProvider>
      <div className="bg-[#f8fafc]">
        <section className="relative overflow-hidden border-b border-slate-200 bg-[#f8fafc] py-20 md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(20,184,166,0.1),transparent_24%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.11)_1px,transparent_1px)] bg-[size:120px_120px] opacity-25" />

          <div className="container relative">
            <FadeIn className="max-w-4xl">
              <Badge className="rounded-full border border-blue-200 bg-white px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-700 hover:bg-white">
                Interactive Product Demo
              </Badge>
              <h1 className="font-display mt-8 text-5xl font-bold tracking-[-0.08em] text-balance text-slate-950 md:text-7xl lg:leading-[0.94]">
                Show the RelayOps workflow without opening the real dashboard.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
                Walk prospects through the exact sequence from intake to approval using a lightweight,
                public-facing demo built from styled interface placeholders.
              </p>
            </FadeIn>

            <StaggerList className="mt-12 grid gap-4 md:grid-cols-4">
              {demoSteps.map((step, index) => {
                const Icon = step.icon

                return (
                  <StaggerItem
                    key={step.value}
                    className={cn(
                      `rounded-[1.75rem] border border-slate-200 bg-gradient-to-br ${step.accent} px-5 py-5 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-1`
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0B1220] text-white shadow-[0_16px_34px_-20px_rgba(11,18,32,0.72)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                        Step {index + 1}
                      </span>
                    </div>
                    <p className="font-display mt-5 text-lg font-bold tracking-[-0.03em] text-slate-950">
                      {step.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.summary}</p>
                  </StaggerItem>
                )
              })}
            </StaggerList>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container">
            <Tabs defaultValue={demoSteps[0].value} className="space-y-8">
              <FadeIn>
                <TabsList className="grid h-auto grid-cols-1 gap-2 rounded-[1.5rem] bg-[#E8EEF7] p-2 md:grid-cols-4">
                  {demoSteps.map((step) => (
                    <TabsTrigger
                      key={step.value}
                      value={step.value}
                      className="min-h-[64px] rounded-[1.1rem] border border-transparent px-4 py-4 text-left data-[state=active]:border-slate-200 data-[state=active]:bg-white data-[state=active]:shadow-[0_18px_48px_-34px_rgba(15,23,42,0.18)] transition-all duration-300"
                    >
                      <span className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                          {step.role}
                        </span>
                        <span className="text-sm font-semibold text-zinc-950">{step.title}</span>
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </FadeIn>

              {demoSteps.map((step) => {
                const RoleIcon = roleIcons[step.role]

                return (
                  <TabsContent key={step.value} value={step.value} className="focus-visible:outline-none">
                    <SlideUp className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.18)]">
                      <div className="grid gap-0 lg:grid-cols-[0.88fr_1.12fr]">
                        <div className={`bg-gradient-to-br ${step.accent} p-8 md:p-10`}>
                          <div className="flex items-center gap-3">
                            <Badge
                              className={cn(
                                `rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em]`,
                                roleStyles[step.role]
                              )}
                            >
                              <RoleIcon className="mr-2 h-3.5 w-3.5" />
                              {step.role}
                            </Badge>
                          </div>

                          <div className="mt-8 space-y-4">
                            <h2 className="font-display text-3xl font-bold tracking-[-0.05em] text-zinc-950 md:text-4xl">
                              {step.detailTitle}
                            </h2>
                            <p className="text-base leading-7 text-zinc-700">{step.detailBody}</p>
                            <p className="text-lg font-semibold text-zinc-900">{step.outcome}</p>
                          </div>

                          <div className="mt-8 rounded-[1.5rem] border border-zinc-200 bg-white/80 p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                              What happens in this step
                            </p>
                            <ul className="mt-4 space-y-3">
                              {step.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3 text-sm leading-6 text-zinc-700">
                                  <FileStack className="mt-0.5 h-4 w-4 flex-none text-zinc-500" />
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <CardContent className="p-8 md:p-10">
                          <CardHeader className="p-0">
                            <CardTitle className="text-xl font-bold tracking-[-0.04em] text-zinc-950">
                              Mock dashboard preview
                            </CardTitle>
                            <CardDescription className="text-base leading-7 text-zinc-600">
                              A CSS-only interface placeholder that mirrors the information a buyer
                              needs to understand at this stage of the workflow.
                            </CardDescription>
                          </CardHeader>

                          <div className="mt-8">
                            <MockDashboardPreview step={step} />
                          </div>
                        </CardContent>
                      </div>
                    </SlideUp>
                  </TabsContent>
                )
              })}
            </Tabs>
          </div>
        </section>

        <section className="pb-20 md:pb-28">
          <div className="container">
            <FadeIn className="rounded-[2rem] border border-[#0B1220] bg-[#0B1220] px-8 py-10 text-white shadow-[0_30px_90px_-48px_rgba(11,18,32,0.82)] md:px-12">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
                Turn the walkthrough into pipeline
              </p>
              <h2 className="font-display mt-5 text-4xl font-bold tracking-[-0.06em] text-balance md:text-5xl">
                Use the demo to explain the workflow, then open the partner application.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
                The public demo gives prospects enough operational clarity to understand the model
                before they ever touch the live product.
              </p>
              <div className="mt-8">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full border border-blue-500/30 bg-blue-600 px-7 text-white shadow-[0_24px_50px_-24px_rgba(59,130,246,0.6)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700"
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
