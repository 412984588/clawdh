'use client'

import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Label } from '@/components/ui/label'

export interface EligibilityData {
  hasDataReady: 'yes' | 'no' | null
  canDescribeDone: 'yes' | 'no' | null
  rowCountOk: 'yes' | 'no' | 'unsure' | null
  isOneTime: 'yes' | 'no' | null
  hasSharePermission: 'yes' | 'no' | null
}

interface StepEligibilityProps {
  data: EligibilityData
  onChange: (data: EligibilityData) => void
}

// Key questions: show warning on No but allow continue (admin will review)
const CRITICAL_QUESTIONS = ['hasDataReady', 'canDescribeDone', 'hasSharePermission'] as const

const QUESTIONS = [
  {
    key: 'hasDataReady' as keyof EligibilityData,
    label: 'Do you have the raw data file ready to upload?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    warning: 'You will need to upload your data file before work can begin.',
  },
  {
    key: 'canDescribeDone' as keyof EligibilityData,
    label: 'Can you describe what "done" looks like in one sentence?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    warning: 'A clear definition of "done" is required to lock scope accurately.',
  },
  {
    key: 'rowCountOk' as keyof EligibilityData,
    label: 'Are there fewer than 50,000 rows in your dataset?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No — over 50,000 rows' },
      { value: 'unsure', label: "Not sure" },
    ],
    warning: 'Large datasets may require a custom quote. An admin will review your submission.',
  },
  {
    key: 'isOneTime' as keyof EligibilityData,
    label: 'Is this a one-time cleanup (not an ongoing sync or automation)?',
    options: [
      { value: 'yes', label: 'Yes, one-time' },
      { value: 'no', label: 'No, it is recurring' },
    ],
    warning: 'Ongoing sync requests are outside standard scope. An admin will review.',
  },
  {
    key: 'hasSharePermission' as keyof EligibilityData,
    label: 'Do you have permission to share this file with a vetted operator?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    warning: 'You must have authorization to share this data before submitting.',
  },
]

export function StepEligibility({ data, onChange }: StepEligibilityProps) {
  const hasWarnings = QUESTIONS.some((q) => {
    const val = data[q.key]
    const isCritical = CRITICAL_QUESTIONS.includes(q.key as (typeof CRITICAL_QUESTIONS)[number])
    return isCritical && val === 'no'
  })

  function handleChange(key: keyof EligibilityData, value: string) {
    onChange({ ...data, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Eligibility Check</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Answer these questions to confirm your request is suitable for this service.
        </p>
      </div>

      {QUESTIONS.map((question, idx) => {
        const currentValue = data[question.key] as string | null
        const showWarning =
          currentValue === 'no' ||
          (question.key === 'rowCountOk' && (currentValue === 'no' || currentValue === 'unsure'))

        return (
          <div key={question.key} className="space-y-2">
            <Label className="text-sm font-medium">
              {idx + 1}. {question.label}
            </Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {question.options.map((opt) => {
                const selected = currentValue === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange(question.key, opt.value)}
                    className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input hover:bg-muted'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
            {showWarning && question.warning && (
              <div className="flex items-start gap-2 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2 mt-1">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-xs text-yellow-800">{question.warning}</p>
              </div>
            )}
            {currentValue === 'yes' && (
              <div className="flex items-center gap-1.5 text-xs text-green-700 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Good to go
              </div>
            )}
          </div>
        )
      })}

      {hasWarnings && (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3">
          <p className="text-sm text-yellow-800 font-medium">
            Some answers may require admin review.
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            You can still submit — an admin will assess whether this request qualifies.
          </p>
        </div>
      )}
    </div>
  )
}
