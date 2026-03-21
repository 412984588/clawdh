'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

// 捕获 root layout 崩溃 — error.tsx 捕获不到 layout 级异常，必须用 global-error.tsx
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            fontFamily: 'system-ui, sans-serif',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '14px', color: '#666', maxWidth: '400px' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
