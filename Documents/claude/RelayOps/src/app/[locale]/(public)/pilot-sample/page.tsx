import Link from 'next/link'
import { AlertCircle, ArrowRight, CheckCircle2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MotionProvider,
  FadeIn,
  SlideUp,
  StaggerList,
  StaggerItem,
} from '@/components/ui/motion'
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'
import { cn } from '@/lib/utils/cn'
import { PilotInterestForm } from './pilot-interest-form'

export const metadata = createPublicMetadata(publicPageDefinitions.pilotSample)

const PILOT_INCLUDES = [
  '1 dataset, up to 500 rows',
  '2 business day SLA-backed turnaround',
  'Full cleanup pass: dedup, normalize, field map',
  'Data never used for AI training — processed securely',
  'Delivery summary from the operator',
  'Preview-format output (watermarked)',
]

const PILOT_LIMITATIONS = [
  'One pilot per organization — not repeatable',
  'No revisions (preview tier)',
  'Output is watermarked — not client-deliverable as-is',
  'Not discounted against future jobs',
]

export default function PilotSamplePage() {
  return (
    <MotionProvider>
      <div className="flex flex-col bg-[#f8fafc]">
        <section className="relative overflow-hidden bg-[#0B1220] py-20 text-white md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(20,184,166,0.14),transparent_24%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />
          <div className="container relative">
            <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
              <FadeIn>
                <Badge className="rounded-full border border-blue-500/20 bg-white/10 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-200 hover:bg-white/10">
                  Paid Pilot
                </Badge>
                <h1 className="font-display mt-8 text-5xl font-bold tracking-[-0.08em] text-balance text-white md:text-7xl lg:leading-[0.94]">
                  Get a Taste Before Committing
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
                  $149 flat fee. Submit a real dataset (up to 500 rows), see how we clean it,
                  evaluate the output format — before you commit to production jobs.
                </p>
              </FadeIn>

              <SlideUp transition={{ delay: 0.15 }}>
                <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-[0_40px_90px_-45px_rgba(59,130,246,0.35)] backdrop-blur-xl">
                  <div className="rounded-[1.75rem] border border-blue-500/20 bg-gradient-to-br from-blue-600/16 via-[#101827] to-[#0B1220] p-6 shadow-[0_24px_60px_-36px_rgba(59,130,246,0.45)]">
                    <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
                      Pilot Fee
                    </p>
                    <div className="mt-3 flex items-end gap-3">
                      <span className="font-display text-6xl font-bold tracking-[-0.08em] text-white">$149</span>
                      <span className="pb-2 text-sm uppercase tracking-[0.24em] text-zinc-400">
                        flat fee
                      </span>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {['2 business days', '1 dataset', '500 rows'].map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-[#0B1220]/55 p-6 text-center">
                    <p className="text-sm leading-7 text-zinc-300">
                      See our output format before committing to production work.
                    </p>
                  </div>
                </div>
              </SlideUp>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 md:py-28">
          <div className="container">
            <div className="grid gap-6 lg:grid-cols-2">
              <FadeIn>
                <div className="h-full rounded-[2rem] border border-zinc-200 border-t-4 border-t-teal-500 bg-white p-8 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_30px_70px_-36px_rgba(20,184,166,0.18)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50">
                      <CheckCircle2 className="h-5 w-5 text-teal-600" />
                    </div>
                    <h2 className="font-display text-2xl font-bold tracking-[-0.04em] text-zinc-950">
                      What&apos;s included
                    </h2>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {PILOT_INCLUDES.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-base leading-7 text-zinc-600">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>

              <FadeIn transition={{ delay: 0.1 }}>
                <div className="h-full rounded-[2rem] border border-zinc-200 border-t-4 border-t-blue-500 bg-[#0B1220] p-8 text-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-[0_30px_70px_-36px_rgba(59,130,246,0.25)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10">
                      <AlertCircle className="h-5 w-5 text-blue-300" />
                    </div>
                    <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">Pilot limitations</h2>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {PILOT_LIMITATIONS.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-base leading-7 text-zinc-300">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </div>

            <FadeIn transition={{ delay: 0.2 }}>
              <div className="mt-8 rounded-[2rem] border border-blue-200 bg-[#E8EEF7] px-6 py-6 shadow-[0_18px_50px_-36px_rgba(59,130,246,0.14)] transition-all duration-700 ease-out">
                <div className="flex gap-4">
                  <Info className="mt-1 h-5 w-5 shrink-0 text-blue-700" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-950">
                      What does &quot;watermarked output&quot; mean?
                    </p>
                    <p className="mt-2 text-sm leading-7 text-zinc-600">
                      The pilot deliverable has a &quot;RelayOps Preview — Not for Client Delivery&quot;
                      column added. This lets you evaluate the quality and format of the work without
                      us doing unbilled production output. Once you become a full partner, all
                      deliverables are clean and unbranded.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0B1220] py-20 text-white md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_36%)]" />
          <div className="container relative">
            <div className="grid gap-6 lg:grid-cols-2">
              <FadeIn>
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.82)] transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_28px_70px_-34px_rgba(59,130,246,0.3)]">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
                    Already a partner?
                  </p>
                  <h3 className="font-display mt-5 text-3xl font-bold tracking-[-0.05em] text-white">
                    Submit your pilot brief from your portal
                  </h3>
                  <p className="mt-4 text-base leading-7 text-zinc-300">
                    Log in to your partner portal, create a new ticket, and select the Pilot tier
                    when scoping. The flat $149 invoice will be generated automatically after admin
                    review.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="mt-8 w-full rounded-full bg-blue-600 px-7 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-md"
                  >
                    <Link href="/login">
                      Sign in to your portal
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </FadeIn>

              <FadeIn transition={{ delay: 0.1 }}>
                <div className="rounded-[2rem] border border-white/10 bg-white p-8 text-zinc-950 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_28px_70px_-34px_rgba(59,130,246,0.24)]">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
                    Not a partner yet?
                  </p>
                  <h3 className="font-display mt-5 text-3xl font-bold tracking-[-0.05em]">
                    Express interest in a pilot
                  </h3>
                  <p className="mt-4 text-base leading-7 text-zinc-600">
                    Leave your email and we&apos;ll reach out once you&apos;re approved. The fastest path
                    is to apply for partner access — it takes 2 minutes and we review within 2
                    business days.
                  </p>
                  <div className="mt-6">
                    <PilotInterestForm />
                  </div>
                  <div className="mt-6 border-t border-zinc-100 pt-4">
                    <p className="text-sm text-zinc-500">
                      Or{' '}
                      <Link href="/request-access" className="font-semibold text-blue-700 hover:text-blue-800 underline decoration-blue-200 underline-offset-4">
                        apply for full partner access
                      </Link>{' '}
                      to get started right away.
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 md:py-28">
          <div className="container">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
                Pilot vs. Standard job
              </p>
              <h2 className="font-display mt-5 text-4xl font-bold tracking-[-0.06em] text-balance text-zinc-950 md:text-5xl">
                Pilot vs. Standard job
              </h2>
            </FadeIn>
            <SlideUp className="mt-12 overflow-hidden rounded-[2rem] border border-zinc-200 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.18)] transition-all duration-700 ease-out">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#0B1220] text-white">
                    <th className="px-6 py-5 text-left font-semibold tracking-[0.22em] text-zinc-400"></th>
                    <th className="bg-[#E8EEF7] px-6 py-5 text-center font-semibold text-[#0B1220]">
                      Pilot
                    </th>
                    <th className="px-6 py-5 text-center font-semibold">Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {[
                    ['Price', '$149 flat', 'From $399'],
                    ['Row limit', '500', '5,000'],
                    ['Turnaround', '2 business days', '2 business days'],
                    ['Output watermarked', 'Yes', 'No'],
                    ['Revisions', 'None', '1 included'],
                    ['Client-deliverable', 'No', 'Yes'],
                    ['Per-org limit', '1', 'Unlimited'],
                  ].map(([feature, pilot, standard]) => (
                    <tr key={feature} className="transition-colors hover:bg-zinc-50/60">
                      <td className="px-6 py-4 font-medium text-zinc-600">{feature}</td>
                      <td className="bg-[#E8EEF7]/40 px-6 py-4 text-center font-semibold text-zinc-950">
                        {pilot}
                      </td>
                      <td className="px-6 py-4 text-center text-zinc-600">{standard}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SlideUp>
          </div>
        </section>
      </div>
    </MotionProvider>
  )
}
