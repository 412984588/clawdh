import { Checkbox } from '@/components/ui/checkbox'
import type { AcceptanceCriterion } from '@/lib/types/database'

interface AcceptanceCriteriaChecklistProps {
  criteria: AcceptanceCriterion[]
  readOnly?: boolean
  checkedIds?: string[]
  onToggle?: (id: string) => void
}

export function AcceptanceCriteriaChecklist({
  criteria,
  readOnly = true,
  checkedIds = [],
  onToggle,
}: AcceptanceCriteriaChecklistProps) {
  if (criteria.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No acceptance criteria defined.</p>
    )
  }

  return (
    <ul className="space-y-2">
      {criteria.map((criterion) => {
        const checked = checkedIds.includes(criterion.id)

        return (
          <li key={criterion.id} className="flex items-start gap-2">
            {readOnly ? (
              <Checkbox checked={checked} disabled className="mt-0.5" />
            ) : (
              <Checkbox
                checked={checked}
                onCheckedChange={() => onToggle?.(criterion.id)}
                className="mt-0.5"
              />
            )}
            <span className="text-sm leading-snug">
              {criterion.description}
              {criterion.required && (
                <span className="ml-1 text-xs text-destructive font-medium">*required</span>
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
