'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VaguenessDetector } from './vagueness-detector'

export interface ScopeData {
  problemSummary: string
  expectedOutput: string
  outOfScope: string[]
}

interface StepScopeProps {
  data: ScopeData
  onChange: (data: ScopeData) => void
}

export function StepScope({ data, onChange }: StepScopeProps) {
  const [newOutOfScope, setNewOutOfScope] = useState('')

  function update<K extends keyof ScopeData>(key: K, value: ScopeData[K]) {
    onChange({ ...data, [key]: value })
  }

  function addOutOfScope() {
    const trimmed = newOutOfScope.trim()
    if (!trimmed || data.outOfScope.includes(trimmed)) return
    if (data.outOfScope.length >= 10) return
    update('outOfScope', [...data.outOfScope, trimmed])
    setNewOutOfScope('')
  }

  function removeOutOfScope(item: string) {
    update(
      'outOfScope',
      data.outOfScope.filter((s) => s !== item)
    )
  }

  function handleOutOfScopeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addOutOfScope()
    }
  }

  const problemLength = data.problemSummary.length
  const outputLength = data.expectedOutput.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Define the Scope</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Be precise. Vague descriptions will be flagged before your ticket can be locked.
        </p>
      </div>

      {/* Problem summary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="problemSummary">
            Problem Summary <span className="text-destructive">*</span>
          </Label>
          <span className={`text-xs ${problemLength < 50 ? 'text-muted-foreground' : 'text-green-600'}`}>
            {problemLength} / 3000 {problemLength < 50 && '(min 50)'}
          </span>
        </div>
        <Textarea
          id="problemSummary"
          rows={5}
          placeholder="Describe the specific problem in detail. What is wrong with the data? What records are affected? What happened that caused this?"
          value={data.problemSummary}
          onChange={(e) => update('problemSummary', e.target.value)}
          className="resize-none"
        />
        {/* Real-time vagueness detection */}
        <VaguenessDetector text={data.problemSummary} />
      </div>

      {/* Expected output */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="expectedOutput">
            Expected Output <span className="text-destructive">*</span>
          </Label>
          <span className={`text-xs ${outputLength < 30 ? 'text-muted-foreground' : 'text-green-600'}`}>
            {outputLength} / 2000 {outputLength < 30 && '(min 30)'}
          </span>
        </div>
        <Textarea
          id="expectedOutput"
          rows={4}
          placeholder="Describe exactly what you expect to receive back. What file format? What fields? What does a correct record look like?"
          value={data.expectedOutput}
          onChange={(e) => update('expectedOutput', e.target.value)}
          className="resize-none"
        />
        <VaguenessDetector text={data.expectedOutput} />
      </div>

      {/* Out of scope */}
      <div className="space-y-2">
        <Label>Out of Scope</Label>
        <p className="text-xs text-muted-foreground">
          List things that are explicitly NOT included. This locks the boundary.
        </p>

        {data.outOfScope.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.outOfScope.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="flex items-center gap-1 pr-1 text-xs"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeOutOfScope(item)}
                  className="ml-1 rounded hover:bg-destructive/20 p-0.5"
                  aria-label={`Remove "${item}"`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {data.outOfScope.length < 10 && (
          <div className="flex gap-2 mt-2">
            <Input
              placeholder='e.g. "reformatting phone numbers to E.164"'
              value={newOutOfScope}
              onChange={(e) => setNewOutOfScope(e.target.value)}
              onKeyDown={handleOutOfScopeKeyDown}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOutOfScope}
              disabled={!newOutOfScope.trim()}
            >
              Add
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
