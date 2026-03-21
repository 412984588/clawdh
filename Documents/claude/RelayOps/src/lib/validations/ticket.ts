import { z } from 'zod'

const acceptanceCriterionSchema = z.object({
  id: z.string(),
  description: z.string().min(5, 'Criterion must be at least 5 characters'),
  required: z.boolean(),
})

export const ticketCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  category: z.enum([
    'data_cleanup_import_prep',
    'data_normalization_report_prep',
    'crm_import_failure_diagnosis',
  ]),
  subtype: z.string().optional(),
  problem_summary: z
    .string()
    .min(50, 'Problem summary must be at least 50 characters')
    .max(3000),
  expected_output: z
    .string()
    .min(30, 'Expected output must be at least 30 characters')
    .max(2000),
  acceptance_criteria_json: z
    .array(acceptanceCriterionSchema)
    .min(1, 'At least one acceptance criterion required')
    .max(10),
  out_of_scope_json: z.array(z.string()).max(10),
  sensitivity_level: z.enum(['standard', 'sensitive', 'highly_sensitive']).default('standard'),
  row_count_estimate: z.coerce.number().int().min(1).optional(),
  file_count_estimate: z.coerce.number().int().min(1).max(50).optional(),
})

export type TicketCreateInput = z.infer<typeof ticketCreateSchema>

// 模糊描述检测规则 — 触发时在向导中显示警告
export const VAGUENESS_PATTERNS = [
  { pattern: /\bclean(up)?\s+everything\b/i, message: 'Too broad — specify which fields or records' },
  { pattern: /\bjust\s+fix\s+it\b/i, message: 'What specifically needs fixing?' },
  { pattern: /\bmake\s+it\s+look\s+better\b/i, message: 'Describe the exact output format' },
  { pattern: /\ball\s+records\b/i, message: 'How many records? What criteria?' },
  { pattern: /\bsomehow\b/i, message: 'Be specific about the transformation needed' },
  { pattern: /\bnot\s+sure\b/i, message: 'Please clarify before submitting' },
  { pattern: /\bmaybe\b/i, message: "Be definitive about what's in scope" },
  { pattern: /\betc\.?\b/i, message: 'List all items explicitly — no open-ended scope' },
  { pattern: /\band\s+more\b/i, message: 'Enumerate all items — "and more" is not scoped' },
  { pattern: /\bif\s+possible\b/i, message: "Either it's in scope or it isn't" },
]

export function detectVagueness(text: string): string[] {
  return VAGUENESS_PATTERNS
    .filter(({ pattern }) => pattern.test(text))
    .map(({ message }) => message)
}
