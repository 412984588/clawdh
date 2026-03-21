import { emailLayout, createButton, createInfoBox, createTicketInfo } from './layout'

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

function wrap(title: string, body: string, previewText?: string): string {
  const html = emailLayout({
    title,
    previewText,
    content: body,
  })
  return html
}

export function partnerApprovedEmail(params: {
  partnerName: string
  portalUrl: string
}): EmailTemplate {
  const subject = 'Your RelayOps partner account has been approved'
  const previewText = `Welcome to RelayOps, ${params.partnerName}! Your partner account has been approved.`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Welcome to RelayOps, ${params.partnerName}!</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Your partner account has been approved. You can now submit tickets and manage your work through the portal.</p>
    ${createButton({ text: 'Go to Partner Portal', url: params.portalUrl })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">If you have any questions, our team is here to help.</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Welcome to RelayOps, ${params.partnerName}!\n\nYour partner account has been approved. Visit your portal: ${params.portalUrl}`
  
  return { subject, html, text }
}

export function ticketSubmittedEmail(params: {
  partnerName: string
  ticketTitle: string
  ticketUrl: string
}): EmailTemplate {
  const subject = `Ticket received: ${params.ticketTitle}`
  const previewText = `We've received your ticket "${params.ticketTitle}". Our team will review it shortly.`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Ticket Received</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.partnerName},</p>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">We've received your ticket and our team will review it shortly.</p>
    ${createTicketInfo({
      title: 'Ticket Details',
      details: [
        { label: 'Title', value: params.ticketTitle },
        { label: 'Status', value: 'Submitted - Under Review' },
      ],
    })}
    ${createButton({ text: 'View Ticket', url: params.ticketUrl })}
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.partnerName},\n\nWe've received your ticket "${params.ticketTitle}". View it here: ${params.ticketUrl}`
  
  return { subject, html, text }
}

export function invoiceSentEmail(params: {
  partnerName: string
  ticketTitle: string
  invoiceUrl: string
  amount: string
}): EmailTemplate {
  const subject = `Invoice ready: ${params.ticketTitle}`
  const previewText = `Your invoice for "${params.ticketTitle}" is ready. Amount due: ${params.amount}`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Invoice Ready</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.partnerName},</p>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Your invoice is ready for payment.</p>
    ${createTicketInfo({
      title: 'Invoice Details',
      details: [
        { label: 'Ticket', value: params.ticketTitle },
        { label: 'Amount Due', value: params.amount },
      ],
    })}
    ${createButton({ text: 'Pay Invoice', url: params.invoiceUrl })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Please complete payment to begin work on your ticket.</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.partnerName},\n\nYour invoice for "${params.ticketTitle}" is ready. Amount: ${params.amount}.\nPay here: ${params.invoiceUrl}`
  
  return { subject, html, text }
}

export function paymentReceivedEmail(params: {
  partnerName: string
  ticketTitle: string
  ticketUrl: string
}): EmailTemplate {
  const subject = `Payment confirmed: ${params.ticketTitle}`
  const previewText = `We've received your payment for "${params.ticketTitle}". Work will begin shortly.`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Payment Confirmed</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.partnerName},</p>
    ${createInfoBox({
      title: 'Payment Received',
      content: `We've received your payment for "${params.ticketTitle}". Work will begin shortly.`,
      type: 'success',
    })}
    ${createButton({ text: 'View Ticket', url: params.ticketUrl })}
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.partnerName},\n\nPayment confirmed for "${params.ticketTitle}". View it here: ${params.ticketUrl}`
  
  return { subject, html, text }
}

export function workSubmittedEmail(params: {
  partnerName: string
  ticketTitle: string
  ticketUrl: string
}): EmailTemplate {
  const subject = `Work submitted for review: ${params.ticketTitle}`
  const previewText = `Work has been submitted for "${params.ticketTitle}" and is ready for your review.`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Work Ready for Review</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.partnerName},</p>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Work has been submitted for your ticket and is ready for your review.</p>
    ${createTicketInfo({
      title: 'Ticket Details',
      details: [
        { label: 'Title', value: params.ticketTitle },
        { label: 'Status', value: 'Pending Review' },
      ],
    })}
    ${createButton({ text: 'Review Work', url: params.ticketUrl })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Please review within 72 hours to avoid automatic closure.</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.partnerName},\n\nWork on "${params.ticketTitle}" is ready for your review: ${params.ticketUrl}`
  
  return { subject, html, text }
}

export function workerAssignedEmail(params: {
  ticketTitle: string
  workerNickname: string
}): EmailTemplate {
  const subject = `Worker assigned: ${params.ticketTitle}`
  const previewText = `Worker ${params.workerNickname} has been assigned to "${params.ticketTitle}".`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Assignment Notification</h1>
    ${createInfoBox({
      title: 'New Assignment',
      content: `Worker <strong>${params.workerNickname}</strong> has been assigned to <strong>${params.ticketTitle}</strong>.`,
      type: 'info',
    })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">The worker will begin work on this ticket shortly.</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Worker ${params.workerNickname} has been assigned to "${params.ticketTitle}".`
  
  return { subject, html, text }
}

export function revisionRequestedEmail(params: {
  workerNickname: string
  ticketTitle: string
  notes: string
}): EmailTemplate {
  const subject = `Revision requested: ${params.ticketTitle}`
  const previewText = `A revision has been requested for "${params.ticketTitle}".`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Revision Requested</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.workerNickname},</p>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">A revision has been requested for your work on this ticket.</p>
    ${createTicketInfo({
      title: 'Ticket Details',
      details: [
        { label: 'Title', value: params.ticketTitle },
        { label: 'Status', value: 'Revision Required' },
      ],
    })}
    ${createInfoBox({
      title: 'Feedback Notes',
      content: params.notes,
      type: 'warning',
    })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Please address the feedback and resubmit your work.</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.workerNickname},\n\nA revision was requested for "${params.ticketTitle}".\n\nNotes:\n${params.notes}`
  
  return { subject, html, text }
}

export function ticketCompletedEmail(params: {
  partnerName: string
  ticketTitle: string
}): EmailTemplate {
  const subject = `Ticket completed: ${params.ticketTitle}`
  const previewText = `Your ticket "${params.ticketTitle}" has been marked as completed. Thank you for using RelayOps!`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Ticket Completed</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.partnerName},</p>
    ${createInfoBox({
      title: 'Completion Confirmed',
      content: `Your ticket "${params.ticketTitle}" has been marked as completed.`,
      type: 'success',
    })}
    <p style="margin:16px 0 0 0;font-size:16px;color:#374151;line-height:1.6;">Thank you for using RelayOps! We hope to work with you again soon.</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.partnerName},\n\nYour ticket "${params.ticketTitle}" has been completed. Thank you!`
  
  return { subject, html, text }
}

export function disputeOpenedEmail(params: {
  adminEmail: string
  ticketTitle: string
  reason: string
}): EmailTemplate {
  const subject = `Dispute opened: ${params.ticketTitle}`
  const previewText = `A dispute has been opened for ticket "${params.ticketTitle}".`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Dispute Alert</h1>
    ${createInfoBox({
      title: 'Dispute Opened',
      content: `A dispute has been opened for ticket <strong>${params.ticketTitle}</strong>.`,
      type: 'warning',
    })}
    ${createTicketInfo({
      title: 'Dispute Details',
      details: [
        { label: 'Ticket', value: params.ticketTitle },
        { label: 'Reason', value: params.reason },
      ],
    })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Please review in the admin panel.</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Dispute opened for "${params.ticketTitle}".\n\nReason:\n${params.reason}\n\nPlease review in the admin panel.`
  
  return { subject, html, text }
}

export function reviewApprovedEmail(params: {
  workerNickname: string
  ticketTitle: string
}): EmailTemplate {
  const subject = `Work approved: ${params.ticketTitle}`
  const previewText = `Your submission for "${params.ticketTitle}" has been approved. Great work!`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Work Approved</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.workerNickname},</p>
    ${createInfoBox({
      title: 'Submission Approved',
      content: `Your submission for "${params.ticketTitle}" has been approved. Great work!`,
      type: 'success',
    })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Thank you for your contribution!</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.workerNickname},\n\nYour submission for "${params.ticketTitle}" has been approved. Great work!`
  
  return { subject, html, text }
}

export function partnerRejectedEmail(params: {
  partnerName: string
  portalUrl: string
}): EmailTemplate {
  const subject = 'Your RelayOps partner application was not approved'
  const previewText = `Unfortunately, your partner application was not approved at this time.`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Application Status Update</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.partnerName},</p>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Unfortunately, your partner application was not approved at this time.</p>
    ${createInfoBox({
      content: 'If you have questions about this decision or would like to discuss your application, please contact our support team.',
      type: 'info',
    })}
    ${createButton({ text: 'Visit RelayOps', url: params.portalUrl, variant: 'secondary' })}
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.partnerName},\n\nYour partner application was not approved. Contact us for more information.`
  
  return { subject, html, text }
}

export function reviewReminder24hEmail(params: {
  partnerName: string
  ticketTitle: string
  ticketUrl: string
}): EmailTemplate {
  const subject = `Reminder: please review ${params.ticketTitle}`
  const previewText = `Work on "${params.ticketTitle}" has been waiting for your review for 24 hours.`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Review Reminder</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.partnerName},</p>
    ${createInfoBox({
      title: '24 Hour Reminder',
      content: `Work on "${params.ticketTitle}" has been waiting for your review for 24 hours.`,
      type: 'info',
    })}
    ${createButton({ text: 'Review Now', url: params.ticketUrl })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Please take a look when you get a chance.</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.partnerName},\n\nWork on "${params.ticketTitle}" has been waiting 24 hours for your review.\nReview here: ${params.ticketUrl}`
  
  return { subject, html, text }
}

export function reviewReminder72hEmail(params: {
  partnerName: string
  ticketTitle: string
  ticketUrl: string
}): EmailTemplate {
  const subject = `Action required: review ${params.ticketTitle}`
  const previewText = `Work on "${params.ticketTitle}" has been waiting for your review for 72 hours.`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Action Required</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.partnerName},</p>
    ${createInfoBox({
      title: '72 Hour Notice',
      content: `Work on "${params.ticketTitle}" has been waiting for your review for 72 hours. If we don't hear back soon, the ticket may be auto-closed.`,
      type: 'warning',
    })}
    ${createButton({ text: 'Review Now', url: params.ticketUrl })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Please act soon to avoid automatic closure.</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.partnerName},\n\nWork on "${params.ticketTitle}" has been waiting 72 hours for your review. Please act soon.\nReview here: ${params.ticketUrl}`
  
  return { subject, html, text }
}

export function invoiceExpiredEmail(params: {
  partnerName: string
  ticketTitle: string
}): EmailTemplate {
  const subject = `Invoice expired: ${params.ticketTitle}`
  const previewText = `The invoice for "${params.ticketTitle}" has expired due to non-payment.`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Invoice Expired</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.partnerName},</p>
    ${createInfoBox({
      title: 'Invoice Status',
      content: `The invoice for "${params.ticketTitle}" has expired due to non-payment.`,
      type: 'warning',
    })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Please contact us if you'd like to reopen this request.</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.partnerName},\n\nThe invoice for "${params.ticketTitle}" has expired. Contact us to reopen.`
  
  return { subject, html, text }
}

export function slaOverdueEmail(params: {
  adminEmail: string
  ticketTitle: string
  dueAt: string
}): EmailTemplate {
  const subject = `SLA overdue: ${params.ticketTitle}`
  const previewText = `Ticket "${params.ticketTitle}" has passed its SLA deadline.`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">SLA Alert</h1>
    ${createInfoBox({
      title: 'SLA Breach',
      content: `Ticket <strong>${params.ticketTitle}</strong> has passed its SLA deadline of <strong>${params.dueAt}</strong>.`,
      type: 'warning',
    })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Please investigate immediately.</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `SLA overdue for "${params.ticketTitle}".\n\nDue at: ${params.dueAt}\n\nPlease investigate immediately.`
  
  return { subject, html, text }
}

export function paymentFailedEmail(params: {
  partnerName: string
  ticketTitle: string
  ticketUrl: string
}): EmailTemplate {
  const subject = `Payment failed: ${params.ticketTitle}`
  const previewText = `We were unable to process payment for "${params.ticketTitle}".`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Payment Failed</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.partnerName},</p>
    ${createInfoBox({
      title: 'Payment Issue',
      content: `We were unable to process payment for "${params.ticketTitle}". Please update your payment method or contact us for assistance.`,
      type: 'warning',
    })}
    ${createButton({ text: 'View Ticket', url: params.ticketUrl })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Updating your payment method may resolve this issue.</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.partnerName},\n\nPayment failed for "${params.ticketTitle}". Please update your payment method: ${params.ticketUrl}`
  
  return { subject, html, text }
}

export function invoiceExpiryReminderEmail(params: {
  partnerName: string
  ticketTitle: string
  ticketUrl: string
  daysRemaining: number
}): EmailTemplate {
  const plural = params.daysRemaining !== 1 ? 's' : ''
  const subject = `Invoice expiring in ${params.daysRemaining} day${plural}: ${params.ticketTitle}`
  const previewText = `Your invoice for "${params.ticketTitle}" will expire in ${params.daysRemaining} day${plural}.`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Invoice Expiring Soon</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.partnerName},</p>
    ${createInfoBox({
      title: 'Expiration Warning',
      content: `Your invoice for "${params.ticketTitle}" will expire in <strong>${params.daysRemaining} day${plural}</strong>.`,
      type: 'warning',
    })}
    ${createButton({ text: 'Pay Invoice Now', url: params.ticketUrl })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Please pay to keep this request active.</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.partnerName},\n\nYour invoice for "${params.ticketTitle}" expires in ${params.daysRemaining} day${plural}. Pay here: ${params.ticketUrl}`
  
  return { subject, html, text }
}

export function slaDeadlineReminderEmail(params: {
  ticketId: string
  ticketTitle: string
  ticketUrl: string
  hoursRemaining: number
}): EmailTemplate {
  const subject = `SLA deadline in ${params.hoursRemaining}h: ${params.ticketTitle}`
  const previewText = `Ticket "${params.ticketTitle}" must be completed within ${params.hoursRemaining} hours.`
  
  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">SLA Deadline Alert</h1>
    ${createInfoBox({
      title: 'Urgent: SLA Approaching',
      content: `Ticket <strong>${params.ticketTitle}</strong> (ID: ${params.ticketId}) must be completed within <strong>${params.hoursRemaining} hour${params.hoursRemaining !== 1 ? 's' : ''}</strong>.`,
      type: 'warning',
    })}
    ${createButton({ text: 'View Ticket', url: params.ticketUrl })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Please prioritize immediately.</p>
  `
  
  const html = wrap(subject, body, previewText)
  const text = `SLA deadline alert: "${params.ticketTitle}" (${params.ticketId}) is due in ${params.hoursRemaining} hour${params.hoursRemaining !== 1 ? 's' : ''}.\nView: ${params.ticketUrl}`
  
  return { subject, html, text }
}

export function adminClosedNoResponseEmail(params: {
  partnerName: string
  ticketTitle: string
}): EmailTemplate {
  const subject = `Ticket closed: ${params.ticketTitle}`
  const previewText = `Ticket "${params.ticketTitle}" has been closed due to no response within the review window.`

  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Ticket Closed</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.partnerName},</p>
    ${createInfoBox({
      title: 'Closure Notice',
      content: `Ticket "${params.ticketTitle}" has been closed by our admin team due to no response within the review window.`,
      type: 'info',
    })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Please contact us if you need to reopen it.</p>
  `

  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.partnerName},\n\nTicket "${params.ticketTitle}" was closed due to no response. Contact us to reopen.`

  return { subject, html, text }
}

export function paymentRetryEmail(params: {
  partnerName: string
  ticketTitle: string
  ticketUrl: string
  retryCount: number
  nextRetryIn: string
}): EmailTemplate {
  const subject = `Payment retry scheduled: ${params.ticketTitle}`
  const previewText = `We're retrying payment for "${params.ticketTitle}" in ${params.nextRetryIn}.`

  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Payment Retry Scheduled</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.partnerName},</p>
    ${createInfoBox({
      title: 'Payment Issue',
      content: `We encountered an issue processing payment for "${params.ticketTitle}". We'll automatically retry in ${params.nextRetryIn} (attempt ${params.retryCount} of 3).`,
      type: 'warning',
    })}
    ${createTicketInfo({
      title: 'Ticket Details',
      details: [
        { label: 'Title', value: params.ticketTitle },
        { label: 'Retry Attempt', value: `${params.retryCount} of 3` },
        { label: 'Next Retry', value: `In ${params.nextRetryIn}` },
      ],
    })}
    ${createButton({ text: 'View Ticket', url: params.ticketUrl })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">No action needed - we'll retry automatically. If all retries fail, we'll notify you with next steps.</p>
  `

  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.partnerName},\n\nWe're retrying payment for "${params.ticketTitle}" in ${params.nextRetryIn} (attempt ${params.retryCount} of 3).\nView ticket: ${params.ticketUrl}`

  return { subject, html, text }
}

export function paymentFailedFinalEmail(params: {
  partnerName: string
  ticketTitle: string
  ticketUrl: string
  adminEmail: string
}): EmailTemplate {
  const subject = `Payment failed: ${params.ticketTitle} - Action required`
  const previewText = `Payment for "${params.ticketTitle}" failed after 3 retry attempts. Please contact support.`

  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">Payment Failed</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.partnerName},</p>
    ${createInfoBox({
      title: 'All Retries Exhausted',
      content: `We were unable to process payment for "${params.ticketTitle}" after 3 retry attempts. Please contact our support team to resolve this issue.`,
      type: 'warning',
    })}
    ${createTicketInfo({
      title: 'Ticket Details',
      details: [
        { label: 'Title', value: params.ticketTitle },
        { label: 'Status', value: 'Payment Failed - Action Required' },
        { label: 'Support Email', value: params.adminEmail },
      ],
    })}
    ${createButton({ text: 'View Ticket', url: params.ticketUrl })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Please contact us at ${params.adminEmail} to update your payment method or discuss alternative options.</p>
  `

  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.partnerName},\n\nPayment for "${params.ticketTitle}" failed after 3 retry attempts. Please contact ${params.adminEmail} for assistance.\nView ticket: ${params.ticketUrl}`

  return { subject, html, text }
}

export function kycSubmittedEmail(params: {
  workerNickname: string
  portalUrl: string
}): EmailTemplate {
  const subject = 'KYC documents submitted - Under review'
  const previewText = `Your KYC documents have been submitted and are under review.`

  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">KYC Documents Submitted</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.workerNickname},</p>
    ${createInfoBox({
      title: 'Submission Received',
      content: `Your KYC documents have been submitted successfully and are now under review. We'll notify you once the review is complete.`,
      type: 'info',
    })}
    ${createButton({ text: 'View Status', url: params.portalUrl })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Review typically takes 1-2 business days.</p>
  `

  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.workerNickname},\n\nYour KYC documents have been submitted and are under review. We'll notify you once complete.`

  return { subject, html, text }
}

export function kycApprovedEmail(params: {
  workerNickname: string
  portalUrl: string
}): EmailTemplate {
  const subject = 'KYC verification approved'
  const previewText = `Your KYC verification has been approved. You can now receive ticket assignments.`

  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">KYC Verification Approved</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.workerNickname},</p>
    ${createInfoBox({
      title: 'Verification Complete',
      content: `Your KYC verification has been approved. You are now eligible to receive ticket assignments.`,
      type: 'success',
    })}
    ${createButton({ text: 'Go to Dashboard', url: params.portalUrl })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">Thank you for completing the verification process.</p>
  `

  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.workerNickname},\n\nYour KYC verification has been approved. You can now receive ticket assignments.`

  return { subject, html, text }
}

export function kycRejectedEmail(params: {
  workerNickname: string
  rejectionReason: string
  portalUrl: string
}): EmailTemplate {
  const subject = 'KYC verification requires attention'
  const previewText = `Your KYC verification was not approved. Please review the feedback and resubmit.`

  const body = `
    <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1F2937;line-height:1.3;">KYC Verification Requires Attention</h1>
    <p style="margin:0 0 16px 0;font-size:16px;color:#374151;line-height:1.6;">Hi ${params.workerNickname},</p>
    ${createInfoBox({
      title: 'Verification Feedback',
      content: `Your KYC verification was not approved. Please review the feedback below and resubmit your documents.`,
      type: 'warning',
    })}
    <blockquote style="margin:16px 0;padding:12px 16px;border-left:4px solid #F59E0B;background-color:#FFFBEB;color:#92400E;font-size:14px;">
      ${params.rejectionReason}
    </blockquote>
    ${createButton({ text: 'Resubmit Documents', url: params.portalUrl })}
    <p style="margin:16px 0 0 0;font-size:14px;color:#6B7280;line-height:1.5;">If you have questions, please contact support.</p>
  `

  const html = wrap(subject, body, previewText)
  const text = `Hi ${params.workerNickname},\n\nYour KYC verification was not approved.\n\nReason: ${params.rejectionReason}\n\nPlease resubmit your documents.`

  return { subject, html, text }
}
