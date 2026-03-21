'use client'

import { AlertTriangle } from 'lucide-react'
import { detectVagueness } from '@/lib/validations/ticket'

interface VaguenessDetectorProps {
  text: string
}

// Real-time detection of vague language in input text with inline warnings
export function VaguenessDetector({ text }: VaguenessDetectorProps) {
  const warnings = detectVagueness(text)

  if (warnings.length === 0) return null

  return (
    <div className="space-y-1.5 mt-2">
      {warnings.map((warning, index) => (
        <div
          key={index}
          className="flex items-start gap-2 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2"
        >
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-800">{warning}</p>
        </div>
      ))}
    </div>
  )
}
