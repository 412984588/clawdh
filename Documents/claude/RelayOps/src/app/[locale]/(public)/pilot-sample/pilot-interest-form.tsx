'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { submitPilotInterest } from '@/lib/actions/pilot.actions'

export function PilotInterestForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setErrorMsg(null)

    const result = await submitPilotInterest({ email })

    setLoading(false)
    if (result.success) {
      setSubmitted(true)
    } else {
      setErrorMsg(
        typeof result.error === 'string'
          ? result.error
          : 'Something went wrong. Please try again.'
      )
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Got it! We'll reach out once your application is reviewed.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="you@agency.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? '...' : 'Notify me'}
        </Button>
      </div>
      {errorMsg && <p className="text-xs text-destructive" role="alert">{errorMsg}</p>}
    </form>
  )
}
