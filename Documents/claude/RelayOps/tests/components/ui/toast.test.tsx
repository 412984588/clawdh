import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

describe('Toast', () => {
  it('announces destructive toasts as alerts and labels the close button', () => {
    render(
      <ToastProvider>
        <Toast open variant="destructive">
          <div>
            <ToastTitle>Submission failed</ToastTitle>
            <ToastDescription>Please try again.</ToastDescription>
          </div>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )

    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
    expect(screen.getByRole('button', { name: /close notification/i })).toBeInTheDocument()
  })
})
