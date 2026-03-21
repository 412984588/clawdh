'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import {
  partnerApplicationSchema,
  type PartnerApplicationInput,
} from '@/lib/validations/partner'
import { submitPartnerApplication } from '@/lib/actions/partner.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils/cn'

const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Netherlands',
  'Other',
]

export function PartnerApplicationForm() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PartnerApplicationInput>({
    resolver: zodResolver(partnerApplicationSchema),
    defaultValues: {
      monthly_ticket_estimate: 5,
    },
  })

  const agreementChecked = watch('data_handling_agreement')
  const monthlyEstimateDescribedBy = [
    'monthly_ticket_estimate-hint',
    errors.monthly_ticket_estimate ? 'monthly_ticket_estimate-error' : null,
  ]
    .filter(Boolean)
    .join(' ')
  const agreementDescribedBy = errors.data_handling_agreement
    ? 'data_handling_agreement-error'
    : undefined

  async function onSubmit(data: PartnerApplicationInput) {
    setServerError(null)
    const result = await submitPartnerApplication(data)

    if (!result.success) {
      if (typeof result.error === 'string') {
        setServerError(result.error)
      } else {
        setServerError('Please review the errors below and try again.')
      }
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-green-600" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900">Application received!</h3>
        <p className="text-slate-600 max-w-sm">
          We review all applications within 2 business days. You'll receive an email at the
          address you provided once your account is ready.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="first_name">First name</Label>
          <Input
            id="first_name"
            placeholder="Jane"
            {...register('first_name')}
            className={cn(errors.first_name && 'border-red-400')}
            aria-required="true"
            aria-invalid={!!errors.first_name}
            aria-describedby={errors.first_name ? 'first_name-error' : undefined}
          />
          {errors.first_name && (
            <p id="first_name-error" role="alert" className="text-xs text-red-500">{errors.first_name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="last_name">Last name</Label>
          <Input
            id="last_name"
            placeholder="Smith"
            {...register('last_name')}
            className={cn(errors.last_name && 'border-red-400')}
            aria-required="true"
            aria-invalid={!!errors.last_name}
            aria-describedby={errors.last_name ? 'last_name-error' : undefined}
          />
          {errors.last_name && (
            <p id="last_name-error" role="alert" className="text-xs text-red-500">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          type="email"
          placeholder="jane@agency.com"
          {...register('email')}
          className={cn(errors.email && 'border-red-400')}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Company */}
      <div className="space-y-1.5">
        <Label htmlFor="company_name">Company name</Label>
        <Input
          id="company_name"
          placeholder="Acme RevOps LLC"
          {...register('company_name')}
          className={cn(errors.company_name && 'border-red-400')}
          aria-required="true"
          aria-invalid={!!errors.company_name}
          aria-describedby={errors.company_name ? 'company_name-error' : undefined}
        />
        {errors.company_name && (
          <p id="company_name-error" role="alert" className="text-xs text-red-500">{errors.company_name.message}</p>
        )}
      </div>

      {/* Website + Country row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="website">
            Website <span className="text-slate-400 font-normal">(optional)</span>
          </Label>
          <Input
            id="website"
            placeholder="https://agency.com"
            {...register('website')}
            className={cn(errors.website && 'border-red-400')}
            aria-invalid={!!errors.website}
            aria-describedby={errors.website ? 'website-error' : undefined}
          />
          {errors.website && (
            <p id="website-error" role="alert" className="text-xs text-red-500">{errors.website.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <select
            id="country"
            {...register('country')}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              errors.country && 'border-red-400'
            )}
            aria-required="true"
            aria-invalid={!!errors.country}
            aria-describedby={errors.country ? 'country-error' : undefined}
          >
            <option value="">Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.country && (
            <p id="country-error" role="alert" className="text-xs text-red-500">{errors.country.message}</p>
          )}
        </div>
      </div>

      {/* Service focus */}
      <div className="space-y-1.5">
        <Label htmlFor="service_focus">What kind of CRM work do you handle?</Label>
        <Textarea
          id="service_focus"
          placeholder="e.g. We run HubSpot onboarding for mid-market B2B SaaS companies — 80% of our work is import prep and list segmentation..."
          rows={4}
          {...register('service_focus')}
          className={cn(errors.service_focus && 'border-red-400')}
          aria-required="true"
          aria-invalid={!!errors.service_focus}
          aria-describedby={errors.service_focus ? 'service_focus-error' : undefined}
        />
        {errors.service_focus && (
          <p id="service_focus-error" role="alert" className="text-xs text-red-500">{errors.service_focus.message}</p>
        )}
      </div>

      {/* Monthly estimate */}
      <div className="space-y-1.5">
        <Label htmlFor="monthly_ticket_estimate">
          Estimated datasets per month
        </Label>
        <Input
          id="monthly_ticket_estimate"
          type="number"
          min={1}
          max={1000}
          placeholder="5"
          {...register('monthly_ticket_estimate')}
          className={cn(errors.monthly_ticket_estimate && 'border-red-400')}
          aria-required="true"
          aria-invalid={!!errors.monthly_ticket_estimate}
          aria-describedby={monthlyEstimateDescribedBy}
        />
        <p id="monthly_ticket_estimate-hint" className="text-xs text-slate-500">
          Rough estimate is fine — helps us plan capacity for your team.
        </p>
        {errors.monthly_ticket_estimate && (
          <p id="monthly_ticket_estimate-error" role="alert" className="text-xs text-red-500">
            {errors.monthly_ticket_estimate.message}
          </p>
        )}
      </div>

      {/* Data handling agreement */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="data_handling_agreement"
            checked={agreementChecked === true}
            onCheckedChange={(checked) => {
              setValue('data_handling_agreement', checked === true ? true : (undefined as unknown as true), {
                shouldValidate: true,
              })
            }}
            className="mt-0.5"
            aria-required="true"
            aria-invalid={!!errors.data_handling_agreement}
            aria-describedby={agreementDescribedBy}
          />
          <label
            htmlFor="data_handling_agreement"
            className="text-sm text-slate-700 cursor-pointer leading-relaxed"
          >
            I understand that RelayOps workers operate under NDA and data handling
            agreements. Client data is stored encrypted and deleted according to the{' '}
            <a href="/security" className="text-blue-600 hover:underline" target="_blank">
              retention policy
            </a>
            . I agree to the{' '}
            <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
              Privacy Policy
            </a>
            .
          </label>
        </div>
        {errors.data_handling_agreement && (
          <p id="data_handling_agreement-error" role="alert" className="text-xs text-red-500 pl-7">
            {errors.data_handling_agreement.message}
          </p>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div
          id="partner-application-form-error"
          role="alert"
          aria-live="assertive"
          className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Application'}
      </Button>

      <p className="text-xs text-center text-slate-500">
        We review all applications within 2 business days.
      </p>
    </form>
  )
}
