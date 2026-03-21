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

const valueProps = [
  {
    icon: Shield,
    title: 'White-label by default',
    description:
      'Deliver clean CRM imports under your agency name. RelayOps stays invisible while you keep the client relationship and margin.',
  },
  {
    icon: Clock,
    title: '48-hour promise you can sell',
    description:
      'Scope lock, QA, and delivery are designed around a 2-day SLA so your team stops absorbing CSV cleanup as unplanned work.',
  },
  {
    icon: BarChart3,
    title: 'Predictable margin on every brief',
    description:
      'Fixed-scope intake and admin review keep data prep from becoming open-ended consulting disguised as operations.',
  },
  {
    icon: CheckCircle,
    title: 'QA before client handoff',
    description:
      'Each deliverable moves through review before it reaches your portal, so your PMs are not doing the final cleanup pass.',
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

const assuranceRows = [
  'Scope locked before production starts',
  'QA review before the handoff lands in your portal',
  'Secure data handling built for agency delivery teams',
]

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-white">
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.34),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(96,165,250,0.22),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />

        <div className="container relative py-20 md:py-28 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-100 shadow-[0_28px_80px_-48px_rgba(59,130,246,0.75)] backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Revenue ops fulfillment for agency teams
              </div>

              <h1 className="mt-8 max-w-4xl text-5xl font-black tracking-[-0.08em] text-balance text-white md:text-7xl lg:text-[5.4rem] lg:leading-[0.94]">
                Turn CRM cleanup into a{' '}
                <span className="bg-gradient-to-r from-blue-300 via-white to-cyan-200 bg-clip-text text-transparent">
                  48-hour promise
                </span>{' '}
                your agency can actually keep.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
                RelayOps gives RevOps agencies a commercial-grade fulfillment layer for CRM data
                cleanup, QA, and white-label delivery. You keep the client. We keep the work
                scoped, reviewed, and moving.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full border border-blue-400/50 bg-blue-500 px-7 text-white shadow-[0_24px_44px_-20px_rgba(59,130,246,0.72)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-400 hover:shadow-[0_34px_55px_-18px_rgba(59,130,246,0.82)]"
                >
                  <Link href="/request-access">
                    Request Access
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="rounded-full border border-white/15 bg-white/5 px-7 text-white shadow-[0_18px_40px_-24px_rgba(24,24,27,0.8)] transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10 hover:shadow-[0_28px_44px_-22px_rgba(24,24,27,0.95)]"
                >
                  <Link href="/how-it-works">
                    See the workflow
                    <ArrowRight className="h-4 w-4 opacity-70" />
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-zinc-300">
                {trustSignals.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
                  >
                    <CheckCircle className="h-4 w-4 text-blue-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {assuranceRows.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-5 text-sm leading-6 text-zinc-300 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.85)] backdrop-blur-sm"
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
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-[0_40px_90px_-45px_rgba(59,130,246,0.45)] backdrop-blur-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_42%)]" />
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">
                        Delivery control room
                      </p>
                      <p className="mt-2 text-sm text-zinc-300">
                        The promise your account team makes is the operating system we optimize for.
                      </p>
                    </div>
                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      Live SLA path
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.6rem] border border-white/10 bg-zinc-950/55 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                        Scope response
                      </p>
                      <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
                        4 hours
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Admin review locks the brief before a worker ever touches it.
                      </p>
                    </div>
                    <div className="rounded-[1.6rem] border border-white/10 bg-zinc-950/55 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                        Delivery standard
                      </p>
                      <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
                        2 days
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Review-ready handoff built for agencies promising speed without rework.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-blue-500/14 to-white/5 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
                      What stays under control
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        'Scope locked before execution',
                        'Worker output reviewed against acceptance criteria',
                        'Delivery notes ready for partner handoff',
                        'No client-facing RelayOps branding',
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <span className="text-sm text-zinc-200">{item}</span>
                          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
                            Included
                          </span>
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
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
              Customer value
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.06em] text-zinc-950 text-balance md:text-5xl">
              Built to increase agency margin without adding more PM overhead.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600">
              RelayOps sells certainty, not generic cleanup labor. Each section of the delivery
              system exists to help your team quote faster, deliver cleaner, and protect margin.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {valueProps.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  data-reveal
                  className="rounded-[2rem] border border-zinc-200 bg-white p-6 opacity-0 translate-y-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.32)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_65px_-34px_rgba(59,130,246,0.18)] motion-reduce:translate-y-0 motion-reduce:opacity-100"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-zinc-950">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-zinc-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-blue-50 py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_34%)]" />
        <div className="container relative">
          <div
            data-reveal
            className="max-w-2xl opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
              Workflow
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.06em] text-zinc-950 text-balance md:text-5xl">
              Partner to delivery, with a clean handoff at every stage.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
              The homepage should sell operational control, not just labor. This flow makes the
              commercial story visible in one scan.
            </p>
          </div>

          <div className="relative mt-14">
            <div className="pointer-events-none absolute left-14 right-14 top-10 hidden h-px bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 xl:block" />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {workflowSteps.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    data-reveal
                    className="relative rounded-[2rem] border border-blue-100 bg-white p-6 opacity-0 translate-y-6 shadow-[0_18px_50px_-34px_rgba(59,130,246,0.18)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_60px_-30px_rgba(59,130,246,0.22)] motion-reduce:translate-y-0 motion-reduce:opacity-100"
                    style={{ transitionDelay: `${index * 110}ms` }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-black tracking-[0.22em] text-blue-300">
                        {item.step}
                      </span>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-[0_18px_38px_-22px_rgba(59,130,246,0.55)]">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-zinc-950">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-zinc-600">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-zinc-950 py-20 text-white md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(96,165,250,0.16),transparent_28%)]" />
        <div className="container relative">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">
                Social proof
              </p>
              <h2 className="mt-5 text-4xl font-black tracking-[-0.06em] text-white text-balance md:text-5xl">
                Proof that feels commercial, not aspirational.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-300">
                This section exists to answer the buyer&apos;s real question: can RelayOps make my
                delivery promise safer than keeping cleanup work in-house?
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {proofMetrics.map((item, index) => (
                  <div
                    key={item.label}
                    data-reveal
                    className="rounded-[1.6rem] border border-white/10 bg-white/5 px-5 py-5 opacity-0 translate-y-6 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.85)] backdrop-blur-sm transition-all duration-300 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <p className="text-4xl font-black tracking-[-0.06em] text-white">{item.value}</p>
                    <p className="mt-2 text-sm text-zinc-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all delay-150 duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <div className="rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.9)] backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">
                      What partners say
                    </p>
                    <p className="mt-2 text-sm text-zinc-400">
                      Placeholder proof block ready for real testimonials.
                    </p>
                  </div>
                  <div className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-100">
                    Testimonial slot
                  </div>
                </div>

                <blockquote className="mt-8 text-2xl font-semibold leading-10 tracking-[-0.03em] text-white">
                  “RelayOps lets us promise fast CRM delivery without pulling senior operators into
                  another week of spreadsheet cleanup.”
                </blockquote>

                <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-zinc-950/45 px-5 py-5 text-sm leading-6 text-zinc-300">
                  Placeholder testimonial for launch. Swap in named partner proof when approved, but
                  the module structure, hierarchy, and metrics block are ready now.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container">
          <div
            data-reveal
            className="rounded-[2.25rem] border border-blue-200 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 px-8 py-10 text-center text-white opacity-0 translate-y-6 shadow-[0_30px_80px_-48px_rgba(59,130,246,0.55)] transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 md:px-12 md:py-14"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-50">
              <Users className="h-3.5 w-3.5" />
              Request access in under 2 minutes
            </div>
            <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-black tracking-[-0.06em] text-balance md:text-5xl">
              Give your agency a delivery engine that sells certainty instead of cleanup hours.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-50/90">
              If the homepage does its job, the next step should be obvious: open the application,
              lock the fit, and start quoting work with more confidence.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full border border-white/30 bg-white px-7 text-blue-700 shadow-[0_20px_42px_-24px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50 hover:text-blue-800"
              >
                <Link href="/request-access">
                  Request Access
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="rounded-full border border-white/25 bg-transparent px-7 text-white shadow-[0_18px_40px_-24px_rgba(24,24,27,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-white/10"
              >
                <Link href="/pilot-sample">
                  <Lock className="mr-2 h-4 w-4" />
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
