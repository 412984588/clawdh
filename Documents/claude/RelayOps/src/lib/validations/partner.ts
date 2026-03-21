import { z } from 'zod'

export const partnerApplicationSchema = z.object({
  // Contact info
  first_name: z.string().min(2, 'First name required'),
  last_name: z.string().min(2, 'Last name required'),
  email: z.string().email('Valid email required'),
  // Company info
  company_name: z.string().min(2, 'Company name required'),
  website: z.string().url('Valid URL required').optional().or(z.literal('')),
  country: z.string().min(2, 'Country required'),
  // Use case
  service_focus: z
    .string()
    .min(10, 'Please describe your service focus (min 10 chars)'),
  monthly_ticket_estimate: z.coerce.number().int().min(1).max(1000),
  // Agreements
  data_handling_agreement: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the data handling terms' }),
  }),
})

export type PartnerApplicationInput = z.infer<typeof partnerApplicationSchema>
