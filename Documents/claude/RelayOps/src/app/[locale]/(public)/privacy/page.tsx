import Link from 'next/link'
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'

export const metadata = createPublicMetadata(publicPageDefinitions.privacy)

export default function PrivacyPage() {
  return (
    <div className="bg-white py-14 md:py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="space-y-2 mb-10">
          <p className="text-sm text-slate-500">Last updated: January 2025</p>
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="text-slate-600">
            This policy describes what information RelayOps collects, how we use it, and the
            rights you have over your data.
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">1. Information We Collect</h2>
            <p>
              <strong>Account information:</strong> Name, email address, company name, website,
              and country when you apply for or maintain a partner account.
            </p>
            <p>
              <strong>Job data:</strong> Files, briefs, and any other content you submit as
              part of a job ticket. This data belongs to you (or your clients) and is processed
              only to fulfill the job.
            </p>
            <p>
              <strong>Usage data:</strong> Standard web server logs including IP addresses,
              browser type, pages viewed, and actions taken in the portal. Used for security
              monitoring and platform improvement.
            </p>
            <p>
              <strong>Payment information:</strong> Payment processing is handled by Stripe.
              RelayOps does not store raw card numbers. We receive confirmation of payment and
              limited billing details (last 4 digits, card type, billing name) from Stripe.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">2. How We Use Information</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To create and manage your partner account.</li>
              <li>To fulfill job tickets you submit.</li>
              <li>To communicate about job status, billing, and support.</li>
              <li>To detect and prevent fraud and abuse.</li>
              <li>To comply with legal obligations.</li>
            </ul>
            <p>
              We do not use your data or your clients' data for advertising, marketing to
              third parties, or AI model training.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">3. Data Retention</h2>
            <p>
              Account information is retained for the duration of your active account, plus
              a reasonable period afterward for legal and audit purposes.
            </p>
            <p>
              Job data (files uploaded as part of tickets) is retained according to the
              schedule documented on the{' '}
              <Link href="/security" className="text-blue-600 hover:underline">
                Security page
              </Link>
              : 7 days for unpaid tickets, 14 days for pilot jobs, 30 days for completed
              jobs, and 90 days for disputed jobs. Files are automatically deleted at the
              end of the applicable window.
            </p>
            <p>
              You may request deletion of specific job files before their scheduled
              deletion window through your partner portal.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">4. How We Share Information</h2>
            <p>
              <strong>Processing:</strong> Your files and brief are accessed by our
              AI-assisted workflow via time-limited signed URLs within our controlled
              infrastructure. Your contact information and your client's identity are not
              used in processing.
            </p>
            <p>
              <strong>Service providers:</strong> We use a small set of infrastructure
              providers (cloud storage, payment processing, email). These providers process
              data on our behalf under data processing agreements.
            </p>
            <p>
              <strong>Legal requirements:</strong> We may disclose information if required to
              do so by law, court order, or to protect the rights, property, or safety of
              RelayOps, our users, or the public.
            </p>
            <p>
              We do not sell personal information. We do not share personal information with
              third parties for their own marketing purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">5. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate personal information.</li>
              <li>Request deletion of your personal information.</li>
              <li>Object to processing or request restriction of processing.</li>
              <li>
                Request data portability (receive your data in a structured, machine-readable
                format).
              </li>
            </ul>
            <p>
              To exercise these rights, contact us through your partner portal. We will
              respond within 30 days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">6. Cookies</h2>
            <p>
              The RelayOps portal uses session cookies for authentication. We do not use
              tracking cookies, third-party analytics cookies, or advertising cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">7. Security</h2>
            <p>
              We implement reasonable technical and organizational measures to protect
              personal information. However, no internet transmission is completely secure.
              For details on our specific security practices, see the{' '}
              <Link href="/security" className="text-blue-600 hover:underline">
                Security page
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">8. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of material
              changes via email or in-portal notice. The "Last updated" date at the top of
              this page reflects the most recent revision.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">9. Contact</h2>
            <p>
              Privacy questions or requests can be submitted through your partner portal or
              sent to the contact email on file for your account.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
