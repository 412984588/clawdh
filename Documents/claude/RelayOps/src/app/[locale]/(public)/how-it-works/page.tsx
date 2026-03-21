import Link from 'next/link'
import {
  CheckSquare,
  ChevronDown,
  CreditCard,
  FileText,
  Search,
  Wrench,
  ArrowRight,
} from 'lucide-react'
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

export const metadata = createPublicMetadata(publicPageDefinitions.howItWorks)

const STEPS = [
  {
    icon: FileText,
    step: 'Step 1',
    title: 'Submit a Brief',
    duration: 'Takes 5–10 minutes',
    description:
      "Fill out a structured ticket in your partner portal. Tell us what you have (file counts, row counts, source system), what's broken (duplicates, bad formatting, failed import errors), and what done looks like (target system, acceptance criteria).",
    deliverable: 'Scoping review starts within 4 business hours.',
    accent: 'bg-white',
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-900',
  },
  {
    icon: Search,
    step: 'Step 2',
    title: 'Admin Scopes Your Job',
    duration: 'Same business day',
    description:
      "A RelayOps admin reviews your brief, categorizes the work (cleanup, normalization, or diagnosis), and assigns a pricing tier. Standard jobs are quoted at a flat rate. Complex jobs are quoted individually. You'll see the scope and price before any work starts.",
    deliverable: 'You receive a fixed-price invoice via Stripe.',
    accent: 'bg-white',
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-900',
  },
  {
    icon: CreditCard,
    step: 'Step 3',
    title: 'Approve the Invoice',
    duration: "When you're ready",
    description:
      'Pay the invoice through your partner portal. Once payment is confirmed, the job enters the queue. No payment, no start — this protects both parties and keeps the pipeline predictable.',
    deliverable: 'Job status moves to Queued.',
    accent: 'bg-white',
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-900',
  },
  {
    icon: Wrench,
    step: 'Step 4',
    title: 'We Process the Data',
    duration: '2 business days (standard)',
    description:
      'Your dataset is processed through our AI-assisted workflow, working strictly within the scoped acceptance criteria — no undocumented changes, no touching out-of-scope columns. Your data is never used to train AI models. All processing happens in our secure environment with encrypted file storage.',
    deliverable:
      'Completed deliverable uploaded with a delivery summary for review.',
    accent: 'bg-blue-50/50',
    iconBg: 'bg-blue-600',
    iconColor: 'text-white',
    highlight: true,
  },
  {
    icon: CheckSquare,
    step: 'Step 5',
    title: 'You Review & Accept',
    duration: '72-hour review window',
    description:
      "Download the deliverable and check it against the acceptance criteria. If it meets the brief: approve and the job closes. If something's off: request one revision with specific notes. If there's a genuine shortfall: open a dispute for admin review.",
    deliverable: 'Approved deliverable ready to deliver to your client.',
    accent: 'bg-white',
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-900',
  },
]

const DELIVERABLE_TYPES = [
  {
    tier: 'Pilot',
    price: '$149 flat',
    rows: 'Up to 500 rows',
    files: '1 file',
    turnaround: '2 business days',
    revisions: 'None',
    notes: 'One per organization. Watermarked output.',
  },
  {
    tier: 'Standard',
    price: 'From $399',
    rows: '501–5,000 rows',
    files: 'Up to 3 files',
    turnaround: '2 business days',
    revisions: '1 included',
    notes: 'Most single-client import jobs fall here.',
  },
  {
    tier: 'Complex',
    price: 'From $899',
    rows: '5,001–25,000 rows',
    files: 'Up to 10 files',
    turnaround: '3–4 business days',
    revisions: '1 included',
    notes: 'Multi-object migrations or multiple sources.',
  },
  {
    tier: 'Custom',
    price: 'Quoted',
    rows: '25,000+ rows',
    files: 'Unlimited',
    turnaround: 'Agreed in scope',
    revisions: 'Agreed in scope',
    notes: 'Ongoing engagements or bulk volume.',
  },
]

const FAQS = [
  {
    q: 'What if the output misses something in the brief?',
    a: "Request a revision. Describe specifically which acceptance criterion wasn't met. We have 24 hours to resubmit. If the revision still doesn't meet the brief, you can open a dispute for admin review — at which point we offer a partial or full refund depending on the shortfall.",
  },
  {
    q: 'Is my data processed by AI?',
    a: "Yes — we use an AI-assisted workflow to clean, normalize, and map your files. Your data is never used to train AI models, never shared with third-party AI services, and never retained beyond the job retention schedule.",
  },
  {
    q: 'Can my client see RelayOps branding anywhere?',
    a: "No. Deliverables are plain files — CSV, XLSX, or whatever format was specified. There's no RelayOps watermark on approved output. Your client relationship stays yours.",
  },
  {
    q: "What if I submit a bad brief and the scope doesn't match the actual work?",
    a: "If the admin scoping review reveals the job is more complex than submitted, you'll be offered a revised scope before invoicing. You can approve the new scope, revise your brief, or cancel with no charge.",
  },
  {
    q: "How long is my data retained after a job closes?",
    a: "Unpaid tickets: 7 days. Pilot jobs: 14 days. Completed jobs: 30 days. Disputed jobs: 90 days (for audit purposes). All files are deleted automatically after the retention window. You can request early deletion at any time.",
  },
]

export default function HowItWorksPage() {
  return (
    <MotionProvider>
      <div className="flex flex-col bg-[#FAFAFA] text-slate-900 font-sans">
        
        {/* HERO */}
        <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-28">
          <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06)_0%,transparent_70%)] pointer-events-none" />
          <div className="container relative max-w-4xl text-center">
            <FadeIn>
              <Badge className="rounded-full border border-slate-200/60 bg-white px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-widest text-slate-600 shadow-sm">
                Process
              </Badge>
              <h1 className="font-display mt-10 text-[3.5rem] font-bold tracking-tighter text-balance text-slate-900 md:text-7xl lg:leading-[1]">
                From Brief to Clean Data <br/> in 5 Steps.
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-lg font-normal leading-relaxed text-slate-500 md:text-xl">
                Every job follows the same structured process — scoped before it starts, reviewed
                before it closes.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="py-24 md:py-32 bg-white border-y border-slate-100">
          <div className="container max-w-6xl">
            <div className="grid gap-16 xl:grid-cols-[0.8fr_1.2fr]">
              <FadeIn>
                <div className="sticky top-32">
                  <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                    The Delivery Flow
                  </h2>
                  <p className="mt-6 text-[17px] font-normal leading-relaxed text-slate-500">
                    A fixed workflow designed to remove ambiguity. You know exactly what happens at each stage, and more importantly, when it's done.
                  </p>
                </div>
              </FadeIn>

              <StaggerList className="space-y-6">
                {STEPS.map((item) => {
                  const Icon = item.icon
                  return (
                    <StaggerItem key={item.step}>
                      <div className={cn(
                        `group relative overflow-hidden rounded-[32px] border border-slate-200/60 p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-shadow hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] md:p-10`,
                        item.accent,
                        item.highlight ? "ring-1 ring-blue-500/20" : ""
                      )}>
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                          <div className="flex items-center gap-4 sm:w-[140px] sm:shrink-0">
                            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", item.iconBg)}>
                              <Icon className={cn("h-5 w-5", item.iconColor)} />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-600">
                                {item.step}
                              </span>
                              <span className="text-[11px] font-medium text-slate-400">· {item.duration}</span>
                            </div>
                            <h3 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                              {item.title}
                            </h3>
                            <p className="mt-4 text-[15px] font-normal leading-relaxed text-slate-600">
                              {item.description}
                            </p>
                            
                            <div className="mt-8 flex items-start gap-3 rounded-2xl bg-slate-100/50 p-5">
                              <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 text-slate-400 mt-0.5" />
                              <p className="text-[13px] font-semibold text-slate-700">
                                Output: {item.deliverable}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  )
                })}
              </StaggerList>
            </div>
          </div>
        </section>

        {/* PRICING TIERS OVERVIEW */}
        <section className="py-24 md:py-32">
          <div className="container max-w-7xl">
            <FadeIn className="mb-16">
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl text-center">
                Job Categorization
              </h2>
            </FadeIn>

            <StaggerList className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {DELIVERABLE_TYPES.map((tier, index) => (
                <StaggerItem
                  key={tier.tier}
                  className={cn(
                    "flex flex-col rounded-[24px] border border-slate-200/60 bg-white p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-shadow hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)]",
                    index === 1 ? "ring-1 ring-blue-500/20 shadow-sm" : ""
                  )}
                >
                  <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    {tier.tier}
                  </p>
                  <p className="mt-4 font-display text-3xl font-bold tracking-tighter text-slate-900">
                    {tier.price}
                  </p>
                  
                  <div className="mt-8 space-y-4 text-[13px] font-medium text-slate-600 flex-1">
                    <p className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      {tier.rows}
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      {tier.files}
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      {tier.turnaround}
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      {tier.revisions}
                    </p>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <p className="text-[12px] leading-relaxed text-slate-500">{tier.notes}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        </section>

        {/* FAQS */}
        <section className="bg-white py-24 md:py-32 border-t border-slate-100">
          <div className="container max-w-3xl">
            <FadeIn>
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 md:text-4xl mb-16 text-center">
                Frequently Asked Questions
              </h2>
            </FadeIn>
            <StaggerList className="space-y-6">
              {FAQS.map((item) => (
                <StaggerItem
                  key={item.q}
                  className="rounded-[24px] border border-slate-200/60 bg-white p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-shadow hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)]"
                >
                  <h3 className="text-[17px] font-bold tracking-tight text-slate-900">{item.q}</h3>
                  <p className="mt-4 text-[15px] font-normal leading-relaxed text-slate-500">{item.a}</p>
                </StaggerItem>
              ))}
            </StaggerList>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 md:py-32">
          <div className="container max-w-5xl">
            <FadeIn className="rounded-[32px] bg-slate-900 px-10 py-16 text-center text-white shadow-[0_32px_64px_-16px_rgb(0,0,0,0.2)] md:px-16 md:py-24">
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                Ready to get started?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-[17px] font-normal leading-relaxed text-slate-400">
                Apply for partner access and have your portal set up within 2 business days.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-full bg-blue-600 px-8 text-[15px] font-medium text-white shadow-[0_8px_16px_rgb(59,130,246,0.2)] transition-transform hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  <Link href="/request-access">
                    Apply for partner access
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-14 rounded-full border-slate-700 bg-slate-800 px-8 text-[15px] font-medium text-white transition-transform hover:-translate-y-0.5 hover:bg-slate-700"
                >
                  <Link href="/pilot-sample">
                    Start with a Pilot
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
