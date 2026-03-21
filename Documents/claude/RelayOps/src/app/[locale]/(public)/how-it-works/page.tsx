import Link from 'next/link'
import Script from 'next/script'
import {
  CheckSquare,
  ChevronDown,
  CreditCard,
  FileText,
  Search,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'

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
    accent: 'border-t-amber-500',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-300',
  },
  {
    icon: Search,
    step: 'Step 2',
    title: 'Admin Scopes Your Job',
    duration: 'Same business day',
    description:
      "A RelayOps admin reviews your brief, categorizes the work (cleanup, normalization, or diagnosis), and assigns a pricing tier. Standard jobs are quoted at a flat rate. Complex jobs are quoted individually. You'll see the scope and price before any work starts.",
    deliverable: 'You receive a fixed-price invoice via Stripe.',
    accent: 'border-t-amber-600',
    iconBg: 'bg-amber-600/10',
    iconColor: 'text-amber-200',
  },
  {
    icon: CreditCard,
    step: 'Step 3',
    title: 'Approve the Invoice',
    duration: "When you're ready",
    description:
      'Pay the invoice through your partner portal. Once payment is confirmed, the job enters the queue. No payment, no start — this protects both parties and keeps the pipeline predictable.',
    deliverable: 'Job status moves to Queued.',
    accent: 'border-t-sky-500',
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-300',
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
    accent: 'border-t-emerald-500',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-300',
  },
  {
    icon: CheckSquare,
    step: 'Step 5',
    title: 'You Review & Accept',
    duration: '72-hour review window',
    description:
      "Download the deliverable and check it against the acceptance criteria. If it meets the brief: approve and the job closes. If something's off: request one revision with specific notes. If there's a genuine shortfall: open a dispute for admin review.",
    deliverable: 'Approved deliverable ready to deliver to your client.',
    accent: 'border-t-amber-500',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-300',
  },
]

const DELIVERABLE_TYPES = [
  {
    tier: 'Pilot',
    price: '$149 flat',
    rows: 'Up to 500 rows',
    files: '1 file',
    turnaround: '2 business days',
    revisions: 'None (preview output)',
    notes: 'One per organization. Watermarked output — for evaluating our format before committing.',
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
    notes: 'Multi-object migrations, complex deduplication logic, or multiple source systems. Advanced multi-system work (15,000+ rows) from $1,499.',
  },
  {
    tier: 'Custom',
    price: 'Quoted',
    rows: '25,000+ rows',
    files: 'Unlimited',
    turnaround: 'Agreed in scope',
    revisions: 'Agreed in scope',
    notes: 'Ongoing engagements, bulk volume, or unusual complexity. Projects from $2,500; monthly retainers from $3,000.',
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
    <div className="flex flex-col bg-white">
      <section className="relative overflow-hidden bg-zinc-950 py-20 text-white md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.28),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(180,83,9,0.16),transparent_24%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <Badge className="rounded-full border border-amber-500/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200 hover:bg-white/10">
                Process
              </Badge>
              <h1 className="mt-8 text-5xl font-black tracking-[-0.08em] text-balance text-white md:text-7xl lg:leading-[0.96]">
                From Brief to Clean Data in 5 Steps
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-300 md:text-xl">
                Every job follows the same structured process — scoped before it starts, reviewed
                before it closes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="container">
          <div className="grid gap-6 xl:grid-cols-[0.7fr_1fr]">
            <div
              data-reveal
              className="opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
                Timeline
              </p>
              <h2 className="mt-5 max-w-lg text-4xl font-black tracking-[-0.06em] text-zinc-950 text-balance md:text-5xl">
                The five-step process from brief to clean, import-ready CRM data.
              </h2>
            </div>

            <div className="space-y-5">
              {STEPS.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.step}
                    data-reveal
                    className="opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className={`rounded-[2rem] border border-zinc-200 border-t-4 ${item.accent} bg-white p-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_30px_70px_-36px_rgba(180,83,9,0.18)]`}>
                      <div className="flex flex-col gap-5 sm:flex-row">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.iconBg}`}>
                            <Icon className={`h-6 w-6 ${item.iconColor}`} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                              {item.step}
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">{item.duration}</p>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold tracking-[-0.04em] text-zinc-950">
                            {item.title}
                          </h3>
                          <p className="mt-3 text-base leading-7 text-zinc-600">
                            {item.description}
                          </p>
                          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                            <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 -rotate-90 text-emerald-500" />
                            <p className="text-sm font-medium text-zinc-700">{item.deliverable}</p>
                          </div>
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(180,83,9,0.22),transparent_38%)]" />
        <div className="container relative">
          <div
            data-reveal
            className="mx-auto max-w-2xl text-center opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
              Pricing Tiers
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.06em] text-white text-balance md:text-5xl">
              Pricing Tiers
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-300">
              All prices are per job. Volume agreements available for partners with predictable monthly flow.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {DELIVERABLE_TYPES.map((tier, index) => (
              <div
                key={tier.tier}
                data-reveal
                className={`rounded-[2rem] border p-6 opacity-0 translate-y-6 transition-all duration-300 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
                  index === 1
                    ? 'border-amber-500/40 bg-gradient-to-b from-amber-700/18 via-zinc-900 to-zinc-950 shadow-[0_30px_90px_-44px_rgba(180,83,9,0.6)] hover:-translate-y-1 hover:shadow-[0_36px_110px_-38px_rgba(180,83,9,0.7)]'
                    : 'border-white/10 bg-white/5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.82)] hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_28px_70px_-34px_rgba(180,83,9,0.25)]'
                }`}
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-400">
                  {tier.tier}
                </p>
                <p className="mt-4 text-4xl font-black tracking-[-0.06em] text-white">
                  {tier.price}
                </p>
                <div className="mt-5 space-y-3 text-sm leading-6 text-zinc-300">
                  <p>{tier.rows}</p>
                  <p>{tier.files}</p>
                  <p>{tier.turnaround}</p>
                  <p>{tier.revisions}</p>
                </div>
                <p className="mt-5 text-sm leading-6 text-zinc-400">{tier.notes}</p>
              </div>
            ))}
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
              Frequently Asked Questions
            </p>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.06em] text-zinc-950 text-balance md:text-5xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="mx-auto mt-14 max-w-4xl space-y-5">
            {FAQS.map((item, index) => (
              <div
                key={item.q}
                data-reveal
                className="rounded-[2rem] border border-zinc-200 bg-white p-7 opacity-0 translate-y-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.18)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_30px_70px_-36px_rgba(180,83,9,0.18)] motion-reduce:translate-y-0 motion-reduce:opacity-100"
                style={{ transitionDelay: `${index * 90}ms` }}
              >
                <h3 className="text-xl font-bold tracking-[-0.03em] text-zinc-950">{item.q}</h3>
                <p className="mt-4 text-base leading-7 text-zinc-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-zinc-950 py-20 text-white md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(180,83,9,0.22),transparent_36%)]" />
        <div className="container relative text-center">
          <div
            data-reveal
            className="mx-auto max-w-3xl opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100"
          >
            <h2 className="text-4xl font-black tracking-[-0.06em] text-balance md:text-5xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg leading-8 text-zinc-300">
              Apply for partner access and have your portal set up within 2 business days.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full border border-amber-600/40 bg-amber-700 px-7 text-white shadow-[0_24px_44px_-20px_rgba(180,83,9,0.7)] transition-all duration-300 hover:-translate-y-1 hover:bg-amber-600 hover:shadow-[0_34px_55px_-18px_rgba(180,83,9,0.75)]"
              >
                <Link href="/request-access">Apply for partner access</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="rounded-full border border-white/15 bg-white/5 px-7 text-white transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10"
              >
                <Link href="/pilot-sample">Start with a Pilot</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Script id="relayops-process-motion" strategy="afterInteractive">{`
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
