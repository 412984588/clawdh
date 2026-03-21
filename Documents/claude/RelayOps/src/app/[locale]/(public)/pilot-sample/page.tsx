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
      <div className="flex flex-col bg-[#FAFAFA] font-sans text-slate-900">
        <section className="relative overflow-hidden bg-slate-900 pt-28 pb-20 md:pt-40 md:pb-32 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
          <div className="container relative max-w-7xl">
            <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
              <FadeIn>
                <Badge className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-widest text-blue-200">
                  Paid Pilot
                </Badge>
                <h1 className="font-display mt-8 text-[3.5rem] font-bold tracking-tighter text-balance md:text-7xl lg:leading-[1.05]">
                  Get a Taste Before Committing.
                </h1>
                <p className="mt-8 max-w-2xl text-lg font-normal leading-relaxed text-slate-400 md:text-xl">
                  $149 flat fee. Submit a real dataset (up to 500 rows), see how we clean it,
                  evaluate the output format — before you commit to production jobs.
                </p>
              </FadeIn>

              <SlideUp transition={{ delay: 0.15 }}>
                <div className="rounded-[32px] border border-slate-800 bg-slate-800/50 p-10 shadow-[0_24px_80px_-12px_rgb(0,0,0,0.5)] backdrop-blur-xl">
                  <div className="rounded-[24px] border border-blue-500/20 bg-blue-500/5 p-8">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-blue-300">
                      Pilot Fee
                    </p>
                    <div className="mt-4 flex items-end gap-3">
                      <span className="font-display text-[4rem] leading-none font-bold tracking-tighter text-white">$149</span>
                      <span className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        flat fee
                      </span>
                    </div>
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      {['2 business days', '1 dataset', '500 rows'].map((item) => (
                        <div
                          key={item}
                          className="rounded-[16px] border border-slate-700 bg-slate-800/50 px-5 py-4 text-[13px] font-medium text-slate-300"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 rounded-[24px] border border-slate-800 bg-slate-900/80 p-6 text-center">
                    <p className="text-[14px] leading-relaxed text-slate-400">
                      See our output format before committing to production work.
                    </p>
                  </div>
                </div>
              </SlideUp>
            </div>
          </div>
        </section>

        <section className="bg-white py-24 md:py-32">
          <div className="container max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-2">
              <FadeIn>
                <div className="h-full rounded-[32px] border border-slate-200/60 bg-white p-10 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-shadow hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-900 border border-slate-100">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                      What&apos;s included
                    </h2>
                  </div>
                  <ul className="mt-8 space-y-5">
                    {PILOT_INCLUDES.map((item) => (
                      <li key={item} className="flex items-start gap-4 text-[15px] leading-relaxed text-slate-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>

              <FadeIn transition={{ delay: 0.1 }}>
                <div className="h-full rounded-[32px] border border-slate-200/60 bg-slate-50 p-10 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-shadow hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)]">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-900 border border-slate-200/60 shadow-sm">
                      <AlertCircle className="h-5 w-5 text-slate-600" />
                    </div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">Pilot limitations</h2>
                  </div>
                  <ul className="mt-8 space-y-5">
                    {PILOT_LIMITATIONS.map((item) => (
                      <li key={item} className="flex items-start gap-4 text-[15px] leading-relaxed text-slate-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </div>

            <FadeIn transition={{ delay: 0.2 }}>
              <div className="mt-12 rounded-[32px] border border-blue-100 bg-blue-50 p-10">
                <div className="flex gap-5 flex-col md:flex-row md:items-start">
                  <div className="flex h-12 w-12 items-center justify-center shrink-0 rounded-xl bg-white shadow-sm border border-blue-100">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[17px] font-bold tracking-tight text-slate-900">
                      What does &quot;watermarked output&quot; mean?
                    </p>
                    <p className="mt-3 text-[15px] font-normal leading-relaxed text-slate-600">
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

        <section className="py-24 md:py-32 border-y border-slate-100">
          <div className="container max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-2">
              <FadeIn>
                <div className="flex flex-col h-full rounded-[32px] border border-slate-200/60 bg-white p-10 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    Already a partner?
                  </p>
                  <h3 className="font-display mt-6 text-3xl font-bold tracking-tight text-slate-900">
                    Submit your pilot brief from your portal
                  </h3>
                  <p className="mt-4 text-[15px] font-normal leading-relaxed text-slate-500">
                    Log in to your partner portal, create a new ticket, and select the Pilot tier
                    when scoping. The flat $149 invoice will be generated automatically after admin
                    review.
                  </p>
                  <div className="mt-12 pt-8 border-t border-slate-100 mt-auto">
                    <Button
                      asChild
                      size="lg"
                      className="w-full h-14 rounded-full bg-blue-600 text-[15px] font-medium text-white shadow-[0_8px_16px_rgb(59,130,246,0.2)] transition-transform hover:-translate-y-0.5 hover:bg-blue-700"
                    >
                      <Link href="/login">
                        Sign in to your portal
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </FadeIn>

              <FadeIn transition={{ delay: 0.1 }}>
                <div className="flex flex-col h-full rounded-[32px] border border-slate-200/60 bg-slate-50 p-10 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-blue-600">
                    Not a partner yet?
                  </p>
                  <h3 className="font-display mt-6 text-3xl font-bold tracking-tight text-slate-900">
                    Express interest in a pilot
                  </h3>
                  <p className="mt-4 text-[15px] font-normal leading-relaxed text-slate-600">
                    Leave your email and we&apos;ll reach out once you&apos;re approved. The fastest path
                    is to apply for partner access — it takes 2 minutes and we review within 2
                    business days.
                  </p>
                  <div className="mt-10">
                    <PilotInterestForm />
                  </div>
                  <div className="mt-10 pt-6 border-t border-slate-200/60 mt-auto">
                    <p className="text-[13px] text-slate-500">
                      Or{' '}
                      <Link href="/request-access" className="font-semibold text-blue-600 hover:text-blue-700 underline decoration-blue-200 underline-offset-4">
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

        <section className="bg-white py-24 md:py-32">
          <div className="container max-w-4xl">
            <FadeIn className="text-center mb-16">
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-4">
                Comparison
              </p>
              <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Pilot vs. Standard job
              </h2>
            </FadeIn>
            <SlideUp className="overflow-hidden rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-8 py-6 text-left font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400"></th>
                    <th className="px-8 py-6 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-slate-900 bg-white">
                      Pilot
                    </th>
                    <th className="px-8 py-6 text-center font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {[
                    ['Price', '$149 flat', 'From $399'],
                    ['Row limit', '500', '5,000'],
                    ['Turnaround', '2 business days', '2 business days'],
                    ['Output watermarked', 'Yes', 'No'],
                    ['Revisions', 'None', '1 included'],
                    ['Client-deliverable', 'No', 'Yes'],
                    ['Per-org limit', '1', 'Unlimited'],
                  ].map(([feature, pilot, standard]) => (
                    <tr key={feature} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-8 py-5 text-[14px] font-medium text-slate-600">{feature}</td>
                      <td className="px-8 py-5 text-center text-[15px] font-bold text-slate-900 bg-slate-50/30">
                        {pilot}
                      </td>
                      <td className="px-8 py-5 text-center text-[14px] text-slate-500">{standard}</td>
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
