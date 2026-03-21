'use client'

import { ErrorPage } from '@/components/layouts/error-page'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PartnerError(props: ErrorProps) {
  return <ErrorPage {...props} backHref="/partner" />
}
