import { WizardShell } from '@/components/forms/requirement-gate/wizard-shell'

export const metadata = {
  title: 'Submit a New Job — RelayOps',
}

export default function NewTicketPage() {
  return (
    <div className="dashboard-page-detail">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Submit a New Job</h1>
        <p className="text-muted-foreground mt-1">
          Complete the requirement wizard to submit your data operations request.
        </p>
      </div>
      <WizardShell />
    </div>
  )
}
