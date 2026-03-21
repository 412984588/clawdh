import { CheckCircle } from 'lucide-react'
import { PartnerApplicationForm } from '@/components/forms/partner-application-form'
import {
  MotionProvider,
  FadeIn,
  SlideUp,
  StaggerList,
  StaggerItem,
} from '@/components/ui/motion'
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'
import { cn } from '@/lib/utils/cn'

export const metadata = createPublicMetadata(publicPageDefinitions.requestAccess)

const PARTNER_BENEFITS = [
  '2-business-day SLA on standard jobs',
  'Flat-rate pricing you can resell at any margin',
  'Dedicated partner portal for brief submission and delivery',
  'Your data is never used to train AI models — processed securely and deleted on schedule',
  'No minimums, no monthly fees — pay per job',
  'DPA available on request for enterprise clients',
]

const nextSteps = [
  'We review your application (1–2 business days)',
  'We email you to confirm approval and set up your portal',
  'You submit your first brief and we scope it within 4 hours',
]

export default function RequestAccessPage() {
  return (
    <MotionProvider>
      <div className="relative min-h-screen overflow-hidden bg-[#0B1220]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(20,184,166,0.14),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />

        <div className="container relative py-16 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="space-y-8 text-white">
              <FadeIn>
                <p className="font-mono text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">
                  Partner Program
                </p>
                <h1 className="font-display mt-5 text-5xl font-bold tracking-[-0.08em] text-balance md:text-7xl lg:leading-[0.94]">
                  Apply for Partner Access
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
                  Join agencies using RelayOps to deliver white-label CRM cleanup to their
                  clients. We review all applications within 2 business days.
                </p>
              </FadeIn>

              <StaggerList className="grid gap-4 sm:grid-cols-3">
                <StaggerItem className="rounded-[1.75rem] border border-white/10 bg-white/10 px-5 py-5 backdrop-blur-sm">
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Review</p>
                  <p className="font-display mt-2 text-4xl font-bold tracking-[-0.06em] text-white">2 days</p>
                </StaggerItem>
                <StaggerItem className="rounded-[1.75rem] border border-white/10 bg-white/10 px-5 py-5 backdrop-blur-sm">
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Scoping</p>
                  <p className="font-display mt-2 text-4xl font-bold tracking-[-0.06em] text-white">4 hours</p>
                </StaggerItem>
                <StaggerItem className="rounded-[1.75rem] border border-white/10 bg-white/10 px-5 py-5 backdrop-blur-sm">
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Pricing</p>
                  <p className="font-display mt-2 text-4xl font-bold tracking-[-0.06em] text-white">Flat</p>
                </StaggerItem>
              </StaggerList>

              <FadeIn transition={{ delay: 0.2 }}>
                <div className="rounded-[2rem] border border-white/10 bg-white/10 p-7 shadow-[0_24px_60px_-40px_rgba(11,18,32,0.82)] backdrop-blur-xl">
                  <div className="space-y-4">
                    {PARTNER_BENEFITS.map((benefit) => (
                      <div key={benefit} className="flex items-start gap-3 text-zinc-200">
                        <CheckCircle className="mt-1 h-5 w-5 shrink-0 text-teal-400" />
                        <span className="text-base leading-7">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              <FadeIn transition={{ delay: 0.3 }}>
                <div className="rounded-[2rem] border border-blue-500/15 bg-gradient-to-br from-blue-600/14 via-white/5 to-white/5 p-7 shadow-[0_24px_60px_-40px_rgba(59,130,246,0.35)]">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-blue-300">
                    What happens next?
                  </p>
                  <ol className="mt-5 space-y-4 text-base leading-7 text-zinc-200">
                    {nextSteps.map((step, index) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </FadeIn>
            </div>

            <SlideUp transition={{ delay: 0.15 }}>
              <div className="rounded-[2rem] border border-white/10 bg-white p-6 shadow-[0_40px_90px_-45px_rgba(11,18,32,0.6)] md:p-8">
                <div className="mb-6 rounded-[1.5rem] border border-zinc-100 bg-zinc-50 px-5 py-5">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
                    Partner Application
                  </p>
                  <h2 className="font-display mt-3 text-2xl font-bold tracking-[-0.04em] text-zinc-950">
                    Partner Application
                  </h2>
                </div>
                <PartnerApplicationForm />
              </div>
            </SlideUp>
          </div>
        </div>
      </div>
    </MotionProvider>
  )
}
