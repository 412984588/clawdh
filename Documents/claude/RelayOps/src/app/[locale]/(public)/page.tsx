import Link from 'next/link'
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
import {
  MotionProvider,
  FadeIn,
  SlideUp,
  StaggerList,
  StaggerItem,
} from '@/components/ui/motion'
import { Counter } from '@/components/ui/counter'
import {
  buildOrganizationJsonLd,
  createPublicMetadata,
  publicPageDefinitions,
} from '@/lib/seo'
import { cn } from '@/lib/utils/cn'

export const metadata = createPublicMetadata(publicPageDefinitions.landing)

const trustSignals = ['2-day SLA', '635 tests', 'SOC2-ready', 'White-label delivery']

const deliveryBoardStats = [
  {
    label: 'Scope response',
    value: 4,
    suffix: 'h',
    detail: 'Admin review locks the brief before execution begins.',
  },
  {
    label: 'Handoff quality',
    value: 99.2,
    prefix: 'QA ',
    suffix: '%',
    decimals: 1,
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
    highlight: true,
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
    highlight: true,
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
  { value: 1240, suffix: '+', label: 'Tickets Processed' },
  { value: 46, suffix: 'h', label: 'Average Delivery Time' },
  { value: 98, suffix: '%', label: 'Partner Satisfaction' },
]

export default function LandingPage() {
  return (
    <MotionProvider>
      <div className="flex flex-col bg-[#FAFAFA] text-slate-900 font-sans">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-28 pb-32 md:pt-40 md:pb-48">
          <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="container relative max-w-7xl">
            <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
              <FadeIn>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/50 px-3 py-1.5 shadow-[0_2px_8px_rgb(0,0,0,0.04)] backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-600">
                    Operational confidence for RevOps
                  </span>
                </div>

                <h1 className="font-display mt-8 max-w-5xl text-[3.5rem] font-bold tracking-tighter text-balance text-slate-900 leading-[1.05] md:text-7xl lg:text-[5.5rem]">
                  Build a{' '}
                  <span className="text-blue-600">48-hour delivery</span> promise.
                </h1>

                <p className="mt-8 max-w-2xl text-lg font-normal leading-relaxed text-slate-500 md:text-xl">
                  RelayOps gives agencies a white-label production floor for CRM cleanup, QA, and
                  delivery handoff. You keep the relationship. We keep the work moving.
                </p>

                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 w-full rounded-full bg-blue-600 px-8 text-[15px] font-medium text-white shadow-[0_8px_16px_rgb(59,130,246,0.2)] transition-all hover:-translate-y-0.5 hover:bg-blue-700 sm:w-auto"
                  >
                    <Link href="/request-access">
                      Request Access
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 w-full rounded-full border-slate-200/80 bg-white px-6 text-[15px] font-medium text-slate-600 shadow-[0_2px_8px_rgb(0,0,0,0.04)] transition-all hover:bg-slate-50 sm:w-auto"
                  >
                    <Link href="/how-it-works">
                      Explore the workflow
                    </Link>
                  </Button>
                </div>

                <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
                  {trustSignals.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-slate-300" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>

              <SlideUp transition={{ delay: 0.15 }} className="relative z-10">
                <div className="relative rounded-[24px] border border-slate-200/50 bg-white p-2 shadow-[0_24px_80px_-12px_rgb(0,0,0,0.08)]">
                  <div className="rounded-[20px] bg-slate-50 p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4 mb-8">
                      <div>
                        <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">
                          Live delivery board
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-900">
                          Real-time SLA tracking
                        </p>
                      </div>
                      <div className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        Active
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {deliveryBoardStats.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm"
                        >
                          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                            {item.label}
                          </p>
                          <p className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900">
                            <Counter
                              end={item.value}
                              prefix={item.prefix}
                              suffix={item.suffix}
                              decimals={item.decimals}
                            />
                          </p>
                          <p className="mt-2 text-xs font-medium text-slate-500">{item.detail}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-4">
                        Delivery sequence
                      </p>
                      <div className="space-y-3">
                        {deliveryBoardRows.map((row) => (
                          <div
                            key={row.stage}
                            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-2 rounded-full bg-blue-500" />
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{row.stage}</p>
                                <p className="text-[11px] font-medium text-slate-500">{row.note}</p>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                              {row.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SlideUp>
            </div>
          </div>
        </section>

        <script
          id="relayops-organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd()) }}
        />

        {/* VALUE PROPS SECTION - Asymmetric Grid */}
        <section className="bg-white py-32 border-y border-slate-100">
          <div className="container max-w-7xl">
            <FadeIn className="max-w-2xl mb-20">
              <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Built for agencies selling certainty, not cleanup hours.
              </h2>
              <p className="mt-6 text-lg font-normal leading-relaxed text-slate-500">
                RelayOps feels like an operating partner with commercial discipline, not a
                generic back-office vendor.
              </p>
            </FadeIn>

            <StaggerList className="grid gap-6 md:grid-cols-3">
              {valueProps.map((item, index) => {
                const Icon = item.icon
                return (
                  <StaggerItem
                    key={item.title}
                    className={cn(
                      'group rounded-[24px] bg-[#FAFAFA] p-8 transition-colors hover:bg-slate-50',
                      item.highlight ? 'md:col-span-2' : 'md:col-span-1'
                    )}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-[0_2px_8px_rgb(0,0,0,0.04)] text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display mt-8 text-2xl font-bold tracking-tight text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-base font-normal leading-relaxed text-slate-500">
                      {item.description}
                    </p>
                  </StaggerItem>
                )
              })}
            </StaggerList>
          </div>
        </section>

        {/* WORKFLOW SECTION - Tight / Asymmetric */}
        <section className="py-32">
          <div className="container max-w-7xl">
            <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <FadeIn>
                <div className="sticky top-32">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-blue-600">
                    Clean Handoff
                  </p>
                  <h2 className="font-display mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                    Partner to delivery.
                  </h2>
                  <p className="mt-6 text-lg font-normal leading-relaxed text-slate-500">
                    Buyers should understand exactly where ambiguity gets
                    removed and where quality gets enforced.
                  </p>
                  
                  <div className="mt-10 max-w-sm rounded-[20px] bg-slate-900 p-8 text-white shadow-[0_20px_40px_-10px_rgb(0,0,0,0.1)]">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">
                      Commercial effect
                    </p>
                    <p className="mt-4 text-[15px] font-normal leading-relaxed text-slate-300">
                      Scope lock protects margin. Worker QA protects delivery quality. White-label
                      handoff protects the agency relationship.
                    </p>
                  </div>
                </div>
              </FadeIn>

              <StaggerList className="flex flex-col gap-4">
                {workflowSteps.map((item) => {
                  return (
                    <StaggerItem
                      key={item.title}
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-start gap-6 rounded-[24px] border border-slate-200/50 bg-white p-8 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
                        item.highlight ? "ring-1 ring-blue-500/20 shadow-sm" : ""
                      )}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-900">
                        <span className="font-mono text-[11px] font-bold">{item.step}</span>
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold tracking-tight text-slate-900">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-[15px] font-normal leading-relaxed text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </StaggerItem>
                  )
                })}
              </StaggerList>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF SECTION */}
        <section className="bg-white py-32 border-t border-slate-100">
          <div className="container max-w-7xl text-center">
            <FadeIn className="mx-auto max-w-3xl">
              <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Proof that feels commercial.
              </h2>
              <p className="mt-6 text-lg font-normal leading-relaxed text-slate-500">
                Buyers need to believe RelayOps makes delivery safer than keeping cleanup work
                in-house. 
              </p>
            </FadeIn>

            <div className="mt-20 grid gap-8 md:grid-cols-3">
              <FadeIn>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <p className="font-display text-6xl font-bold tracking-tighter text-slate-900">
                    <Counter end={1240} suffix="+" />
                  </p>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-slate-400">Tickets Processed</p>
                </div>
              </FadeIn>
              <FadeIn transition={{ delay: 0.1 }}>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <p className="font-display text-6xl font-bold tracking-tighter text-blue-600">
                    <Counter end={46} suffix="h" />
                  </p>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-slate-400">Average Delivery</p>
                </div>
              </FadeIn>
              <FadeIn transition={{ delay: 0.2 }}>
                <div className="flex flex-col items-center justify-center space-y-4">
                  <p className="font-display text-6xl font-bold tracking-tighter text-slate-900">
                    <Counter end={98} suffix="%" />
                  </p>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-slate-400">Partner Satisfaction</p>
                </div>
              </FadeIn>
            </div>

            <SlideUp transition={{ delay: 0.3 }} className="mx-auto mt-24 max-w-4xl">
              <div className="rounded-[32px] bg-[#FAFAFA] p-10 md:p-16 text-left">
                <blockquote className="font-display text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl">
                  “RelayOps lets us promise fast CRM delivery without pulling senior operators into
                  another week of spreadsheet cleanup.”
                </blockquote>
                <div className="mt-10 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-200" />
                  <div>
                    <p className="text-[15px] font-semibold text-slate-900">Partner Name</p>
                    <p className="text-[13px] text-slate-500">RevOps Agency Director</p>
                  </div>
                </div>
              </div>
            </SlideUp>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32">
          <div className="container max-w-5xl">
            <FadeIn className="rounded-[32px] bg-slate-900 p-12 text-center text-white shadow-[0_32px_64px_-16px_rgb(0,0,0,0.2)] md:p-20">
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Sell certainty, not hours.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-[17px] font-normal leading-relaxed text-slate-400">
                The next step should be obvious: open the application, confirm fit, and start quoting
                work with more confidence.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full bg-blue-600 px-8 text-[15px] font-medium text-white shadow-[0_8px_16px_rgb(59,130,246,0.2)] hover:bg-blue-700 hover:-translate-y-0.5 transition-transform"
                >
                  <Link href="/request-access">
                    Request Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-14 rounded-full border-slate-700 bg-slate-800 px-8 text-[15px] font-medium text-white hover:bg-slate-700 hover:-translate-y-0.5 transition-transform"
                >
                  <Link href="/pilot-sample">
                    Preview a pilot deliverable
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
