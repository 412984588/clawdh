import Link from 'next/link'
import { createPublicMetadata, publicPageDefinitions } from '@/lib/seo'

export const metadata = createPublicMetadata(publicPageDefinitions.terms)

export default function TermsPage() {
  return (
    <div className="bg-white py-14 md:py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="space-y-2 mb-10">
          <p className="text-sm text-slate-500">Last updated: January 2025</p>
          <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
          <p className="text-slate-600">
            By accessing or using RelayOps, you agree to these terms. Please read them
            carefully before submitting any work or data.
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">1. Service Description</h2>
            <p>
              RelayOps provides white-label CRM data cleanup and import preparation services
              to partner agencies ("Partners"). Services include data deduplication, field
              normalization, format standardization, and import failure diagnosis on datasets
              submitted through the Partner portal.
            </p>
            <p>
              RelayOps is a fulfillment layer. Partners contract directly with their own
              clients and are responsible for all representations made to those clients.
              RelayOps is not a party to partner–client agreements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">2. Eligibility & Partner Accounts</h2>
            <p>
              Partner access is application-only and subject to approval at RelayOps's sole
              discretion. Accounts are non-transferable. You are responsible for all activity
              under your account.
            </p>
            <p>
              RelayOps reserves the right to suspend or terminate accounts that violate these
              terms, submit fraudulent or harmful content, or engage in abuse of the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">3. Payment Terms</h2>
            <p>
              All jobs are invoiced before work begins. Work starts only after invoice
              payment is confirmed. Invoices are issued via Stripe and payable by credit
              card or ACH.
            </p>
            <p>
              Prices shown are in USD. RelayOps reserves the right to adjust pricing for
              future jobs with reasonable notice. Pricing for a job, once invoiced, is fixed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">4. Refunds & Disputes</h2>
            <p>
              Refund eligibility depends on job status at the time of the request. For full
              details, see our{' '}
              <Link href="/refund-policy" className="text-blue-600 hover:underline">
                Refund Policy
              </Link>
              . In summary:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Paid but not yet assigned: 100% refund.</li>
              <li>
                Submission exists: revision first, then dispute process if revision
                doesn't resolve the issue.
              </li>
              <li>
                Dispute outcomes range from 0%–100% refund based on admin review of
                whether the scope was fulfilled.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">5. Data Handling</h2>
            <p>
              All data submitted to RelayOps is processed solely for the purpose of
              completing the requested job. Files are stored encrypted and deleted according
              to the published{' '}
              <Link href="/security" className="text-blue-600 hover:underline">
                retention schedule
              </Link>
              .
            </p>
            <p>
              Data is processed through our AI-assisted workflow. Client data is
              never used for AI training or shared with third parties for any purpose
              unrelated to job completion.
            </p>
            <p>
              Partners warrant that they have authority to submit the data they provide and
              have obtained any necessary consents from their clients.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">6. Acceptable Use</h2>
            <p>You agree not to submit data that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Contains unlawfully obtained personal information.</li>
              <li>
                Is subject to export controls or sanctions without appropriate authorizations.
              </li>
              <li>Infringes third-party intellectual property rights.</li>
              <li>Is intended to be used for illegal purposes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">
              7. Limitation of Liability
            </h2>
            <p>
              RelayOps's total liability for any claim arising from use of the platform is
              limited to the amount paid for the specific job giving rise to the claim.
            </p>
            <p>
              RelayOps is not liable for indirect, incidental, or consequential damages,
              including lost profits, lost data (beyond our retention obligations), or
              business interruption. Some jurisdictions do not allow limitation of consequential
              damages; this limitation applies to the maximum extent permitted by applicable law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">8. Intellectual Property</h2>
            <p>
              You retain all rights to the data you submit. Deliverables produced by
              RelayOps from your data are owned by you upon payment and job completion.
            </p>
            <p>
              RelayOps retains ownership of the platform, portal, and any proprietary
              tooling. Nothing in these terms grants you a license to the RelayOps brand,
              name, or marks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">9. Modifications</h2>
            <p>
              RelayOps may update these terms from time to time. Material changes will be
              communicated via email or in-portal notice. Continued use of the service after
              the effective date of changes constitutes acceptance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">10. Governing Law</h2>
            <p>
              These terms are governed by the laws of the state in which RelayOps is
              incorporated, without regard to conflict of law provisions. Any disputes shall
              be resolved in the courts of that jurisdiction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
            <p>
              Questions about these terms? Contact us through your partner portal or at
              the email address on file for your account.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
