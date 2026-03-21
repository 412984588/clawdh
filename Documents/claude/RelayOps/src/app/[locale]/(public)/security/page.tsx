import Link from 'next/link'
import { Lock, Server, Users, Clock, FileText, Globe, ArrowRight } from 'lucide-react'
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

export const metadata = createPublicMetadata(publicPageDefinitions.security)

const SECTIONS = [
  {
    icon: Lock,
    title: 'File Storage & Access',
    items: [
      {
        heading: 'Encrypted at rest',
        body: 'All uploaded files are stored encrypted in cloud object storage. Files are never publicly accessible.',
      },
      {
        heading: 'Signed URLs only',
        body: 'Access to files is granted via time-limited signed URLs. Partners never receive permanent download links.',
      },
      {
        heading: 'AI-assisted — not AI-trained',
        body: "Your data is processed through our AI-assisted workflow to clean, normalize, and map your files. It is never used to train AI models, never shared with third-party AI services, and never retained beyond the job retention schedule.",
      },
      {
        heading: 'Transmission security',
        body: 'All data in transit uses TLS 1.2+. The partner portal and all API endpoints enforce HTTPS.',
      },
    ],
  },
  {
    icon: Clock,
    title: 'Data Retention Schedule',
    items: [
      {
        heading: 'Unpaid tickets — 7 days',
        body: 'If a scoped ticket is never paid, all associated files are automatically deleted after 7 days.',
      },
      {
        heading: 'Pilot jobs — 14 days',
        body: 'After a pilot job closes (approved or expired), files are retained for 14 days then permanently deleted.',
      },
      {
        heading: 'Completed jobs — 30 days',
        body: 'After a standard job is approved, deliverables and input files are retained for 30 days to allow re-download, then deleted.',
      },
      {
        heading: 'Disputed jobs — 90 days',
        body: "During an open dispute, files are retained for the duration. After resolution, the 90-day audit window begins. Files are deleted at the 90-day mark regardless of outcome.",
      },
      {
        heading: 'Early deletion on request',
        body: 'Partners can request early deletion of files for any closed job at any time through their portal or by contacting support.',
      },
    ],
  },
  {
    icon: Users,
    title: 'AI Processing & Privacy',
    items: [
      {
        heading: 'Never used for AI training',
        body: 'Your data is never used to train, fine-tune, or improve any AI model — ours or anyone else\'s. Each job is processed in isolation and deleted on schedule.',
      },
      {
        heading: 'No third-party AI services',
        body: 'Data is not passed to external AI APIs or shared with third-party machine learning platforms. Processing stays within our controlled infrastructure.',
      },
      {
        heading: 'Scoped processing only',
        body: 'The AI workflow operates strictly within the acceptance criteria defined in your job brief. No out-of-scope columns are touched, no undocumented changes are made.',
      },
      {
        heading: 'Automated quality checks',
        body: 'Output is validated against the original brief before delivery. Delivery summaries document exactly what was changed, so you can verify the work independently.',
      },
    ],
  },
  {
    icon: FileText,
    title: 'DPA & Compliance',
    items: [
      {
        heading: 'Data Processing Agreement (DPA)',
        body: 'A DPA is available on request for partners who need one for enterprise clients. Contact us to initiate the request from your partner portal.',
      },
      {
        heading: 'GDPR & CCPA considerations',
        body: 'RelayOps processes data only for the purposes specified in job briefs. Data is not retained beyond the retention schedule. Partners remain the data controller for their client data.',
      },
      {
        heading: 'No sub-processors outside the stack',
        body: 'Client data is processed within our AI-assisted workflow and stored in our infrastructure. Data is not shared with third-party analytics, advertising, or AI training services.',
      },
    ],
  },
  {
    icon: Globe,
    title: 'Company Structure',
    items: [
      {
        heading: 'US-based company',
        body: "RelayOps is a US-incorporated company. Partner agreements and terms are governed by US law. Data infrastructure is located in US-region cloud providers.",
      },
      {
        heading: 'AI-assisted workflow',
        body: 'Cleaning work is performed by our AI-assisted processing pipeline within a controlled environment. Data never leaves our infrastructure and is deleted automatically on schedule.',
      },
    ],
  },
]

export default function SecurityPage() {
  return (
    <MotionProvider>
      <div className="flex flex-col bg-[#FAFAFA] font-sans text-slate-900">
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-20 md:pt-40 md:pb-32 bg-slate-900 text-white">
          <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="container relative mx-auto px-4 max-w-4xl text-center">
            <FadeIn>
              <Badge className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-widest text-blue-200">
                Security & Privacy
              </Badge>
              <h1 className="font-display mt-8 text-[3.5rem] font-bold tracking-tighter text-balance md:text-7xl lg:leading-[1.05]">
                Handled with Care.
              </h1>
              <p className="mx-auto mt-8 max-w-2xl text-lg font-normal leading-relaxed text-slate-400 md:text-xl">
                Encrypted storage, fixed retention schedules, AI processing that never trains on
                your data, and automatic deletion on schedule.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Sections */}
        <section className="bg-white py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-5xl">
            <StaggerList className="space-y-24">
              {SECTIONS.map((section) => {
                const Icon = section.icon
                return (
                  <StaggerItem key={section.title} className="space-y-10">
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900">
                        {section.title}
                      </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-8">
                      {section.items.map((item) => (
                        <div
                          key={item.heading}
                          className="bg-[#FAFAFA] rounded-[24px] border border-slate-200/60 p-8 transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                        >
                          <h3 className="text-[17px] font-bold tracking-tight text-slate-900">
                            {item.heading}
                          </h3>
                          <p className="mt-4 text-[15px] text-slate-600 leading-relaxed font-normal">{item.body}</p>
                        </div>
                      ))}
                    </div>
                  </StaggerItem>
                )
              })}
            </StaggerList>
          </div>
        </section>

        {/* Retention quick-reference */}
        <section className="bg-white border-y border-slate-100 py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-4xl">
            <FadeIn>
              <div className="mb-16 text-center">
                <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-4">
                  Reference
                </p>
                <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900">
                  Retention Schedule
                </h2>
              </div>
              <div className="overflow-hidden rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/60">
                        <th className="text-left px-8 py-6 font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">
                          Job state
                        </th>
                        <th className="text-left px-8 py-6 font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">
                          Retention
                        </th>
                        <th className="text-left px-8 py-6 font-mono text-[10px] font-medium uppercase tracking-widest text-slate-400">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        ['Unpaid / expired', '7 days', 'From ticket creation'],
                        ['Pilot (approved)', '14 days', 'From job close'],
                        ['Completed (standard)', '30 days', 'From approval'],
                        ['Disputed', '90 days', 'From dispute resolution'],
                      ].map(([state, retention, notes]) => (
                        <tr key={state} className="bg-white transition-colors hover:bg-slate-50/50">
                          <td className="px-8 py-6 text-[15px] font-bold text-slate-900">{state}</td>
                          <td className="px-8 py-6 text-[15px] text-blue-600 font-bold">{retention}</td>
                          <td className="px-8 py-6 text-[14px] text-slate-500">{notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* DPA CTA */}
        <section className="bg-white py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-4xl">
            <SlideUp>
              <div className="rounded-[32px] bg-slate-900 p-12 text-center text-white shadow-[0_32px_64px_-16px_rgb(0,0,0,0.2)] md:p-20">
                <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-10 border border-white/10 shadow-inner">
                  <Server className="h-8 w-8 text-blue-400" />
                </div>
                <h2 className="font-display text-4xl font-bold tracking-tight mb-8">Need a DPA?</h2>
                <p className="text-slate-400 text-[17px] font-normal leading-relaxed max-w-2xl mx-auto mb-12">
                  If you have an enterprise client that requires a Data Processing Agreement before
                  you can share data with a sub-processor, we can provide one. Request it through
                  your partner portal or contact us directly.
                </p>
                <Button asChild size="lg" className="h-14 rounded-full bg-blue-600 px-10 text-[15px] font-medium text-white shadow-[0_8px_16px_rgb(59,130,246,0.2)] transition-transform hover:-translate-y-0.5 hover:bg-blue-700">
                  <Link href="/request-access">
                    Apply for Partner Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </SlideUp>
          </div>
        </section>
      </div>
    </MotionProvider>
  )
}
