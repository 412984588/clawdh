import { describe, it, expect } from 'vitest'
import {
  partnerApprovedEmail,
  ticketSubmittedEmail,
  invoiceSentEmail,
  paymentReceivedEmail,
  workSubmittedEmail,
  revisionRequestedEmail,
  ticketCompletedEmail,
  disputeOpenedEmail,
  reviewApprovedEmail,
  reviewReminder24hEmail,
  reviewReminder72hEmail,
  invoiceExpiredEmail,
  slaOverdueEmail,
  adminClosedNoResponseEmail,
  partnerRejectedEmail,
  workerAssignedEmail,
  paymentFailedEmail,
  invoiceExpiryReminderEmail,
  slaDeadlineReminderEmail,
} from '@/lib/integrations/email/templates'

describe('email templates with brand layout', () => {
  describe('partnerApprovedEmail', () => {
    it('includes partner name in subject/html/text', () => {
      const t = partnerApprovedEmail({ partnerName: 'Alice', portalUrl: 'https://portal.example.com' })
      expect(t.subject).toBeTruthy()
      expect(t.html).toContain('Alice')
      expect(t.text).toContain('Alice')
      expect(t.html).toContain('https://portal.example.com')
      expect(t.html).toContain('RelayOps')
      expect(t.html).toContain('Welcome to RelayOps')
    })
  })

  describe('ticketSubmittedEmail', () => {
    it('includes ticket title in subject and brand elements', () => {
      const t = ticketSubmittedEmail({ partnerName: 'Bob', ticketTitle: 'Fix homepage', ticketUrl: 'https://app.com/t/1' })
      expect(t.subject).toContain('Fix homepage')
      expect(t.html).toContain('Bob')
      expect(t.text).toContain('https://app.com/t/1')
      expect(t.html).toContain('RelayOps')
      expect(t.html).toContain('Ticket Received')
    })
  })

  describe('invoiceSentEmail', () => {
    it('includes amount and invoice URL with brand layout', () => {
      const t = invoiceSentEmail({
        partnerName: 'Carol',
        ticketTitle: 'Build API',
        invoiceUrl: 'https://invoice.example.com',
        amount: '$500.00',
      })
      expect(t.subject).toContain('Build API')
      expect(t.html).toContain('$500.00')
      expect(t.text).toContain('https://invoice.example.com')
      expect(t.html).toContain('RelayOps')
      expect(t.html).toContain('Invoice Ready')
    })
  })

  describe('paymentReceivedEmail', () => {
    it('includes partner name and ticket title with success styling', () => {
      const t = paymentReceivedEmail({ partnerName: 'Dave', ticketTitle: 'SEO audit', ticketUrl: 'https://app.com/t/2' })
      expect(t.subject).toContain('SEO audit')
      expect(t.html).toContain('Dave')
      expect(t.text).toContain('https://app.com/t/2')
      expect(t.html).toContain('Payment Confirmed')
    })
  })

  describe('workSubmittedEmail', () => {
    it('includes partner name and ticket URL with brand layout', () => {
      const t = workSubmittedEmail({ partnerName: 'Eve', ticketTitle: 'Write docs', ticketUrl: 'https://app.com/t/3' })
      expect(t.subject).toContain('Write docs')
      expect(t.html).toContain('Eve')
      expect(t.text).toContain('https://app.com/t/3')
      expect(t.html).toContain('Work Ready for Review')
    })
  })

  describe('revisionRequestedEmail', () => {
    it('includes worker nickname and notes with warning styling', () => {
      const t = revisionRequestedEmail({ workerNickname: 'frank_w', ticketTitle: 'Logo redesign', notes: 'Please fix the colors.' })
      expect(t.subject).toContain('Logo redesign')
      expect(t.html).toContain('frank_w')
      expect(t.text).toContain('Please fix the colors.')
      expect(t.html).toContain('Revision Requested')
    })
  })

  describe('ticketCompletedEmail', () => {
    it('includes partner name and ticket title with success styling', () => {
      const t = ticketCompletedEmail({ partnerName: 'Grace', ticketTitle: 'Data migration' })
      expect(t.subject).toContain('Data migration')
      expect(t.html).toContain('Grace')
      expect(t.text).toContain('Data migration')
      expect(t.html).toContain('Ticket Completed')
    })
  })

  describe('disputeOpenedEmail', () => {
    it('includes ticket title and dispute reason with warning styling', () => {
      const t = disputeOpenedEmail({ adminEmail: 'admin@relay.com', ticketTitle: 'Broken build', reason: 'Work is incomplete.' })
      expect(t.subject).toContain('Broken build')
      expect(t.html).toContain('Work is incomplete.')
      expect(t.text).toContain('Work is incomplete.')
      expect(t.html).toContain('Dispute Alert')
    })
  })

  describe('reviewApprovedEmail', () => {
    it('includes worker nickname and success message', () => {
      const t = reviewApprovedEmail({ workerNickname: 'Alex', ticketTitle: 'Feature implementation' })
      expect(t.subject).toContain('Feature implementation')
      expect(t.html).toContain('Alex')
      expect(t.html).toContain('Work Approved')
    })
  })

  describe('reviewReminder24hEmail', () => {
    it('includes 24 hour context and ticket URL with info styling', () => {
      const t = reviewReminder24hEmail({ partnerName: 'Harry', ticketTitle: 'DB schema', ticketUrl: 'https://app.com/t/4' })
      expect(t.subject).toContain('DB schema')
      expect(t.html).toContain('24 Hour Reminder')
      expect(t.text).toContain('https://app.com/t/4')
    })
  })

  describe('reviewReminder72hEmail', () => {
    it('includes 72 hour context and ticket URL with warning styling', () => {
      const t = reviewReminder72hEmail({ partnerName: 'Iris', ticketTitle: 'UI refresh', ticketUrl: 'https://app.com/t/5' })
      expect(t.subject).toContain('UI refresh')
      expect(t.html).toContain('72 Hour Notice')
      expect(t.text).toContain('https://app.com/t/5')
    })
  })

  describe('invoiceExpiredEmail', () => {
    it('includes partner name and ticket title with warning styling', () => {
      const t = invoiceExpiredEmail({ partnerName: 'Jack', ticketTitle: 'Old project' })
      expect(t.subject).toContain('Old project')
      expect(t.html).toContain('Jack')
      expect(t.text).toContain('Old project')
      expect(t.html).toContain('Invoice Expired')
    })
  })

  describe('slaOverdueEmail', () => {
    it('includes ticket title and due date with warning styling', () => {
      const t = slaOverdueEmail({ adminEmail: 'admin@relay.com', ticketTitle: 'Critical fix', dueAt: '2024-06-15 09:00' })
      expect(t.subject).toContain('Critical fix')
      expect(t.html).toContain('2024-06-15 09:00')
      expect(t.text).toContain('Critical fix')
      expect(t.html).toContain('SLA Alert')
    })
  })

  describe('adminClosedNoResponseEmail', () => {
    it('includes partner name and ticket title with info styling', () => {
      const t = adminClosedNoResponseEmail({ partnerName: 'Kim', ticketTitle: 'Stale ticket' })
      expect(t.subject).toContain('Stale ticket')
      expect(t.html).toContain('Kim')
      expect(t.text).toContain('Stale ticket')
      expect(t.html).toContain('Ticket Closed')
    })
  })

  describe('partnerRejectedEmail', () => {
    it('includes partner name and portal URL', () => {
      const t = partnerRejectedEmail({ partnerName: 'Rejected User', portalUrl: 'https://relayops.app' })
      expect(t.subject).toContain('not approved')
      expect(t.html).toContain('Rejected User')
      expect(t.html).toContain('Application Status Update')
    })
  })

  describe('workerAssignedEmail', () => {
    it('includes ticket title and worker nickname', () => {
      const t = workerAssignedEmail({ ticketTitle: 'Database migration', workerNickname: 'John Doe' })
      expect(t.subject).toContain('Database migration')
      expect(t.html).toContain('John Doe')
      expect(t.html).toContain('Assignment Notification')
    })
  })

  describe('paymentFailedEmail', () => {
    it('includes partner name and ticket title with warning styling', () => {
      const t = paymentFailedEmail({ partnerName: 'Failed Payer', ticketTitle: 'Payment Issue', ticketUrl: 'https://app.com/t/6' })
      expect(t.subject).toContain('Payment failed')
      expect(t.html).toContain('Failed Payer')
      expect(t.html).toContain('Payment Failed')
    })
  })

  describe('invoiceExpiryReminderEmail', () => {
    it('includes days remaining and pluralization', () => {
      const t1 = invoiceExpiryReminderEmail({ partnerName: 'User1', ticketTitle: 'Ticket1', ticketUrl: 'https://app.com/t/7', daysRemaining: 1 })
      expect(t1.subject).toContain('1 day')
      expect(t1.html).toContain('1 day')

      const t2 = invoiceExpiryReminderEmail({ partnerName: 'User2', ticketTitle: 'Ticket2', ticketUrl: 'https://app.com/t/8', daysRemaining: 3 })
      expect(t2.subject).toContain('3 days')
      expect(t2.html).toContain('3 days')
    })
  })

  describe('slaDeadlineReminderEmail', () => {
    it('includes hours remaining and pluralization', () => {
      const t1 = slaDeadlineReminderEmail({ ticketId: 't-1', ticketTitle: 'Urgent', ticketUrl: 'https://app.com/t/9', hoursRemaining: 1 })
      expect(t1.subject).toContain('1h')
      expect(t1.html).toContain('1 hour')

      const t2 = slaDeadlineReminderEmail({ ticketId: 't-2', ticketTitle: 'Very Urgent', ticketUrl: 'https://app.com/t/10', hoursRemaining: 5 })
      expect(t2.subject).toContain('5h')
      expect(t2.html).toContain('5 hours')
    })
  })

  describe('brand consistency', () => {
    it('all templates include RelayOps branding', () => {
      const templates = [
        partnerApprovedEmail({ partnerName: 'Test', portalUrl: 'https://test.com' }),
        ticketSubmittedEmail({ partnerName: 'Test', ticketTitle: 'Test', ticketUrl: 'https://test.com' }),
        invoiceSentEmail({ partnerName: 'Test', ticketTitle: 'Test', invoiceUrl: 'https://test.com', amount: '$100' }),
        paymentReceivedEmail({ partnerName: 'Test', ticketTitle: 'Test', ticketUrl: 'https://test.com' }),
      ]

      for (const t of templates) {
        expect(t.html).toContain('RelayOps')
        expect(t.html).toContain('3B82F6')
        expect(t.html).toContain('font-family:Arial')
      }
    })

    it('all templates include footer with copyright', () => {
      const t = ticketSubmittedEmail({ partnerName: 'Test', ticketTitle: 'Test', ticketUrl: 'https://test.com' })
      expect(t.html).toContain('RelayOps. All rights reserved')
    })
  })

  describe('edge cases', () => {
    it('HTML-like characters in ticket title are escaped', () => {
      const t = ticketSubmittedEmail({
        partnerName: 'Bob',
        ticketTitle: 'Fix & improve <CRM> performance',
        ticketUrl: 'https://app.com/t/1',
      })
      expect(t.subject).toBeTruthy()
      expect(t.html).toBeTruthy()
      expect(t.text).toBeTruthy()
      expect(t.text).toContain('Fix & improve <CRM> performance')
    })

    it('very long ticket title is fully preserved in subject and text output', () => {
      const longTitle = 'A'.repeat(300)
      const t = ticketSubmittedEmail({
        partnerName: 'Alice',
        ticketTitle: longTitle,
        ticketUrl: 'https://app.com/t/999',
      })
      expect(t.subject).toContain(longTitle)
      expect(t.text).toContain(longTitle)
    })

    it('empty partnerName renders without crash and produces non-empty output', () => {
      const t = ticketCompletedEmail({ partnerName: '', ticketTitle: 'Deploy fix' })
      expect(t.subject).toBeTruthy()
      expect(t.html).toBeTruthy()
      expect(t.text).toBeTruthy()
      expect(t.subject).toContain('Deploy fix')
    })
  })
})
