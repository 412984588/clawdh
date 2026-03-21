import Link from 'next/link'
import { Lock, Server, Users, Clock, FileText, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'

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
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-white border-b border-slate-100 py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center space-y-4">
          <Badge variant="secondary">Security & Privacy</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Your Client Data is Handled Seriously
          </h1>
          <p className="text-lg text-slate-600">
            Encrypted storage, fixed retention schedules, AI processing that never trains on
            your data, and automatic deletion on schedule.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="bg-white py-14">
        <div className="container mx-auto px-4 max-w-3xl space-y-14">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.title} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 pl-0">
                  {section.items.map((item) => (
                    <div
                      key={item.heading}
                      className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1.5"
                    >
                      <h3 className="text-sm font-semibold text-slate-900">
                        {item.heading}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Retention quick-reference */}
      <section className="bg-slate-50 border-y border-slate-200 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900 mb-5 text-center">
            Retention Schedule Quick Reference
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-white border border-slate-200">
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                    Job state
                  </th>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                    Retention
                  </th>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-700">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 border border-slate-200">
                {[
                  ['Unpaid / expired', '7 days', 'From ticket creation'],
                  ['Pilot (approved)', '14 days', 'From job close'],
                  ['Completed (standard)', '30 days', 'From approval'],
                  ['Disputed', '90 days', 'From dispute resolution'],
                ].map(([state, retention, notes]) => (
                  <tr key={state} className="bg-white">
                    <td className="px-4 py-3 font-medium text-slate-800">{state}</td>
                    <td className="px-4 py-3 text-blue-700 font-semibold">{retention}</td>
                    <td className="px-4 py-3 text-slate-500">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* DPA CTA */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center space-y-4">
          <Server className="h-8 w-8 text-blue-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Need a DPA?</h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            If you have an enterprise client that requires a Data Processing Agreement before
            you can share data with a sub-processor, we can provide one. Request it through
            your partner portal or contact us directly.
          </p>
          <Button asChild variant="outline">
            <Link href="/request-access">Apply for Partner Access</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
