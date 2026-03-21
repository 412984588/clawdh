#!/usr/bin/env tsx
import * as fs from 'fs'
import * as path from 'path'
import {
  partnerApprovedEmail,
  ticketSubmittedEmail,
  invoiceSentEmail,
  paymentReceivedEmail,
  workSubmittedEmail,
  workerAssignedEmail,
  revisionRequestedEmail,
  ticketCompletedEmail,
  disputeOpenedEmail,
  reviewApprovedEmail,
  partnerRejectedEmail,
  reviewReminder24hEmail,
  reviewReminder72hEmail,
  invoiceExpiredEmail,
  slaOverdueEmail,
  paymentFailedEmail,
  invoiceExpiryReminderEmail,
  slaDeadlineReminderEmail,
  adminClosedNoResponseEmail,
} from '../src/lib/integrations/email/templates'

const PREVIEW_DIR = path.join(process.cwd(), 'tmp', 'email-previews')

const templates = [
  {
    name: 'partner-approved',
    generator: () =>
      partnerApprovedEmail({
        partnerName: 'Alice Johnson',
        portalUrl: 'https://relayops.app/partner',
      }),
  },
  {
    name: 'partner-rejected',
    generator: () =>
      partnerRejectedEmail({
        partnerName: 'Bob Smith',
        portalUrl: 'https://relayops.app',
      }),
  },
  {
    name: 'ticket-submitted',
    generator: () =>
      ticketSubmittedEmail({
        partnerName: 'Carol White',
        ticketTitle: 'Deduplicate HubSpot records',
        ticketUrl: 'https://relayops.app/partner/tickets/t-123',
      }),
  },
  {
    name: 'invoice-sent',
    generator: () =>
      invoiceSentEmail({
        partnerName: 'Dave Brown',
        ticketTitle: 'Normalize phone numbers',
        invoiceUrl: 'https://invoice.stripe.com/test/abc123',
        amount: '$450.00',
      }),
  },
  {
    name: 'payment-received',
    generator: () =>
      paymentReceivedEmail({
        partnerName: 'Eve Davis',
        ticketTitle: 'Data migration project',
        ticketUrl: 'https://relayops.app/partner/tickets/t-456',
      }),
  },
  {
    name: 'payment-failed',
    generator: () =>
      paymentFailedEmail({
        partnerName: 'Frank Miller',
        ticketTitle: 'API integration',
        ticketUrl: 'https://relayops.app/partner/tickets/t-789',
      }),
  },
  {
    name: 'work-submitted',
    generator: () =>
      workSubmittedEmail({
        partnerName: 'Grace Wilson',
        ticketTitle: 'CSV cleanup',
        ticketUrl: 'https://relayops.app/partner/tickets/t-321',
      }),
  },
  {
    name: 'worker-assigned',
    generator: () =>
      workerAssignedEmail({
        ticketTitle: 'Database optimization',
        workerNickname: 'Jordan Smith',
      }),
  },
  {
    name: 'revision-requested',
    generator: () =>
      revisionRequestedEmail({
        workerNickname: 'Casey Rivera',
        ticketTitle: 'Report generation',
        notes: 'Please include the missing Q3 data and fix the column headers.',
      }),
  },
  {
    name: 'ticket-completed',
    generator: () =>
      ticketCompletedEmail({
        partnerName: 'Henry Moore',
        ticketTitle: 'Email list validation',
      }),
  },
  {
    name: 'dispute-opened',
    generator: () =>
      disputeOpenedEmail({
        adminEmail: 'admin@relayops.app',
        ticketTitle: 'Address standardization',
        reason: 'The output format does not match the requirements.',
      }),
  },
  {
    name: 'review-approved',
    generator: () =>
      reviewApprovedEmail({
        workerNickname: 'Alex Johnson',
        ticketTitle: 'Lead scoring model',
      }),
  },
  {
    name: 'review-reminder-24h',
    generator: () =>
      reviewReminder24hEmail({
        partnerName: 'Iris Taylor',
        ticketTitle: 'Customer data merge',
        ticketUrl: 'https://relayops.app/partner/tickets/t-654',
      }),
  },
  {
    name: 'review-reminder-72h',
    generator: () =>
      reviewReminder72hEmail({
        partnerName: 'Jack Anderson',
        ticketTitle: 'Product catalog update',
        ticketUrl: 'https://relayops.app/partner/tickets/t-987',
      }),
  },
  {
    name: 'invoice-expired',
    generator: () =>
      invoiceExpiredEmail({
        partnerName: 'Karen Thomas',
        ticketTitle: 'Legacy data import',
      }),
  },
  {
    name: 'invoice-expiry-reminder',
    generator: () =>
      invoiceExpiryReminderEmail({
        partnerName: 'Leo Jackson',
        ticketTitle: 'Analytics setup',
        ticketUrl: 'https://relayops.app/partner/tickets/t-147',
        daysRemaining: 2,
      }),
  },
  {
    name: 'sla-overdue',
    generator: () =>
      slaOverdueEmail({
        adminEmail: 'admin@relayops.app',
        ticketTitle: 'Urgent: Data recovery',
        dueAt: '2024-06-15 09:00',
      }),
  },
  {
    name: 'sla-deadline-reminder',
    generator: () =>
      slaDeadlineReminderEmail({
        ticketId: 't-258',
        ticketTitle: 'Critical bug fix',
        ticketUrl: 'https://relayops.app/admin/tickets/t-258',
        hoursRemaining: 4,
      }),
  },
  {
    name: 'admin-closed-no-response',
    generator: () =>
      adminClosedNoResponseEmail({
        partnerName: 'Mia Garcia',
        ticketTitle: 'Field mapping request',
      }),
  },
]

function generateIndexPage(files: string[]): string {
  const links = files
    .map(
      (file) =>
        `<li style="margin:8px 0;"><a href="${file}" style="color:#3B82F6;text-decoration:none;">${file.replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</a></li>`
    )
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RelayOps Email Previews</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #f5f5f5; }
    h1 { color: #1F2937; border-bottom: 2px solid #3B82F6; padding-bottom: 10px; }
    ul { list-style: none; padding: 0; }
    li { background: white; padding: 12px 16px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    a:hover { text-decoration: underline; }
    .count { color: #6B7280; font-size: 14px; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>RelayOps Email Template Previews</h1>
  <ul>
${links}
  </ul>
  <p class="count">Total: ${files.length} templates</p>
</body>
</html>`
}

async function main() {
  console.log('Generating email previews...\n')

  if (!fs.existsSync(PREVIEW_DIR)) {
    fs.mkdirSync(PREVIEW_DIR, { recursive: true })
  }

  const generatedFiles: string[] = []

  for (const template of templates) {
    try {
      const { html } = template.generator()
      const filePath = path.join(PREVIEW_DIR, `${template.name}.html`)
      fs.writeFileSync(filePath, html)
      generatedFiles.push(`${template.name}.html`)
      console.log(`OK ${template.name}.html`)
    } catch (error) {
      console.error(`FAIL ${template.name}:`, error)
    }
  }

  const indexPath = path.join(PREVIEW_DIR, 'index.html')
  fs.writeFileSync(indexPath, generateIndexPage(generatedFiles))
  console.log(`OK index.html`)

  console.log(`\nPreviews saved to: ${PREVIEW_DIR}`)
  console.log(`Open: file://${indexPath}`)
}

main().catch(console.error)
