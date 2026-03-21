'use client'

import { ErrorPage } from '@/components/layouts/error-page'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError(props: ErrorProps) {
  return <ErrorPage {...props} backHref="/" backLabel="Back to home" />
}
