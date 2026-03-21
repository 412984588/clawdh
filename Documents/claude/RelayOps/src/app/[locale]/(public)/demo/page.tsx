'use client'

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
import { m, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

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
    accent: 'from-blue-500/10 via-blue-400/5 to-transparent',
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
    accent: 'from-slate-400/10 via-slate-300/5 to-transparent',
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
    accent: 'from-teal-500/10 via-teal-400/5 to-transparent',
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
    accent: 'from-blue-100/50 via-white to-transparent',
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
  Partner: 'border-blue-200/60 bg-blue-50/50 text-blue-700',
  Admin: 'border-slate-200/60 bg-slate-50 text-slate-700',
  Worker: 'border-teal-200/60 bg-teal-50/50 text-teal-700',
} as const

const roleIcons = {
  Partner: UserRound,
  Admin: ShieldCheck,
  Worker: Sparkles,
} as const

function MockDashboardPreview({ step }: { step: DemoStep }) {
  return (
    <div className="rounded-[24px] border border-slate-200/60 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {step.preview.eyebrow}
          </p>
          <p className="mt-2 text-lg font-bold tracking-tight text-slate-900">
            {step.preview.title}
          </p>
          <p className="mt-1 text-[13px] text-slate-500">{step.preview.subtitle}</p>
        </div>
        <div className="hidden rounded-[16px] border border-slate-200/60 bg-slate-50 px-4 py-3 text-right md:block">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Flow Stage
          </p>
          <p className="mt-2 text-[13px] font-semibold text-slate-900">{step.title}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {step.preview.stats.map((stat) => (
          <div key={stat.label} className="rounded-[16px] border border-slate-200/60 bg-slate-50 px-5 py-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {stat.label}
            </p>
            <p className="mt-2 text-[15px] font-bold tracking-tight text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {step.preview.panels.map((panel) => (
          <div
            key={panel.label}
            className="rounded-[16px] border border-slate-200/60 bg-gradient-to-r from-slate-50 to-white px-5 py-4"
          >
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {panel.label}
            </p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200/60">
              <div className="h-full w-2/3 rounded-full bg-blue-600" />
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-slate-600">{panel.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DemoTabContent({ step }: { step: DemoStep }) {
  const RoleIcon = roleIcons[step.role]

  return (
    <m.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-[32px] border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <div className="grid gap-0 lg:grid-cols-[1fr_1.2fr]">
        <div className={`bg-gradient-to-br ${step.accent} p-10 md:p-14`}>
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                `rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest shadow-sm`,
                roleStyles[step.role]
              )}
            >
              <RoleIcon className="mr-2 h-3.5 w-3.5" />
              {step.role}
            </Badge>
          </div>

          <div className="mt-10 space-y-5">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {step.detailTitle}
            </h2>
            <p className="text-[15px] font-normal leading-relaxed text-slate-600">{step.detailBody}</p>
            <p className="text-[15px] font-semibold text-slate-900">{step.outcome}</p>
          </div>

          <div className="mt-10 rounded-[24px] border border-slate-200/60 bg-white/60 p-6 backdrop-blur-sm">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              What happens in this step
            </p>
            <ul className="mt-5 space-y-4">
              {step.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-3 text-[14px] leading-relaxed text-slate-700">
                  <FileStack className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <CardContent className="p-10 md:p-14 border-l border-slate-100 bg-white">
          <CardHeader className="p-0 mb-10">
            <CardTitle className="text-[17px] font-bold tracking-tight text-slate-900">
              Mock dashboard preview
            </CardTitle>
            <CardDescription className="mt-3 text-[15px] font-normal leading-relaxed text-slate-500">
              A CSS-only interface placeholder that mirrors the information a buyer
              needs to understand at this stage of the workflow.
            </CardDescription>
          </CardHeader>

          <div>
            <MockDashboardPreview step={step} />
          </div>
        </CardContent>
      </div>
    </m.div>
  )
}

export default function DemoPage() {
  return (
    <MotionProvider>
      <div className="bg-[#FAFAFA] font-sans text-slate-900">
        <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-28">
          <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-hero-glow-animated pointer-events-none" />

          <div className="container relative max-w-4xl text-center">
            <FadeIn>
              <Badge className="rounded-full border border-slate-200/60 bg-white px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-widest text-slate-600 shadow-sm">
                Interactive Product Demo
              </Badge>
              <h1 className="font-display mt-10 text-[3.5rem] font-bold tracking-tighter text-balance text-slate-900 md:text-7xl lg:leading-[1]">
                See the workflow. <br className="hidden md:block"/> No login required.
              </h1>
              <p className="mt-8 max-w-3xl mx-auto text-lg font-normal leading-relaxed text-slate-500 md:text-xl">
                Walk prospects through the exact sequence from intake to approval using a lightweight,
                public-facing demo built from styled interface placeholders.
              </p>
            </FadeIn>

            <StaggerList className="mt-20 grid gap-4 md:grid-cols-4 text-left">
              {demoSteps.map((step, index) => {
                const Icon = step.icon

                return (
                  <StaggerItem
                    key={step.value}
                    className={cn(
                      `group rounded-[24px] border border-slate-200/60 bg-white px-6 py-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 hover:shadow-[0_16px_40px_rgb(0,0,0,0.06)]`,
                      index % 2 !== 0 ? "md:translate-y-4" : ""
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-900 border border-slate-100 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400 transition-colors group-hover:text-blue-600">
                        Step {index + 1}
                      </span>
                    </div>
                    <p className="font-display mt-6 text-[17px] font-bold tracking-tight text-slate-900">
                      {step.title}
                    </p>
                    <p className="mt-3 text-[13px] leading-relaxed text-slate-500">{step.summary}</p>
                  </StaggerItem>
                )
              })}
            </StaggerList>
          </div>
        </section>

        <section className="py-24 md:py-32">
          <div className="container max-w-6xl">
            <Tabs defaultValue={demoSteps[0].value} className="space-y-12">
              <FadeIn>
                <TabsList className="grid h-auto grid-cols-1 gap-3 rounded-[24px] bg-white p-3 border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] md:grid-cols-4">
                  {demoSteps.map((step) => (
                    <TabsTrigger
                      key={step.value}
                      value={step.value}
                      className="min-h-[64px] rounded-[16px] border border-transparent px-5 py-4 text-left data-[state=active]:border-slate-200/60 data-[state=active]:bg-slate-50 data-[state=active]:shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:bg-slate-50 transition-all duration-300"
                    >
                      <span className="flex flex-col gap-1.5">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                          {step.role}
                        </span>
                        <span className="text-[13px] font-bold tracking-tight text-slate-900">{step.title}</span>
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </FadeIn>

              <div className="relative">
                {demoSteps.map((step) => (
                  <TabsContent key={step.value} value={step.value} className="focus-visible:outline-none" forceMount>
                    <AnimatePresence mode="wait">
                      <DemoTabContent step={step} />
                    </AnimatePresence>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        </section>

        <section className="pb-24 md:py-32">
          <div className="container max-w-5xl">
            <FadeIn className="rounded-[32px] bg-slate-900 px-10 py-16 text-center text-white shadow-[0_32px_64px_-16px_rgb(0,0,0,0.2)] md:px-16 md:py-24">
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-6">
                Turn the walkthrough into pipeline
              </p>
              <h2 className="font-display max-w-3xl mx-auto text-4xl font-bold tracking-tight text-balance md:text-5xl">
                Use the demo to explain the workflow, then open the application.
              </h2>
              <p className="mt-8 max-w-2xl mx-auto text-lg font-normal leading-relaxed text-slate-400">
                The public demo gives prospects enough operational clarity to understand the model
                before they ever touch the live product.
              </p>
              <div className="mt-12">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full bg-blue-600 px-10 text-[15px] font-medium text-white shadow-[0_8px_16px_rgb(59,130,246,0.2)] transition-all duration-300 hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-500 hover:shadow-[0_12px_24px_rgb(59,130,246,0.3)]"
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
