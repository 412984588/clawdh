'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { createAndSubmitTicket } from '@/lib/actions/ticket.actions'
import { StepEligibility, type EligibilityData } from './step-eligibility'
import { StepDataSource, type DataSourceData } from './step-data-source'
import { StepScope, type ScopeData } from './step-scope'
import { StepDeliverables, type DeliverablesData } from './step-deliverables'
import { StepReview } from './step-review'

export interface WizardFormData {
  eligibility: EligibilityData
  dataSource: DataSourceData
  scope: ScopeData
  deliverables: DeliverablesData
}

const STEPS = [
  { label: 'Eligibility', index: 1 },
  { label: 'Data Source', index: 2 },
  { label: 'Scope', index: 3 },
  { label: 'Deliverables', index: 4 },
  { label: 'Review', index: 5 },
]

const INITIAL_DATA: WizardFormData = {
  eligibility: {
    hasDataReady: null,
    canDescribeDone: null,
    rowCountOk: null,
    isOneTime: null,
    hasSharePermission: null,
  },
  dataSource: {
    crmType: '',
    rowCountEstimate: '',
    fileCountEstimate: '',
    fieldsAffected: [],
    sensitivity: 'standard',
  },
  scope: {
    problemSummary: '',
    expectedOutput: '',
    outOfScope: [],
  },
  deliverables: {
    category: '',
    title: '',
    acceptanceCriteria: [],
  },
}

function validateStep(step: number, data: WizardFormData): string | null {
  if (step === 1) {
    // Eligibility check: all questions must be answered (yes not enforced)
    const { eligibility } = data
    if (
      !eligibility.hasDataReady ||
      !eligibility.canDescribeDone ||
      !eligibility.rowCountOk ||
      !eligibility.isOneTime ||
      !eligibility.hasSharePermission
    ) {
      return 'Please answer all eligibility questions before continuing.'
    }
    return null
  }

  if (step === 2) {
    if (!data.dataSource.crmType) return 'Please select a CRM platform.'
    return null
  }

  if (step === 3) {
    if (data.scope.problemSummary.length < 50)
      return 'Problem summary must be at least 50 characters.'
    if (data.scope.expectedOutput.length < 30)
      return 'Expected output must be at least 30 characters.'
    return null
  }

  if (step === 4) {
    if (!data.deliverables.category) return 'Please select a job category.'
    if (data.deliverables.title.length < 5) return 'Job title must be at least 5 characters.'
    if (data.deliverables.acceptanceCriteria.length === 0)
      return 'Add at least one acceptance criterion.'
    return null
  }

  return null
}

export function WizardShell() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_DATA)
  const [confirmed, setConfirmed] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successTicketId, setSuccessTicketId] = useState<string | null>(null)

  const totalSteps = STEPS.length
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100

  function goNext() {
    const error = validateStep(currentStep, formData)
    if (error) {
      setValidationError(error)
      return
    }
    setValidationError(null)
    setCurrentStep((s) => Math.min(s + 1, totalSteps))
  }

  function goBack() {
    setValidationError(null)
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  async function handleSubmit() {
    if (!confirmed) {
      setValidationError('Please confirm the scope before submitting.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    // Map wizard data to ticketCreateSchema format
    const payload = {
      title: formData.deliverables.title,
      category: formData.deliverables.category,
      problem_summary: formData.scope.problemSummary,
      expected_output: formData.scope.expectedOutput,
      acceptance_criteria_json: formData.deliverables.acceptanceCriteria,
      out_of_scope_json: formData.scope.outOfScope,
      sensitivity_level: formData.dataSource.sensitivity,
      row_count_estimate: formData.dataSource.rowCountEstimate
        ? parseInt(formData.dataSource.rowCountEstimate)
        : undefined,
      file_count_estimate: formData.dataSource.fileCountEstimate
        ? parseInt(formData.dataSource.fileCountEstimate)
        : undefined,
    }

    const result = await createAndSubmitTicket(payload)
    setIsSubmitting(false)

    if (!result.success) {
      setSubmitError(
        typeof result.error === 'string'
          ? result.error
          : 'Validation failed — please review your inputs.'
      )
      return
    }

    setSuccessTicketId(result.data?.ticketId ?? null)
  }

  // Success state
  if (successTicketId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h2 className="text-xl font-semibold">Job Submitted!</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your job has been submitted for review. An admin will assess the scope and follow up
          shortly.
        </p>
        <div className="flex gap-3 mt-2">
          <Button onClick={() => router.push(`/partner/tickets/${successTicketId}`)}>
            View Ticket
          </Button>
          <Button variant="outline" onClick={() => router.push('/partner/tickets')}>
            All Tickets
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          {STEPS.map((step) => (
            <span
              key={step.index}
              className={`font-medium ${currentStep >= step.index ? 'text-foreground' : ''}`}
            >
              {step.label}
            </span>
          ))}
        </div>
        <Progress
          value={progressPercent}
          className="h-1.5"
          aria-label={`Submission progress: step ${currentStep} of ${totalSteps}`}
        />
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Step content */}
      <div className="rounded-lg border bg-card p-6">
        {currentStep === 1 && (
          <StepEligibility
            data={formData.eligibility}
            onChange={(eligibility) => setFormData((d) => ({ ...d, eligibility }))}
          />
        )}
        {currentStep === 2 && (
          <StepDataSource
            data={formData.dataSource}
            onChange={(dataSource) => setFormData((d) => ({ ...d, dataSource }))}
          />
        )}
        {currentStep === 3 && (
          <StepScope
            data={formData.scope}
            onChange={(scope) => setFormData((d) => ({ ...d, scope }))}
          />
        )}
        {currentStep === 4 && (
          <StepDeliverables
            data={formData.deliverables}
            onChange={(deliverables) => setFormData((d) => ({ ...d, deliverables }))}
          />
        )}
        {currentStep === 5 && (
          <StepReview
            data={formData}
            confirmed={confirmed}
            onConfirmedChange={setConfirmed}
          />
        )}
      </div>

      {/* Validation / submit errors */}
      {validationError && (
        <p className="text-sm text-destructive" role="alert">{validationError}</p>
      )}
      {submitError && (
        <p className="text-sm text-destructive" role="alert">{submitError}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={goNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting || !confirmed}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting…
              </>
            ) : (
              'Submit Job'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
