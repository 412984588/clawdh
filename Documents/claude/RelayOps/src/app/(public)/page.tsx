import Link from 'next/link'
import Script from 'next/script'
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Clock,
  Database,
  FileCheck,
  Lock,
  Shield,
  Tag,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const heroSignals = [
  'SOC 2 Ready',
  '2-Day SLA',
  'White-Label Delivery',
  'Never Trained On Your Data',
]

const stats = [
  { label: 'Data Cleaned', end: '12', prefix: '$', suffix: 'M+' },
  { label: 'Agency Partners', end: '50', suffix: '+' },
  { label: 'Accuracy Rate', end: '99.8', suffix: '%', decimals: '1' },
  { label: 'Avg Turnaround', end: '48', prefix: '<', suffix: ' hr' },
]

const processSteps = [
  {
    step: '01',
    title: 'Submit a Brief',
    description:
      'Tell us what you have — file counts, row counts, what\'s broken, and what "done" looks like. We scope it and send an invoice within 4 hours.',
    icon: FileCheck,
    accent: 'from-amber-600/20 to-amber-600/5',
    border: 'border-amber-500/30',
    iconClass: 'text-amber-200',
  },
  {
    step: '02',
    title: 'We Clean',
    description:
      'Your dataset is processed through our AI-assisted workflow, scoped strictly to your brief. Deduplication, normalization, field mapping, format fixes — no undocumented changes, no out-of-scope processing.',
    icon: Database,
    accent: 'from-amber-700/20 to-amber-700/5',
    border: 'border-amber-600/30',
    iconClass: 'text-amber-100',
  },
  {
    step: '03',
    title: 'You Import',
    description:
      'Review the deliverable in your partner portal. Approve or request a revision. Once approved, download and deliver to your client.',
    icon: CheckCircle,
    accent: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/30',
    iconClass: 'text-emerald-200',
  },
]

const partnerReasons = [
  {
    icon: Clock,
    title: '2-Day SLA',
    description:
      'Standard jobs turn around in 2 business days. Fixed scope and fixed price before any work begins — no surprises.',
    accent: 'border-t-amber-500',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-300',
  },
  {
    icon: Shield,
    title: 'ISO-Grade Data Handling',
    description:
      'Files stored encrypted with signed URLs. Your data is never used to train AI models. Automatic deletion on a fixed retention schedule.',
    accent: 'border-t-amber-600',
    iconBg: 'bg-amber-600/10',
    iconColor: 'text-amber-200',
  },
  {
    icon: Tag,
    title: 'White-Label Ready',
    description:
      'Your clients never see RelayOps. Resell at any margin. Deliverables come unbranded. You own the relationship.',
    accent: 'border-t-emerald-500',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-300',
  },
]

const serviceGroups = [
  {
    icon: Database,
    title: 'Data Cleanup & Import Prep',
    items: [
      'Deduplication',
      'Field normalization',
      'Format standardization',
      'HubSpot import template mapping',
    ],
    accent: 'border-t-amber-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-700',
  },
  {
    icon: BarChart3,
    title: 'Data Normalization & Report Prep',
    items: [
      'Consistent value encoding',
      'Date/number formatting',
      'Enum harmonization',
      'Report-ready output',
    ],
    accent: 'border-t-amber-600',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-700',
  },
  {
    icon: Zap,
    title: 'CRM Import Failure Diagnosis',
    items: [
      'Error log review',
      'Column mapping fix',
      'Required-field audit',
      'Re-import guidance',
    ],
    accent: 'border-t-amber-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
]

const pricing = [
  {
    tier: 'Pilot',
    price: '$149',
    unit: 'flat',
    description: 'Up to 500 rows, 1 file. Includes preview deliverable.',
    featured: false,
  },
  {
    tier: 'Standard',
    price: '$499',
    unit: 'from',
    description: '501–5,000 rows. Dedup, normalize, field map.',
    featured: true,
  },
  {
    tier: 'Complex',
    price: '$1,499',
    unit: 'from',
    description: '5,001–25,000 rows. Multi-object, multi-source.',
    featured: false,
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-white">
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.22),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(180,83,9,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />

        <div className="container relative py-20 md:py-28 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200 shadow-[0_24px_80px_-48px_rgba(180,83,9,0.55)] backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                For US RevOps Agencies
              </div>

              <h1 className="mt-8 max-w-4xl text-5xl font-black tracking-[-0.08em] text-balance text-white md:text-7xl lg:text-[5.5rem] lg:leading-[0.95]">
                CRM Import Prep in{' '}
                <span className="bg-gradient-to-r from-amber-300 via-white to-amber-100 bg-clip-text text-transparent">
                  2 Business Days
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
                White-label HubSpot and CRM data cleanup for RevOps agencies. Submit a brief,
                we do the <span className="font-semibold text-white">deduplication, normalization</span>
                {' '}and field mapping — you deliver to your client.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full border border-amber-600/40 bg-amber-700 px-7 text-white shadow-[0_24px_44px_-20px_rgba(180,83,9,0.7)] transition-all duration-300 hover:-translate-y-1 hover:bg-amber-600 hover:shadow-[0_34px_55px_-18px_rgba(180,83,9,0.75)]"
                >
                  <Link href="/request-access">
                    Request Partner Access
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="rounded-full border border-white/15 bg-white/5 px-7 text-white shadow-[0_18px_40px_-24px_rgba(24,24,27,0.8)] transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10 hover:shadow-[0_28px_44px_-22px_rgba(24,24,27,0.95)]"
                >
                  <Link href="/pilot-sample">
                    Start with a Paid Pilot
                    <ArrowRight className="h-4 w-4 opacity-70" />
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-zinc-300">
                {heroSignals.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all delay-150 duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-[0_40px_90px_-45px_rgba(180,83,9,0.55)] backdrop-blur-xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(180,83,9,0.18),transparent_42%)]" />
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
                      White-Label Delivery
                    </p>
                    <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      2-Day SLA
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-zinc-950/55 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                        Fixed scope
                      </p>
                      <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
                        4 hours
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        We scope it and send an invoice within 4 hours.
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-zinc-950/55 p-5">
                      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                        Review window
                      </p>
                      <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
                        72 hours
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Approve or request a revision before delivery closes.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
                      What partners keep
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        'Deduplication',
                        'Normalization',
                        'Field mapping',
                        'Unbranded output',
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                        >
                          <span className="text-sm text-zinc-200">{item}</span>
                          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
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

          <div
            data-reveal
            className="mt-14 opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_22px_60px_-34px_rgba(15,23,42,0.85)] backdrop-blur-sm md:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="rounded-[1.4rem] border border-white/10 bg-zinc-950/40 px-5 py-5 text-center">
                  <div
                    data-counter-end={item.end}
                    data-counter-prefix={item.prefix}
                    data-counter-suffix={item.suffix}
                    data-counter-decimals={item.decimals}
                    className="text-4xl font-black tracking-[-0.06em] text-white md:text-5xl"
                  >
                    {`${item.prefix ?? ''}${item.end}${item.suffix ?? ''}`}
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1fr]">
            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
                Process
              </p>
              <h2 className="mt-5 max-w-xl text-4xl font-black tracking-[-0.06em] text-zinc-950 text-balance md:text-5xl">
                Three steps from brief to clean data
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-8 text-zinc-600">
                Fixed scope, fixed price, guaranteed SLA — before any work begins.
              </p>
              <Link
                href="/how-it-works"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-amber-700 transition-transform duration-300 hover:translate-x-1 hover:text-amber-800"
              >
                See the full process
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-5">
              {processSteps.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.step}
                    data-reveal
                    className="opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
                    style={{ transitionDelay: `${index * 120}ms` }}
                  >
                    <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_28px_70px_-34px_rgba(180,83,9,0.2)]">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} ${item.border}`}>
                            <Icon className={`h-6 w-6 ${item.iconClass}`} />
                          </div>
                          <span className="text-sm font-black tracking-[0.2em] text-zinc-300">
                            {item.step}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold tracking-[-0.03em] text-zinc-950">
                            {item.title}
                          </h3>
                          <p className="mt-3 text-base leading-7 text-zinc-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-zinc-950 py-20 text-white md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(180,83,9,0.2),transparent_24%),radial-gradient(circle_at_80%_80%,rgba(180,83,9,0.14),transparent_28%)]" />
        <div className="container relative">
          <div
            data-reveal
            className="max-w-2xl opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              Why Us
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.06em] text-balance text-white md:text-5xl">
              Built for agencies that can&apos;t afford surprises
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-[1.3fr_1fr]">
            {/* 英雄卡：第一条原因占据左侧大列 */}
            {(() => {
              const item = partnerReasons[0]
              const Icon = item.icon
              return (
                <div
                  data-reveal
                  className={`rounded-[2rem] border border-white/10 border-t-4 ${item.accent} bg-white/[0.07] p-8 opacity-0 translate-y-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.85)] transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_32px_70px_-36px_rgba(180,83,9,0.3)] motion-reduce:translate-y-0 motion-reduce:opacity-100`}
                  style={{ transitionDelay: '0ms' }}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconBg}`}>
                    <Icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="mt-8 text-3xl font-black tracking-[-0.05em] text-white">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-zinc-300">{item.description}</p>
                </div>
              )
            })()}
            {/* 右侧小列：剩余两张卡垂直堆叠 */}
            <div className="flex flex-col gap-5">
              {partnerReasons.slice(1).map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    data-reveal
                    className={`rounded-[2rem] border border-white/10 border-t-4 ${item.accent} bg-white/5 p-6 opacity-0 translate-y-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.85)] transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_32px_70px_-36px_rgba(180,83,9,0.3)] motion-reduce:translate-y-0 motion-reduce:opacity-100`}
                    style={{ transitionDelay: `${(index + 1) * 110}ms` }}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg}`}>
                      <Icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <h3 className="mt-6 text-2xl font-bold tracking-[-0.04em] text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-zinc-300">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container">
          <div
            data-reveal
            className="max-w-2xl opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
              Services
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.06em] text-zinc-950 text-balance md:text-5xl">
              Three job types, all import-ready
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-[1.4fr_1fr_0.8fr]">
            {/* 英雄卡：Data Cleanup 占据最左大列，附"最常请求"标签 */}
            {(() => {
              const item = serviceGroups[0]
              const Icon = item.icon
              return (
                <div
                  data-reveal
                  className={`rounded-[2rem] border border-zinc-200 border-t-4 ${item.accent} bg-white p-8 opacity-0 translate-y-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.32)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_24px_65px_-34px_rgba(180,83,9,0.18)] motion-reduce:translate-y-0 motion-reduce:opacity-100`}
                  style={{ transitionDelay: '0ms' }}
                >
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                    Most requested
                  </span>
                  <div className={`mt-6 flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg}`}>
                    <Icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold tracking-[-0.04em] text-zinc-950">
                    {item.title}
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {item.items.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm leading-6 text-zinc-600">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })()}
            {/* 中列：另外两个服务垂直堆叠 */}
            <div className="flex flex-col gap-5">
              {serviceGroups.slice(1).map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    data-reveal
                    className={`rounded-[2rem] border border-zinc-200 border-t-4 ${item.accent} bg-white p-6 opacity-0 translate-y-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.32)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_24px_65px_-34px_rgba(180,83,9,0.18)] motion-reduce:translate-y-0 motion-reduce:opacity-100`}
                    style={{ transitionDelay: `${(index + 1) * 110}ms` }}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.iconBg}`}>
                      <Icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <h3 className="mt-5 text-xl font-bold tracking-[-0.03em] text-zinc-950">
                      {item.title}
                    </h3>
                    <ul className="mt-4 space-y-2">
                      {item.items.map((point) => (
                        <li key={point} className="flex items-start gap-3 text-sm leading-6 text-zinc-600">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
            {/* 第三列：静态"All jobs include"特性列表，打破图标网格对称 */}
            <div
              data-reveal
              className="rounded-[2rem] border border-zinc-100 bg-zinc-50 p-6 opacity-0 translate-y-6 motion-reduce:translate-y-0 motion-reduce:opacity-100"
              style={{ transitionDelay: '220ms' }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
                All jobs include
              </p>
              <ul className="mt-5 space-y-4">
                {[
                  'Dedicated Slack channel',
                  '2-day turnaround SLA',
                  'QA review before delivery',
                  'HubSpot-ready output',
                  'Re-import support',
                  'White-label reports',
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-zinc-600">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-zinc-950 py-20 text-white md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(180,83,9,0.2),transparent_40%)]" />
        <div className="container relative">
          <div
            data-reveal
            className="mx-auto max-w-2xl text-center opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              Pricing
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.06em] text-balance text-white md:text-5xl">
              Transparent pricing. No consulting quotes.
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-300">
              CRM consulting firms charge $5,000–50,000+ for the same work. We publish ours.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {pricing.map((plan, index) => (
              <div
                key={plan.tier}
                data-reveal
                className={`relative rounded-[2rem] border p-6 opacity-0 translate-y-6 transition-all duration-300 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
                  plan.featured
                    ? 'border-amber-500/40 bg-gradient-to-b from-amber-700/18 via-zinc-900 to-zinc-950 shadow-[0_30px_90px_-44px_rgba(180,83,9,0.6)] hover:-translate-y-1 hover:shadow-[0_36px_110px_-38px_rgba(180,83,9,0.7)]'
                    : 'border-white/10 bg-white/5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.82)] hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_28px_70px_-34px_rgba(180,83,9,0.25)]'
                }`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                {plan.featured ? (
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
                ) : null}
                {plan.featured ? (
                  <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                    Most common
                  </span>
                ) : null}
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400">
                  {plan.tier}
                </p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                    {plan.unit}
                  </span>
                  <span className="text-5xl font-black tracking-[-0.06em] text-white">
                    {plan.price}
                  </span>
                </div>
                <p className="mt-4 max-w-xs text-base leading-7 text-zinc-300">
                  {plan.description}
                </p>
              </div>
            ))}
          </div>

          <div
            data-reveal
            className="mt-8 text-center opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <p className="text-sm text-zinc-400">
              Custom pricing for 25,000+ rows and monthly retainers.
            </p>
            <Link
              href="/for-partners"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-amber-300 transition-transform duration-300 hover:translate-x-1 hover:text-amber-200"
            >
              See full pricing and tier details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-20 md:py-28">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(180,83,9,0.08),transparent_38%)]" />
        <div className="container relative">
          <div
            data-reveal
            className="mx-auto max-w-3xl text-center opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
              Built for agencies processing 5–50 HubSpot imports per month
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.06em] text-balance text-zinc-950 md:text-5xl">
              Stop losing margin on data prep work your team shouldn&apos;t be doing
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { stat: '2 days', label: 'Standard turnaround' },
              { stat: '100%', label: 'White-label delivery' },
              { stat: '14-day', label: 'Pilot data retention' },
            ].map((item, index) => (
              <div
                key={item.label}
                data-reveal
                className="rounded-[2rem] border border-zinc-200 bg-white px-6 py-8 text-center opacity-0 translate-y-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.2)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_30px_70px_-36px_rgba(180,83,9,0.18)] motion-reduce:translate-y-0 motion-reduce:opacity-100"
                style={{ transitionDelay: `${index * 110}ms` }}
              >
                <div className="text-5xl font-black tracking-[-0.06em] text-zinc-950">
                  {item.stat}
                </div>
                <p className="mt-3 text-sm text-zinc-600">{item.label}</p>
              </div>
            ))}
          </div>

          <div
            data-reveal
            className="mt-16 rounded-[2rem] border border-zinc-200 bg-zinc-950 px-8 py-10 text-center text-white opacity-0 translate-y-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.85)] transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              <Users className="h-3.5 w-3.5" />
              Apply in 2 minutes
            </div>
            <h2 className="mt-6 text-4xl font-black tracking-[-0.06em] text-balance md:text-5xl">
              Ready to add white-label CRM cleanup to your agency?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
              We review all applications within 2 business days and will reach out to set up your portal.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full border border-amber-600/40 bg-amber-700 px-7 text-white shadow-[0_24px_44px_-20px_rgba(180,83,9,0.7)] transition-all duration-300 hover:-translate-y-1 hover:bg-amber-600 hover:shadow-[0_34px_55px_-18px_rgba(180,83,9,0.75)]"
              >
                <Link href="/request-access">
                  Request Partner Access
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="rounded-full border border-zinc-700 bg-transparent px-7 text-zinc-100 shadow-[0_18px_40px_-24px_rgba(24,24,27,0.8)] transition-all duration-300 hover:-translate-y-1 hover:border-zinc-500 hover:bg-white/5 hover:text-white hover:shadow-[0_28px_44px_-22px_rgba(24,24,27,0.95)]"
              >
                <Link href="/pilot-sample">
                  <Lock className="mr-2 h-4 w-4" />
                  Start with a $149 Pilot
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Script id="relayops-home-motion" strategy="afterInteractive">{`
        (() => {
          const revealTargets = document.querySelectorAll('[data-reveal]:not([data-reveal-ready])');
          revealTargets.forEach((element) => {
            element.setAttribute('data-reveal-ready', 'true');
          });

          const show = (element) => {
            element.classList.add('opacity-100', 'translate-y-0');
            element.classList.remove('opacity-0', 'translate-y-6');
          };

          if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  show(entry.target);
                  revealObserver.unobserve(entry.target);
                }
              });
            }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

            revealTargets.forEach((element) => revealObserver.observe(element));
          } else {
            revealTargets.forEach(show);
          }

          const counters = document.querySelectorAll('[data-counter-end]:not([data-counter-ready])');
          counters.forEach((element) => {
            element.setAttribute('data-counter-ready', 'true');
          });

          const animateCounter = (element) => {
            if (element.getAttribute('data-counter-animated') === 'true') return;
            element.setAttribute('data-counter-animated', 'true');
            const end = Number(element.getAttribute('data-counter-end') || 0);
            const prefix = element.getAttribute('data-counter-prefix') || '';
            const suffix = element.getAttribute('data-counter-suffix') || '';
            const decimals = Number(element.getAttribute('data-counter-decimals') || 0);
            const duration = 1400;
            const startTime = performance.now();

            const step = (timestamp) => {
              const progress = Math.min((timestamp - startTime) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const value = (end * eased).toFixed(decimals);
              element.textContent = prefix + value + suffix;
              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                element.textContent = prefix + end.toFixed(decimals) + suffix;
              }
            };

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              element.textContent = prefix + end.toFixed(decimals) + suffix;
              return;
            }
            requestAnimationFrame(step);
          };

          if ('IntersectionObserver' in window) {
            const counterObserver = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  animateCounter(entry.target);
                  counterObserver.unobserve(entry.target);
                }
              });
            }, { threshold: 0.45 });

            counters.forEach((element) => counterObserver.observe(element));
          } else {
            counters.forEach(animateCounter);
          }
        })();
      `}</Script>
    </div>
  )
}
