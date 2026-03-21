import Link from 'next/link'
import Script from 'next/script'
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Clock,
  FileCheck,
  Lock,
  Shield,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RevealObserver } from '@/components/ui/reveal-observer'
import {
  buildOrganizationJsonLd,
  createPublicMetadata,
  publicPageDefinitions,
} from '@/lib/seo'

export const metadata = createPublicMetadata(publicPageDefinitions.landing)

const trustSignals = ['2-day SLA', '635 tests', 'SOC2-ready', 'White-label delivery']

const deliveryBoardStats = [
  {
    label: 'Scope response',
    value: '4h',
    detail: 'Brief checked and locked before execution begins.',
  },
  {
    label: 'Handoff quality',
    value: 'QA gated',
    detail: 'Every delivery is reviewed before it reaches your portal.',
  },
]

const deliveryBoardRows = [
  {
    stage: 'Intake',
    owner: 'Partner',
    note: 'Files, constraints, and acceptance criteria verified',
    status: 'Locked',
  },
  {
    stage: 'Production',
    owner: 'Admin',
    note: 'Scope, turnaround, and QA path confirmed',
    status: 'On track',
  },
  {
    stage: 'Delivery',
    owner: 'QA team',
    note: 'Review-ready package prepared for agency handoff',
    status: 'Ready',
  },
]

const valueProps = [
  {
    icon: Shield,
    title: 'White-label by default',
    description:
      'RelayOps disappears behind your agency brand, so the client relationship, margin, and trust stay with your team.',
  },
  {
    icon: Clock,
    title: 'A 48-hour promise with teeth',
    description:
      'Turnaround is anchored to scope lock and QA, not hope. That makes the SLA sellable instead of risky.',
  },
  {
    icon: BarChart3,
    title: 'Margin stays visible',
    description:
      'Fixed-scope intake keeps cleanup from mutating into open-ended consulting work your PM team has to absorb.',
  },
  {
    icon: CheckCircle,
    title: 'Review-ready before handoff',
    description:
      'Your operators stop acting as the final QA layer. RelayOps sends work back in client-safe condition.',
  },
]

const workflowSteps = [
  {
    step: '01',
    title: 'Partner Intake',
    description:
      'Your team sends the brief, source files, and success criteria through a fixed intake so nothing ambiguous enters production.',
    icon: Users,
  },
  {
    step: '02',
    title: 'Admin Scope Lock',
    description:
      'RelayOps scopes the ticket, confirms constraints, and locks the delivery target before work starts.',
    icon: FileCheck,
  },
  {
    step: '03',
    title: 'Worker QA',
    description:
      'Workers execute the cleanup while admin QA checks mapping, formatting, and delivery notes against the approved scope.',
    icon: Zap,
  },
  {
    step: '04',
    title: 'Delivery Ready',
    description:
      'You receive a review-ready handoff with white-label output, revision notes, and a clean delivery path back to your client.',
    icon: CheckCircle,
  },
]

const proofMetrics = [
  { value: '1,240+', label: 'Tickets Processed' },
  { value: '46h', label: 'Average Delivery Time' },
  { value: '98%', label: 'Partner Satisfaction' },
]

const proofChecks = [
  'Scope locked before production starts',
  'QA review before the handoff lands in your portal',
  'Secure data handling built for agency delivery teams',
]

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-[#f8fafc] text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[#f8fafc]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_32%),radial-gradient(circle_at_82%_14%,rgba(20,184,166,0.12),transparent_22%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.11)_1px,transparent_1px)] bg-[size:120px_120px] opacity-30" />

        <div className="container relative py-20 md:py-28 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.18)]">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700">
                  Operational confidence for RevOps agencies
                </span>
              </div>

              <h1 className="font-display mt-8 max-w-5xl text-5xl font-bold tracking-[-0.08em] text-balance text-slate-950 md:text-7xl lg:text-[5.3rem] lg:leading-[0.92]">
                Build a{' '}
                <span className="text-blue-600">48-hour delivery promise</span> on a system your
                clients never see.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                RelayOps gives agencies a white-label production floor for CRM cleanup, QA, and
                delivery handoff. You keep the relationship and the commercial upside. We keep the
                work scoped, reviewed, and moving.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full border border-blue-600/30 bg-blue-600 px-7 text-white shadow-[0_22px_44px_-22px_rgba(59,130,246,0.55)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-[0_28px_52px_-20px_rgba(37,99,235,0.62)]"
                >
                  <Link href="/request-access">
                    Request Access
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-slate-300 bg-white px-7 text-slate-900 shadow-[0_18px_42px_-28px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-400 hover:bg-slate-50"
                >
                  <Link href="/how-it-works">
                    See the workflow
                    <ArrowRight className="h-4 w-4 opacity-70" aria-hidden="true" />
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
                {trustSignals.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.16)]"
                  >
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {proofChecks.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.6rem] border border-slate-200 bg-white px-5 py-5 text-sm leading-6 text-slate-600 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.14)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all delay-150 duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <div className="relative overflow-hidden rounded-[2rem] border border-[#0B1220] bg-[#0B1220] p-8 text-white shadow-[0_36px_90px_-52px_rgba(11,18,32,0.82)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_42%),radial-gradient(circle_at_85%_15%,rgba(20,184,166,0.14),transparent_26%)]" />
                <div className="relative space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">
                        Live delivery board
                      </p>
                      <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                        The commercial promise your account team sells is the operating system we
                        optimize for.
                      </p>
                    </div>
                    <div className="rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-200">
                      2-day SLA path
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {deliveryBoardStats.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
                      >
                        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-3 font-display text-4xl font-bold tracking-[-0.05em] text-white">
                          {item.value}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">
                      Delivery sequence
                    </p>
                    <div className="mt-4 space-y-3">
                      {deliveryBoardRows.map((row) => (
                        <div
                          key={row.stage}
                          className="grid gap-3 rounded-[1.25rem] border border-white/10 bg-[#101a2d] px-4 py-4 md:grid-cols-[0.72fr_1.08fr_auto]"
                        >
                          <div>
                            <p className="font-display text-lg font-semibold tracking-[-0.03em] text-white">
                              {row.stage}
                            </p>
                            <p className="font-mono mt-1 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                              {row.owner}
                            </p>
                          </div>
                          <p className="text-sm leading-6 text-slate-300">{row.note}</p>
                          <div className="inline-flex h-fit items-center rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-200">
                            {row.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Script id="relayops-organization-schema" type="application/ld+json">
        {JSON.stringify(buildOrganizationJsonLd())}
      </Script>

      <section className="bg-white py-20 md:py-28">
        <div className="container">
          <div
            data-reveal
            className="max-w-2xl opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
              Customer value
            </p>
            <h2 className="font-display mt-5 text-4xl font-bold tracking-[-0.06em] text-slate-950 text-balance md:text-5xl">
              Built for agencies selling certainty, not cleanup hours.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              RelayOps should feel like an operating partner with commercial discipline, not a
              generic back-office vendor. Each module on the homepage reinforces that promise.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {valueProps.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  data-reveal
                  className="rounded-[1.9rem] border border-slate-200 bg-white p-6 opacity-0 translate-y-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.18)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_60px_-30px_rgba(59,130,246,0.16)] motion-reduce:translate-y-0 motion-reduce:opacity-100"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Signal {index + 1}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-slate-200 bg-slate-50 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="font-display mt-6 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-slate-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#E8EEF7] py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_32%)]" />
        <div className="container relative">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
                Workflow
              </p>
              <h2 className="font-display mt-5 text-4xl font-bold tracking-[-0.06em] text-slate-950 text-balance md:text-5xl">
                Partner to delivery, with a clean handoff at every stage.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                The workflow has to read in one scan. Buyers should understand where ambiguity gets
                removed and where quality gets enforced.
              </p>

              <div className="mt-8 rounded-[1.85rem] border border-slate-200 bg-[#0B1220] px-6 py-6 text-white shadow-[0_28px_70px_-44px_rgba(11,18,32,0.7)]">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-teal-200">
                  Commercial effect
                </p>
                <p className="mt-4 text-base leading-7 text-slate-300">
                  Scope lock protects margin. Worker QA protects delivery quality. White-label
                  handoff protects the agency relationship.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {workflowSteps.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    data-reveal
                    className="relative rounded-[1.9rem] border border-slate-200 bg-white p-6 opacity-0 translate-y-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.16)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_60px_-30px_rgba(59,130,246,0.16)] motion-reduce:translate-y-0 motion-reduce:opacity-100"
                    style={{ transitionDelay: `${index * 110}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="font-mono text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">
                          {item.step}
                        </span>
                        <h3 className="font-display mt-4 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-4 text-base leading-7 text-slate-600">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
                Social proof
              </p>
              <h2 className="font-display mt-5 text-4xl font-bold tracking-[-0.06em] text-slate-950 text-balance md:text-5xl">
                Proof that feels commercial, not aspirational.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Buyers need to believe RelayOps makes delivery safer than keeping cleanup work
                in-house. The proof stack answers that in metrics and in voice.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {proofMetrics.map((item, index) => (
                  <div
                    key={item.label}
                    data-reveal
                    className="rounded-[1.6rem] border border-slate-200 bg-[#f8fafc] px-5 py-5 opacity-0 translate-y-6 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.14)] transition-all duration-300 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <p className="font-display text-4xl font-bold tracking-[-0.06em] text-slate-950">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all delay-150 duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <div className="rounded-[2rem] border border-[#0B1220] bg-[#0B1220] p-8 text-white shadow-[0_30px_80px_-48px_rgba(11,18,32,0.88)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">
                      What partners say
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Placeholder proof block ready for real testimonials.
                    </p>
                  </div>
                  <div className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-100">
                    Testimonial slot
                  </div>
                </div>

                <blockquote className="font-display mt-8 text-2xl font-semibold leading-10 tracking-[-0.03em] text-white">
                  “RelayOps lets us promise fast CRM delivery without pulling senior operators into
                  another week of spreadsheet cleanup.”
                </blockquote>

                <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-5 text-sm leading-6 text-slate-300">
                  Placeholder testimonial for launch. Swap in named partner proof when approved, but
                  the module structure, hierarchy, and metrics block are ready now.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0B1220] py-20 text-white md:py-28">
        <div className="container">
          <div
            data-reveal
            className="rounded-[2.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(20,184,166,0.08))] px-8 py-10 opacity-0 translate-y-6 shadow-[0_30px_80px_-48px_rgba(11,18,32,0.72)] transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 md:px-12 md:py-14"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2">
              <Users className="h-3.5 w-3.5 text-teal-300" />
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">
                Request access in under 2 minutes
              </span>
            </div>
            <h2 className="font-display mt-6 max-w-4xl text-4xl font-bold tracking-[-0.06em] text-balance md:text-5xl">
              Give your agency a delivery engine that sells certainty instead of cleanup hours.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              The next step should be obvious: open the application, confirm fit, and start quoting
              work with more confidence.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full border border-blue-500/30 bg-blue-600 px-7 text-white shadow-[0_18px_38px_-20px_rgba(59,130,246,0.52)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700"
              >
                <Link href="/request-access">
                  Request Access
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/20 bg-transparent px-7 text-white transition-all duration-300 hover:-translate-y-1 hover:border-white/35 hover:bg-white/10"
              >
                <Link href="/pilot-sample">
                  <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                  Preview a pilot deliverable
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <RevealObserver />
    </div>
  )
}
