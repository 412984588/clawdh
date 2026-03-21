import Link from 'next/link'
import Script from 'next/script'
import { AlertCircle, ArrowRight, CheckCircle2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'
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
    <div className="flex flex-col bg-white">
      <section className="relative overflow-hidden bg-zinc-950 py-20 text-white md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.28),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(180,83,9,0.16),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />
        <div className="container relative">
          <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <Badge className="rounded-full border border-amber-500/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200 hover:bg-white/10">
                Paid Pilot
              </Badge>
              <h1 className="mt-8 text-5xl font-black tracking-[-0.08em] text-balance text-white md:text-7xl lg:leading-[0.96]">
                Get a Taste Before Committing
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 md:text-xl">
                $149 flat fee. Submit a real dataset (up to 500 rows), see how we clean it,
                evaluate the output format — before you commit to production jobs.
              </p>
            </div>

            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all delay-150 duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-[0_40px_90px_-45px_rgba(79,70,229,0.8)] backdrop-blur-xl">
                <div className="rounded-[1.75rem] border border-amber-500/20 bg-gradient-to-br from-amber-700/16 via-zinc-900 to-zinc-950 p-6 shadow-[0_24px_60px_-36px_rgba(180,83,9,0.45)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
                    $149
                  </p>
                  <div className="mt-3 flex items-end gap-3">
                    <span className="text-6xl font-black tracking-[-0.08em] text-white">$149</span>
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
                <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-zinc-950/55 p-6">
                  <p className="text-sm leading-7 text-zinc-300">
                    See our output format before committing to production work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-2">
            <div
              data-reveal
              className="rounded-[2rem] border border-zinc-200 border-t-4 border-t-emerald-500 bg-white p-8 opacity-0 translate-y-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.18)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_30px_70px_-36px_rgba(16,185,129,0.2)] motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold tracking-[-0.04em] text-zinc-950">
                  What&apos;s included
                </h2>
              </div>
              <ul className="mt-6 space-y-4">
                {PILOT_INCLUDES.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base leading-7 text-zinc-600">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              data-reveal
              className="rounded-[2rem] border border-zinc-200 border-t-4 border-t-amber-500 bg-zinc-950 p-8 text-white opacity-0 translate-y-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_30px_70px_-36px_rgba(245,158,11,0.25)] motion-reduce:translate-y-0 motion-reduce:opacity-100"
              style={{ transitionDelay: '120ms' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10">
                  <AlertCircle className="h-5 w-5 text-amber-300" />
                </div>
                <h2 className="text-2xl font-bold tracking-[-0.04em]">Pilot limitations</h2>
              </div>
              <ul className="mt-6 space-y-4">
                {PILOT_LIMITATIONS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base leading-7 text-zinc-300">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            data-reveal
            className="mt-8 rounded-[2rem] border border-amber-200 bg-amber-50 px-6 py-6 opacity-0 translate-y-6 shadow-[0_18px_50px_-36px_rgba(180,83,9,0.14)] transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <div className="flex gap-4">
              <Info className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
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
        </div>
      </section>

      <section className="relative overflow-hidden bg-zinc-950 py-20 text-white md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(180,83,9,0.22),transparent_36%)]" />
        <div className="container relative">
          <div className="grid gap-6 lg:grid-cols-2">
            <div
              data-reveal
              className="rounded-[2rem] border border-white/10 bg-white/5 p-8 opacity-0 translate-y-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.82)] transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_28px_70px_-34px_rgba(180,83,9,0.3)] motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
                Already a partner?
              </p>
              <h3 className="mt-5 text-3xl font-bold tracking-[-0.05em] text-white">
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
                className="mt-8 w-full rounded-full bg-primary px-7 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md"
              >
                <Link href="/login">
                  Sign in to your portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div
              data-reveal
              className="rounded-[2rem] border border-white/10 bg-white p-8 text-zinc-950 opacity-0 translate-y-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_28px_70px_-34px_rgba(99,102,241,0.24)] motion-reduce:translate-y-0 motion-reduce:opacity-100"
              style={{ transitionDelay: '120ms' }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
                Not a partner yet?
              </p>
              <h3 className="mt-5 text-3xl font-bold tracking-[-0.05em]">
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
                  <Link href="/request-access" className="font-semibold text-amber-700 hover:text-amber-800">
                    apply for full partner access
                  </Link>{' '}
                  to get started right away.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container">
          <div
            data-reveal
            className="mx-auto max-w-2xl text-center opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
              Pilot vs. Standard job
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.06em] text-balance text-zinc-950 md:text-5xl">
              Pilot vs. Standard job
            </h2>
          </div>
          <div
            data-reveal
            className="mt-12 overflow-hidden rounded-[2rem] border border-zinc-200 opacity-0 translate-y-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.18)] transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-950 text-white">
                  <th className="px-6 py-5 text-left font-semibold tracking-[0.22em] text-zinc-400"></th>
                  <th className="bg-amber-50 px-6 py-5 text-center font-semibold text-zinc-950">
                    Pilot
                  </th>
                  <th className="px-6 py-5 text-center font-semibold">Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
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
                    <td className="bg-amber-50/70 px-6 py-4 text-center font-semibold text-zinc-950">
                      {pilot}
                    </td>
                    <td className="px-6 py-4 text-center text-zinc-600">{standard}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Script id="relayops-pilot-motion" strategy="afterInteractive">{`
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
        })();
      `}</Script>
    </div>
  )
}
