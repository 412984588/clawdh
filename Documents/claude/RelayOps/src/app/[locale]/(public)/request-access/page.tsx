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
      <div className="relative min-h-screen overflow-hidden bg-slate-900 font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.12)_0%,transparent_60%)] pointer-events-none" />

        <div className="container relative py-20 md:py-32">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:items-start max-w-7xl mx-auto">
            <div className="space-y-12 text-white">
              <FadeIn>
                <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-blue-300">
                  Partner Program
                </p>
                <h1 className="font-display mt-6 text-[3.5rem] font-bold tracking-tighter text-balance md:text-6xl lg:leading-[1.05]">
                  Apply for Access.
                </h1>
                <p className="mt-8 max-w-xl text-lg font-normal leading-relaxed text-slate-400">
                  Join agencies using RelayOps to deliver white-label CRM cleanup to their
                  clients. We review all applications within 2 business days.
                </p>
              </FadeIn>

              <StaggerList className="grid gap-4 sm:grid-cols-3">
                <StaggerItem className="rounded-[24px] border border-slate-800 bg-slate-800/50 p-6 backdrop-blur-sm">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">Review</p>
                  <p className="font-display mt-3 text-3xl font-bold tracking-tighter text-white">2 days</p>
                </StaggerItem>
                <StaggerItem className="rounded-[24px] border border-slate-800 bg-slate-800/50 p-6 backdrop-blur-sm">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">Scoping</p>
                  <p className="font-display mt-3 text-3xl font-bold tracking-tighter text-white">4 hrs</p>
                </StaggerItem>
                <StaggerItem className="rounded-[24px] border border-slate-800 bg-slate-800/50 p-6 backdrop-blur-sm">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">Pricing</p>
                  <p className="font-display mt-3 text-3xl font-bold tracking-tighter text-white">Flat</p>
                </StaggerItem>
              </StaggerList>

              <FadeIn transition={{ delay: 0.2 }}>
                <div className="rounded-[32px] border border-slate-800 bg-slate-800/30 p-8 md:p-10 shadow-[0_24px_80px_-12px_rgb(0,0,0,0.5)] backdrop-blur-xl">
                  <div className="space-y-5">
                    {PARTNER_BENEFITS.map((benefit) => (
                      <div key={benefit} className="flex items-start gap-4">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
                        <span className="text-[15px] font-normal leading-relaxed text-slate-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              <FadeIn transition={{ delay: 0.3 }}>
                <div className="rounded-[32px] border border-blue-500/20 bg-blue-500/5 p-8 md:p-10">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-blue-300">
                    What happens next?
                  </p>
                  <ol className="mt-6 space-y-5 text-[15px] font-normal leading-relaxed text-slate-300">
                    {nextSteps.map((step, index) => (
                      <li key={step} className="flex items-start gap-4">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-[11px] font-bold text-blue-400">
                          {index + 1}
                        </span>
                        <span className="mt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </FadeIn>
            </div>

            <SlideUp transition={{ delay: 0.15 }} className="lg:pl-8">
              <div className="rounded-[40px] border border-slate-200/60 bg-white p-8 md:p-12 shadow-[0_32px_64px_-16px_rgb(0,0,0,0.4)]">
                <div className="mb-10">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-3">
                    Application Form
                  </p>
                  <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900">
                    Tell us about your agency
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
