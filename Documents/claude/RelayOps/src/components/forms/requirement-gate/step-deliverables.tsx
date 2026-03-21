'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { TicketCategory } from '@/lib/types/enums'
import type { AcceptanceCriterion } from '@/lib/types/database'
import { cn } from '@/lib/utils/cn'

export interface DeliverablesData {
  category: TicketCategory | ''
  title: string
  acceptanceCriteria: AcceptanceCriterion[]
}

interface StepDeliverablesProps {
  data: DeliverablesData
  onChange: (data: DeliverablesData) => void
}

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: 'data_cleanup_import_prep', label: 'Data Cleanup / Import Prep' },
  { value: 'data_normalization_report_prep', label: 'Data Normalization / Report Prep' },
  { value: 'crm_import_failure_diagnosis', label: 'CRM Import Failure Diagnosis' },
]

// Default deliverable suggestions per category
const DELIVERABLE_TEMPLATES: Record<TicketCategory, { label: string; description: string }[]> = {
  data_cleanup_import_prep: [
    { label: 'cleaned_entity.csv', description: 'Cleaned and deduplicated records ready for import' },
    { label: 'issue_log.csv', description: 'Log of all issues found, with row references' },
    { label: 'mapping_summary.md', description: 'Summary of all field transformations applied' },
  ],
  data_normalization_report_prep: [
    { label: 'normalized_data.csv', description: 'Data normalized to target schema' },
    { label: 'field_mapping.md', description: 'Field-by-field mapping document' },
  ],
  crm_import_failure_diagnosis: [
    { label: 'diagnosis_report.md', description: 'Detailed analysis of import failure causes' },
    { label: 'probable_causes.csv', description: 'Row-level breakdown of failure causes' },
  ],
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

export function StepDeliverables({ data, onChange }: StepDeliverablesProps) {
  const [newCriterion, setNewCriterion] = useState('')

  function update<K extends keyof DeliverablesData>(key: K, value: DeliverablesData[K]) {
    onChange({ ...data, [key]: value })
  }

  function addCriterion() {
    const trimmed = newCriterion.trim()
    if (!trimmed) return
    if (data.acceptanceCriteria.length >= 10) return
    const criterion: AcceptanceCriterion = {
      id: generateId(),
      description: trimmed,
      required: true,
    }
    update('acceptanceCriteria', [...data.acceptanceCriteria, criterion])
    setNewCriterion('')
  }

  function addTemplateCriterion(template: { label: string; description: string }) {
    if (data.acceptanceCriteria.length >= 10) return
    // Prevent duplicate additions
    if (data.acceptanceCriteria.some((c) => c.description === template.description)) return
    const criterion: AcceptanceCriterion = {
      id: generateId(),
      description: template.description,
      required: true,
    }
    update('acceptanceCriteria', [...data.acceptanceCriteria, criterion])
  }

  function updateCriterion(id: string, field: keyof AcceptanceCriterion, value: string | boolean) {
    update(
      'acceptanceCriteria',
      data.acceptanceCriteria.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  function removeCriterion(id: string) {
    update(
      'acceptanceCriteria',
      data.acceptanceCriteria.filter((c) => c.id !== id)
    )
  }

  function handleCriterionKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCriterion()
    }
  }

  const templates = data.category ? DELIVERABLE_TEMPLATES[data.category] : []
  const usedDescriptions = new Set(data.acceptanceCriteria.map((c) => c.description))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Deliverables &amp; Acceptance Criteria</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Define what will be delivered and how you will know it is correct.
        </p>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Job Category <span className="text-destructive">*</span>
        </Label>
        <Select
          value={data.category}
          onValueChange={(v) => update('category', v as TicketCategory)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category…" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Job title */}
      <div className="space-y-2">
        <Label htmlFor="jobTitle">
          Job Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="jobTitle"
          placeholder="e.g. Clean duplicate company records in HubSpot export"
          value={data.title}
          onChange={(e) => update('title', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {data.title.length}/200 characters
        </p>
      </div>

      {/* Template suggestions */}
      {templates.length > 0 && (
        <div className="space-y-2">
          <Label>Suggested Deliverables</Label>
          <p className="text-xs text-muted-foreground">
            Click to add standard deliverables for this category.
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {templates.map((t) => {
              const added = usedDescriptions.has(t.description)
              return (
                <button
                  key={t.label}
                  type="button"
                  disabled={added}
                  onClick={() => addTemplateCriterion(t)}
                  className={cn(
                    'text-xs rounded-full border px-3 py-1 transition-colors',
                    added
                      ? 'bg-green-50 border-green-200 text-green-700 cursor-default'
                      : 'bg-background border-input hover:bg-muted cursor-pointer'
                  )}
                >
                  {added ? '✓ ' : '+ '}
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Acceptance criteria list */}
      <div className="space-y-2">
        <Label>
          Acceptance Criteria <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          At least one required. Toggle "required" to mark a criterion as optional.
        </p>

        {data.acceptanceCriteria.length > 0 && (
          <ul className="space-y-2 mt-2">
            {data.acceptanceCriteria.map((criterion) => (
              <li
                key={criterion.id}
                className="flex items-start gap-3 rounded-md border bg-muted/30 px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <Input
                    value={criterion.description}
                    onChange={(e) =>
                      updateCriterion(criterion.id, 'description', e.target.value)
                    }
                    className="h-7 text-sm bg-transparent border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-1">
                  <Checkbox
                    id={`req-${criterion.id}`}
                    checked={criterion.required}
                    onCheckedChange={(checked) =>
                      updateCriterion(criterion.id, 'required', Boolean(checked))
                    }
                  />
                  <Label
                    htmlFor={`req-${criterion.id}`}
                    className="text-xs font-normal cursor-pointer"
                  >
                    Required
                  </Label>
                  <button
                    type="button"
                    onClick={() => removeCriterion(criterion.id)}
                    className="text-muted-foreground hover:text-destructive p-0.5 rounded"
                    aria-label="Remove criterion"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {data.acceptanceCriteria.length < 10 && (
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Describe what must be true for this job to be complete…"
              value={newCriterion}
              onChange={(e) => setNewCriterion(e.target.value)}
              onKeyDown={handleCriterionKeyDown}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCriterion}
              disabled={!newCriterion.trim()}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        )}

        {data.acceptanceCriteria.length === 0 && (
          <p className="text-xs text-destructive mt-1" role="alert">At least one acceptance criterion is required.</p>
        )}
      </div>
    </div>
  )
}
