'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

export interface DataSourceData {
  crmType: string
  rowCountEstimate: string
  fileCountEstimate: string
  fieldsAffected: string[]
  sensitivity: 'standard' | 'sensitive' | 'highly_sensitive'
}

interface StepDataSourceProps {
  data: DataSourceData
  onChange: (data: DataSourceData) => void
}

const CRM_OPTIONS = [
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'pipedrive', label: 'Pipedrive' },
  { value: 'other', label: 'Other / Unknown' },
]

const FIELD_OPTIONS = [
  { value: 'company_name', label: 'Company Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'address', label: 'Address' },
  { value: 'deal_stage', label: 'Deal Stage' },
  { value: 'owner', label: 'Owner / Assignee' },
  { value: 'custom_fields', label: 'Custom Fields' },
  { value: 'other', label: 'Other' },
]

const SENSITIVITY_OPTIONS = [
  {
    value: 'standard' as const,
    label: 'Standard',
    description: 'No PII or confidential data',
  },
  {
    value: 'sensitive' as const,
    label: 'Sensitive — PII',
    description: 'Contains personal identifiable information',
  },
  {
    value: 'highly_sensitive' as const,
    label: 'Highly Sensitive — Financial / Legal',
    description: 'Contains financial records, legal contracts, or health data',
  },
]

export function StepDataSource({ data, onChange }: StepDataSourceProps) {
  function update<K extends keyof DataSourceData>(key: K, value: DataSourceData[K]) {
    onChange({ ...data, [key]: value })
  }

  function toggleField(field: string) {
    const current = data.fieldsAffected
    const next = current.includes(field)
      ? current.filter((f) => f !== field)
      : [...current, field]
    update('fieldsAffected', next)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Data Source Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us about the data you are working with.
        </p>
      </div>

      {/* CRM type */}
      <div className="space-y-2">
        <Label htmlFor="crmType">CRM Platform</Label>
        <Select value={data.crmType} onValueChange={(v) => update('crmType', v)}>
          <SelectTrigger id="crmType">
            <SelectValue placeholder="Select CRM…" />
          </SelectTrigger>
          <SelectContent>
            {CRM_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row / file counts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rowCount">Estimated Row Count</Label>
          <Input
            id="rowCount"
            type="number"
            min={1}
            placeholder="e.g. 5000"
            value={data.rowCountEstimate}
            onChange={(e) => update('rowCountEstimate', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fileCount">Number of Files (1–50)</Label>
          <Input
            id="fileCount"
            type="number"
            min={1}
            max={50}
            placeholder="e.g. 2"
            value={data.fileCountEstimate}
            onChange={(e) => update('fileCountEstimate', e.target.value)}
          />
        </div>
      </div>

      {/* Fields affected */}
      <div className="space-y-2">
        <Label>Fields Affected</Label>
        <p className="text-xs text-muted-foreground">Select all that apply.</p>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {FIELD_OPTIONS.map((field) => (
            <div key={field.value} className="flex items-center gap-2">
              <Checkbox
                id={`field-${field.value}`}
                checked={data.fieldsAffected.includes(field.value)}
                onCheckedChange={() => toggleField(field.value)}
              />
              <Label htmlFor={`field-${field.value}`} className="font-normal cursor-pointer">
                {field.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sensitivity */}
      <div className="space-y-2">
        <Label>Data Sensitivity Level</Label>
        <div className="space-y-2 mt-1">
          {SENSITIVITY_OPTIONS.map((opt) => {
            const selected = data.sensitivity === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('sensitivity', opt.value)}
                className={`w-full text-left rounded-md border px-4 py-3 transition-colors ${
                  selected
                    ? 'border-primary bg-primary/5'
                    : 'border-input bg-background hover:bg-muted'
                }`}
              >
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
